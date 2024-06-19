import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    API_URL = os.getenv("DISCORD_API_URL")
    API_VERSION = os.getenv("DISCORD_API_VERSION")
