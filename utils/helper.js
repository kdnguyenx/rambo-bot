const logger = require('../utils/logger');
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

module.exports = {
  fetchDiscordUsers,
};
