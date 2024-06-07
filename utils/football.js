import logger from './logger.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readOnceEuroInfoByPath, updateEuroMatch, updatePlayerPoints } from './firebase.js';
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

export function euroDailyCalculatingJob() {
  return CronJob.from({
    cronTime: '0 0 3,15 * * *',
    // cronTime: '15,45 * * * * *',
    onTick: async () => {
      try {
        const resp = await readOnceEuroInfoByPath('matches');
        const matches = resp.val().filter((match) => {
          return match.hasResult && !match.isCalculated;
        });

        if (matches.length === 0) {
          logger.warn('No match to calculate!');
          return;
        }

        const votingObj = (await readOnceEuroInfoByPath('votes')).val();
        const players = (await readOnceEuroInfoByPath('players')).val();

        for (const match of matches) {
          if (!match.messageId) {
            logger.warn(`Skipped match ${match.id} due to empty message ID, consider to update manually.`);
            continue;
          }

          const key = `${match.id - 1}`;
          if (key in votingObj) {
            if (match.messageId in votingObj[key]) {
              const votes = votingObj[key][match.messageId];
              const votedPlayers = await calculatePlayerPoints(players, votes, match);
              await calculateNoVotedPlayerPoints(players, match, votedPlayers);
              await updateEuroMatch(match, { isCalculated: true });
            } else {
              logger.warn(`Match ${match.id} message ID is not correct, consider to update manually!`);
            }
          } else {
            logger.warn(`Match ${match.id} has not been voted yet!`);
          }
        }

        logger.info(`Calculated ${matches.length} matche(s) successfully`);
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

function matchWinner(match) {
  if (match.result.home > match.result.away) {
    return match.home;
  } else if (match.result.home < match.result.away) {
    return match.away;
  } else {
    return 'draw';
  }
}

function winnerOdds(match, winner) {
  if (winner === match.home) {
    return match.odds.home;
  } else if (winner === match.away) {
    return match.odds.away;
  }
  return match.odds.draw;
}

async function calculatePlayerPoints(players, votes, match) {
  const winner = matchWinner(match);
  const odds = winnerOdds(match, winner);
  const votedPlayers = [];

  for (const [k, v] of Object.entries(votes)) {
    votedPlayers.push(k);
    await updatePlayerPoints(k, {
      matches: players[k].matches + 1,
      points: v.vote === winner ? players[k].points + 1 + odds : players[k].points - 1,
    });
  }

  return votedPlayers;
}

async function calculateNoVotedPlayerPoints(players, match, votedPlayers) {
  const result = [match.home, 'draw', match.away];
  console.log(result);

  const winner = matchWinner(match);
  const odds = winnerOdds(match, winner);

  for (const [k, v] of Object.entries(players)) {
    const rand = result[Math.floor(Math.random() * result.length)];
    if (!votedPlayers.includes(k)) {
      await updatePlayerPoints(k, {
        matches: v.matches + 1,
        points: rand === winner ? v.points + 1 + odds : v.points - 1,
      });
    }
  }
}
