const { Events } = require('discord.js');
const logger = require('../utils/logger');
const { extractUrlsFromString, urlSafetyCheck } = require('../utils/helper');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    logger.debug(`Received message [${message.content}]`);
    // message.channel.send(msg);
  },
};
