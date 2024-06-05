import logger from './logger.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readOnceEuroInfoByPath, updateEuroMatch } from './firebase.js';
import { isOneDayAhead } from './helper.js';
import { CronJob } from 'cron';

export function euroDailyMorningJob(client) {
  return CronJob.from({
    cronTime: '0 0 1 * * *',
    // cronTime: '0,30 * * * * *',
    onTick: async () => {
      try {
        const resp = await readOnceEuroInfoByPath('matches');
        const matches = resp.val().filter((match) => {
          const date = new Date(Date.parse(match.date));
          return isOneDayAhead(date);
        });
        const channel = await client.channels.fetch(process.env.FOOTBALL_CHANNEL_ID);
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
    timeZone: 'utc',
  });
}

function matchVoteMessageComponent(match) {
  const home = new ButtonBuilder()
    .setCustomId(`${match.home}_${match.id}_${match.date}`)
    .setLabel(match.home.toUpperCase())
    .setStyle(ButtonStyle.Success);

  const draw = new ButtonBuilder()
    .setCustomId(`draw_${match.id}_${match.date}`)
    .setLabel('DRAW')
    .setStyle(ButtonStyle.Primary);

  const away = new ButtonBuilder()
    .setCustomId(`${match.away}_${match.id}_${match.date}`)
    .setLabel(match.away.toUpperCase())
    .setStyle(ButtonStyle.Danger);

  const embed = new EmbedBuilder()
    .setTitle(`${match.home.toUpperCase()} vs. ${match.away.toUpperCase()}`)
    .setDescription(`Time: **${(new Date(match.date)).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}**`)
    .setFields(
      {
        name: ' Odds ',
        value: `Home: \`${match.odds.home}\`  Draw: \`${match.odds.draw}\`  Away: \`${match.odds.away}\``,
        inline: false,
      },
      {
        name: ' Location ',
        value: match.location,
        inline: false,
      },
    );

  const row = new ActionRowBuilder()
    .addComponents(home, draw, away);

  return {
    embeds: [embed],
    components: [row],
  };
}
