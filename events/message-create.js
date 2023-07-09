const { Events } = require('discord.js');
const logger = require('../utils/logger');
const { extractUrlsFromString, urlSafetyCheck } = require('../utils/helper');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    logger.debug(`Received message [${message.content}]`);
    const urls = extractUrlsFromString(message.content);

    const safe = [];
    const unsafe = [];

    if (urls.length > 0) {
      for (const url of urls) {
        const result = await urlSafetyCheck(url);
        if (result) {
          safe.push(url);
        } else {
          unsafe.push(url);
        }
      }

      let msg = 'Link(s) ';
      if (safe.length > 0) {
        msg += 'safe to click\n';
      }

      if (unsafe.length > 0) {
        msg += unsafe.join(', ');
        msg += ' NOT SAFE, watch out @here';
      }

      message.channel.send(msg);
    }
  },
};
