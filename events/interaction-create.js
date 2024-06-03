import logger from '../utils/logger.js';
import { Events } from 'discord.js';
import { updateEuroMatchVote, readOnceEuroMatchVotes } from '../utils/firebase.js';

export const name = Events.InteractionCreate;
export async function execute(interaction) {
  if (interaction.isButton()) {
    const voteMatchId = interaction.customId.split('_');
    try {
      await updateEuroMatchVote(voteMatchId[1], interaction.user.id, voteMatchId[0], interaction.message.id);
      const users = interaction.client.cachedUsers;
      const votes = (await readOnceEuroMatchVotes(voteMatchId[1], interaction.message.id)).val();
      const members = [];
      for (const [key, _] of Object.entries(votes)) {
        members.push(users[key].nickname);
      }
      interaction.update({
        content: `Voted: ${members.join(',')}`,
      });
    } catch (err) {
      logger.error(err);
    }
  }

  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Error executing ${interaction.commandName}`);
      logger.error(error);
    }
  }
}
