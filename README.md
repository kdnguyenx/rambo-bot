# rambo-bot
My Discord bot, its name is Rambo

## Requirements
In able to run project, make sure `node 18.16.0` or above is installed.

Clone repository by `git clone` to your local computer:
```shell script
$ git clone git@github.com:samothrakii/rambo-bot.git
$ cd rambo-bot
```

You need to add these following values to `config.json` file (recommended) or you can use `.env` as an alternative
```json
{
  "token": "<your_bot_token>",
  "appId": "<your_bot_application_id>",
  "guildId": "<your_guild_id>",
  "channelId": "<your_target_channel_id>",
  "devChannelId": "<your_development_channel_id>",
  "voiceChannelId": "<your_target_voice_channel_id>",
  "voiceChannelLink": "<your_target_voice_channel_link>",
  "virusTotalApiKey": "<virus_total_api_key>"
}
```

## Build and run
Install all dependencies:
```shell script
$ npm install
```
Compile and run your bot locally:
```shell script
$ npm start
```

## Release
TBA

## References
[discordjs](https://discordjs.guide)
