import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { readOnceEuroInfoByPath } from '../utils/firebase.js';
import logger from '../utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('euro-history')
  .setDescription('Euro 2024 player vote history');

export async function execute(interaction) {
  try {
    const matches = (await readOnceEuroInfoByPath('matches'))
      .val().filter((match) => match.hasResult);
    const votes = (await readOnceEuroInfoByPath('votes')).val();
    const users = interaction.client.cachedUsers;

    const embeds = [];
    matches.forEach((match) => {
      const matchId = `${match.id - 1}`;
      if (matchId in votes && match.messageId in votes[matchId]) {
        const embed = new EmbedBuilder()
          .setTitle(`Match ${matchId}: ${match.home.toUpperCase()} vs. ${match.away.toUpperCase()}`)
          .setDescription(`Odds: \`${match.odds.home}\` - \`${match.odds.draw}\` - \`${match.odds.away}\``);

        for (const [k, v] of Object.entries(votes[matchId][match.messageId])) {
          embed.addFields({
            name: users[k].nickname,
            value: v.vote.toUpperCase(),
            inline: true,
          });
        }

        embeds.push(embed);
      }
    });

    interaction.reply({
      content: 'EURO Vote History',
      embeds: embeds
    });
  } catch (err) {
    logger.error(err);
  }
}
