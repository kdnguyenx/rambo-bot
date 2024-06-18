import requests
from dataclasses import dataclass


DISCORD_API_URL = "https://discord.com/api/v10"


@dataclass
class GatewayEvent:
    op: int
    d: object
    s: int
    t: str


def get_gateway_url() -> str | None:
    try:
        r = requests.get(f"{DISCORD_API_URL}/gateway")
        return r.json()["url"]
    except Exception as e:
        print(e)

    return None


if __name__ == "__main__":
    gateway_url = get_gateway_url()
    print(gateway_url)
