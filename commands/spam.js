const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spam')
    .setDescription('Spam a specific user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to spam')
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.get('user').user;
    await interaction.reply(`${user} `.repeat(20));
  },
};
