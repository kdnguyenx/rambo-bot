import json
import logging
import asyncio
import websockets
import requests
import traceback
import math
import random

from dataclasses import dataclass
from websockets.client import WebSocketClientProtocol
from settings import Config
from domains.opcode import Opcode


logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


@dataclass
class GatewayMessage:
    op: int
    d: object
    s: int
    t: str


class GatewayClient:
    def __init__(self, token) -> None:
        logger.info("Initialize Gateway Connection")
        self._token: str = token
        self._ws: WebSocketClientProtocol | None = None
        self._alive: bool = True
        self._gateway_url: str = self._fetch_gateway_url()
        self._resume_gateway_url: str | None = None
        self._session_id: str | None = None
        self._pulse: int = 1
        self._seq: int | None = None

    @staticmethod
    def _fetch_gateway_url() -> str:
        r = requests.get(f"{Config.API_URL}/v{Config.API_VERSION}/gateway")
        r.raise_for_status()
        return r.json()["url"]

    async def _open_connection(self) -> None:
        logger.info("Connecting to Discord Gateway")
        ws_url = f"{self._gateway_url}/?v={Config.API_VERSION}&encoding=json"
        self._ws = await websockets.connect(ws_url);

        response = await asyncio.wait_for(self._ws.recv(), timeout=5)
        response = json.loads(response)
        print(response)

        if not response or response['op'] != Opcode.HELLO.value:
            logger.error('Something wrong happened!')
            self._alive = False
            return

        self._pulse = response["d"]["heartbeat_interval"] // 1000

        await self._handshake()
        asyncio.create_task(self._heartbeat_loop())

    async def _heartbeat_loop(self) -> None:
        assert self._ws is not None
        logger.info("Starting Heartbeat loop")

        while self._alive:
            try:
                await asyncio.sleep(self._pulse)
                msg = { "op": Opcode.HEARTBEAT.value, "d": self._seq }
                await self._ws.send(json.dumps(msg))

                res = await asyncio.wait_for(self._ws.recv(), timeout=2)
                res = json.loads(res)
                self._seq = res["s"]
                print(res["op"])

                # if not response or response["op"] != Opcode.HEARTBEAT_ACK.value:
                #     logger.error("Heartbeat acknowledgement failed!")
                #     break
            except Exception as e:
                logger.error(f"Exception in heartbeat loop: {e}")
                traceback.print_exc()

    async def _handshake(self) -> None:
        assert self._ws is not None
        logger.info("Starting handshake")

        if self._alive:
            try:
                msg = {
                    "op": Opcode.IDENTIFY.value,
                    "d": {
                        "token": self._token,
                        "intents": 513,
                        "properties": {
                            "os": "linux",
                            "browser": "my_library",
                            "device": "my_library"
                        }
                    }
                }
                await self._ws.send(json.dumps(msg))

                res = await asyncio.wait_for(self._ws.recv(), timeout=5)
                res = json.loads(res)

                if not res or res["t"] != "READY" or res["op"] != Opcode.DISPATCH.value:
                    logger.error("Handshake failed!")

                self._seq = res["s"]
                self._resume_gateway_url = res["d"]["resume_gateway_url"]
                self._session_id = res["d"]["session_id"]
            except Exception as e:
                logger.error(f"Exception in handshake: {e}")
                traceback.print_exc()

    def run(self) -> None:
        asyncio.ensure_future(self._open_connection())
        asyncio.get_event_loop().run_forever()


if __name__ == "__main__":
    client = GatewayClient(Config.TOKEN)
    client.run()
