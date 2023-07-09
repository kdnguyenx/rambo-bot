const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spam')
    .setDescription('Spam a specific user'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  },
};
