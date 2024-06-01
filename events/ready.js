const { Events } = require('discord.js');
const logger = require('../utils/logger');
const { syncDiscordUsers } = require('../utils/firebase');


module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    logger.info(`Ready! Logged in as ${client.user.tag}`);

    syncDiscordUsers(client);
  },
};
