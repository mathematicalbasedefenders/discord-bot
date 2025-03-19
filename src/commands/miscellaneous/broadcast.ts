import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandStringOption,
  TextChannel
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("broadcast")
    .setDescription(
      "Makes the bot say a message. Must be the bot's owner to use."
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("message")
        .setDescription("The message for the bot to say.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!process.env.DISCORD_BOT_OWNER_ID) {
      await interaction.reply(
        "This bot does not have an owner.\nIf you are the owner, set the environment variable to your user ID."
      );
      return;
    }
    if (interaction.user.id !== process.env.DISCORD_BOT_OWNER_ID) {
      await interaction.reply({
        content: "Unable to run command: You're not the owner of this bot.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    // set the bot's nickname
    const guild = interaction.guild;
    if (!guild?.available) {
      await interaction.reply("Unable to run command: Guild does not exist.");
      return;
    }
    const channel = interaction.channel;
    if (!(channel instanceof TextChannel)) {
      await interaction.reply(
        "Unable to run command: Channel is not a text channel or doesn't exist."
      );
      return;
    }
    const message = interaction.options.getString("message");
    if (!message) {
      await interaction.reply("Unable to run command: `message` is empty.");
      return;
    }
    await interaction.reply({
      content: "Sent message!",
      flags: MessageFlags.Ephemeral
    });
    channel.send(message);
  }
};
