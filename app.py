import os
import json
import logging
import asyncio
from sys import api_version
import websockets
import requests
from dataclasses import dataclass
from settings import Config


logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


@dataclass
class GatewayEvent:
    op: int
    d: object
    s: int
    t: str


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
        async for msg in ws:
            print(json.loads(msg))


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
