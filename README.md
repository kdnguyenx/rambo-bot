# Rambo Bot
My Discord bot, its name is Rambo

## Requirements
In able to run project, make sure `python 3.10` or above is installed.

Clone repository by `git clone` to your local computer:
```shell script
$ git clone git@github.com:khoanduy/rambo-bot.git
$ cd rambo-bot
```

You need to add these following values to `.env` file (recommended)
```
TOKEN=[your_bot_token]
APP_ID=[your_bot_application_id]
GUILD_ID=[your_guild_id]
CHANNEL_ID=[your_target_channel_id]
DEV_CHANNEL_ID=[your_development_channel_id]
FOOTBALL_CHANNEL_ID=[your_football_specific_channel_id]
VOICE_CHANNEL_ID=[your_target_voice_channel_id]
AUDITED_USERS=[list_of_users_separated_by_comma]
FIREBASE_DB_URL=[your_firebase_realtime_database_url]
FIREBASE_SERVICE_ACCOUNT_PATH=[path_to_firebase_service_account_json_file]
```

## Build and run
Install `uv` Python package installer and resolver
```shell script
$ curl -LsSf https://astral.sh/uv/install.sh | sh
```

Create a new virtual environment:
```shell script
$ uv venv
$ source .venv/bin/activate
```

Install all dependencies:
```shell script
$ uv pip install -r requirements.txt
```

## Release
TBA

## Additional Notes
To add new dependencies, specify them in `pyproject.toml` then run to generate lock file:
```shell script
$ uv pip compile pyproject.toml -o requirements.txt
```

## References
[discord.py](https://discordpy.readthedocs.io/en/stable/index.html) \
[uv](https://github.com/astral-sh/uv)
