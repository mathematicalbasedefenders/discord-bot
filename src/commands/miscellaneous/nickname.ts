import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nickname")
    .setDescription(
      "Sets the nickname of the bot. Must be the bot's owner to use."
    )
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("The nickname to set the bot to.")
        .setRequired(true)
        .setMaxLength(32)
        .setMinLength(3)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!process.env.DISCORD_BOT_OWNER_ID) {
      await interaction.reply(
        "This bot does not have an owner.\nIf you are the owner, set the environment variable to your user ID."
      );
      return;
    }
    if (interaction.user.id !== process.env.DISCORD_BOT_OWNER_ID) {
      await interaction.reply(
        "Unable to run command: You're not the owner of this bot."
      );
      return;
    }
    // set the bot's nickname
    const guild = interaction.guild;
    if (!guild?.available) {
      await interaction.reply("Unable to run command: Guild does not exist.");
      return;
    }
    const self = await guild.members.fetchMe();
    const newNickname = interaction.options.getString("nickname");
    self.setNickname(newNickname);
    await interaction.reply(
      `Successfully set the bot's nickname to \`${newNickname}\`!`
    );
  }
};
