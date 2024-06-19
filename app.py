import json
import logging
import asyncio
import websockets
import requests
from dataclasses import dataclass
from settings import Config
from domains.opcode import Opcode
import random
import math


logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# class Opcode(Enum):
#     DISPATCH = 0
#     HEARTBEAT = 1
#     IDENTIFY = 2
#     INVALID_SESSION = 9
#     HELLO = 10
#     HEARTBEAT_ACK = 11


@dataclass
class GatewayMessage:
    op: int
    d: object
    s: int
    t: str

class GatewayConnector:
    def __init__(self, token) -> None:
        self._token = token

    def run(self):
        asyncio.ensure_future(main())
        asyncio.get_event_loop().run_forever()
        # loop = asyncio.get_event_loop()
        # loop.run_until_complete(main())

async def get_gateway_url() -> str | None:
    try:
        r = requests.get(f"{Config.API_URL}/v{Config.API_VERSION}/gateway")
        return r.json()["url"]
    except Exception as e:
        logger.error(e)

    return None


async def main():
    gateway_url = await get_gateway_url()
    ws_url = f"{gateway_url}/?v={Config.API_VERSION}&encoding=json"
    async with websockets.connect(ws_url) as ws:
        response = await asyncio.wait_for(ws.recv(), timeout=2)
        response = json.loads(response)

        if not response or response['op'] != Opcode.HELLO.value:
            logger.error('Something wrong happened!')
            return

        print(response)
        heartbeat_interval = response["d"]["heartbeat_interval"]
        wait_interval = math.floor((heartbeat_interval * random.random()) / 1000)
        sequence = None
        print(wait_interval)
        await asyncio.sleep(wait_interval)
        while True:
            try:
                payload = {
                    "op": Opcode.HEARTBEAT.value,
                    "d": sequence,
                }
                await ws.send(json.dumps(payload))
                response = await asyncio.wait_for(ws.recv(), timeout=2)
                response = json.loads(response)

                if not response or response["op"] != Opcode.HEARTBEAT_ACK.value:
                    logger.error('Something wrong happened!')
                    break

                print(response)
                sequence = response["s"]
                await asyncio.sleep(heartbeat_interval // 1000)
            except Exception as e:
                logger.error(e)


if __name__ == "__main__":
    asyncio.ensure_future(main())
    asyncio.get_event_loop().run_forever()
    # conn = GatewayConnector(Config.TOKEN)
    # conn.run()
