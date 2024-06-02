const logger = require('./logger');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { readOnceEuroInfoByPath, updateEuroMatch } = require('./firebase');
const { isOneDayAhead } = require('./helper');
const { CronJob } = require('cron');
const { footballChannelId, devChannelId } = require('../config.json');

const euroDailyMorningJob = (client) => {
  return CronJob.from({
     cronTime: '0 30 * * * *',
    // cronTime: '10 * * * * *',
    onTick: async () => {
      try {
        const resp = await readOnceEuroInfoByPath('matches');
        const matches = resp.val().filter((match) => {
          const date = new Date(Date.parse(match.date));
          return isOneDayAhead(date);
        });
        const channel = await client.channels.fetch(footballChannelId);
        matches.forEach((match) => {
          const message = matchVoteMessageComponent(match);
          channel.send(message).then((msg) => {
            logger.info(`Match between ${match.home} and ${match.away} is sent with message ID [${msg.id}]`);
            updateEuroMatch(match, { 'messageId': msg.id });
          });
        });
      } catch (err) {
        logger.error(err);
      }
    },
    start: true,
    timeZone: 'utc'
  });
};

const matchVoteMessageComponent = (match) => {
  const home = new ButtonBuilder()
    .setCustomId(`${match.home}_${match.id}`)
    .setLabel(match.home.toUpperCase())
    .setStyle(ButtonStyle.Success);

  const draw = new ButtonBuilder()
    .setCustomId(`draw_${match.id}`)
    .setLabel('DRAW')
    .setStyle(ButtonStyle.Primary);

  const away = new ButtonBuilder()
    .setCustomId(`${match.away}_${match.id}`)
    .setLabel(match.away.toUpperCase())
    .setStyle(ButtonStyle.Danger);

  const embed = new EmbedBuilder()
    .setTitle(`${match.home.toUpperCase()} vs. ${match.away.toUpperCase()}`)
    .setDescription(`Time: **${(new Date(match.date)).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}**`)
    .setFields(
      {
        name: ` Odds `,
        value: `Home: \`${match.odds.home}\`  Draw: \`${match.odds.draw}\`  Away: \`${match.odds.away}\``,
        inline: false
      },
      {
        name: ' Location ',
        value: match.location,
        inline: false
      }
    );

  const row = new ActionRowBuilder()
    .addComponents(home, draw, away);

  return {
    embeds: [embed],
    components: [row],
  }
}

module.exports = {
  euroDailyMorningJob,
};
