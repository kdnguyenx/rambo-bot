const logger = require('./logger');
const { guildId, auditedUsers } = require('../config.json');

const fetchDiscordUsers = async (client) => {
  try {
    const guild = await client.guilds.fetch(guildId);
    const guildMembers = await guild.members.fetch({ user: auditedUsers.split(','), withPresences: true });
    const members = {}
    for (const entry of guildMembers.entries()) {
      members[entry[0]] = {
        id: entry[1].user.id,
        username: entry[1].user.username,
        globalName: entry[1].user.globalName,
        nickname: entry[1].nickname,
        avatar: entry[1].user.avatar,
      };
    }
    return members;
  } catch (err) {
    logger.error(err);
  }

  return {}
};

const isOneDayAhead = (date) => {
  // const afterToday = new Date(Date.now() + (24 * 60 * 60 * 1000));
  const afterToday = new Date(Date.parse('2024-06-13T01:00:00Z') + (24 * 60 * 60 * 1000));
  return afterToday.getUTCFullYear() === date.getUTCFullYear() &&
    afterToday.getUTCMonth() === date.getUTCMonth() &&
    afterToday.getUTCDate() === date.getUTCDate();
}

module.exports = {
  fetchDiscordUsers,
  isOneDayAhead
};
