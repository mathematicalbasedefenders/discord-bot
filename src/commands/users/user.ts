import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption
} from "discord.js";
import fetch from "node-fetch";
import { configuration } from "../../configuration";
import { log } from "../../log";
import { getUserStatisticsCanvas } from "../../canvas/user";

const UserRegEx = /^[0-9a-zA-Z_]+$/;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Gets a user's information.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("username")
        .setDescription("The user to get data of.")
        .setRequired(true)
        .setMaxLength(20)
        .setMinLength(3)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const username = interaction.options.getString("username") ?? "";
    // test if username is valid.
    if (!UserRegEx.test(username)) {
      await interaction.reply(
        `Error: Usernames may only be to 3 to 20 characters long and may only contain alphanumeric characters and/or underscores.`
      );
      return;
    }
    // test if there is data
    const response = await fetch(`${configuration.baseURL}/users/${username}`);
    const data = await response.json();
    if (!data || data === "Not Found.") {
      await interaction.reply(
        `Error: Play data for user ${username} does not exist.\nThis is probably because there is no one with that username.`
      );
      return;
    }
    // format data first
    // general
    try {
      const fileName = await getUserStatisticsCanvas(data);
      await interaction.reply({ files: [fileName] });
    } catch (error: any) {
      await interaction.reply("An error occurred while looking up user data.");
      log.error("An error occurred while looking up user data.");
      log.error(error.stack);
      return;
    }
  }
};
