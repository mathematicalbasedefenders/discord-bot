import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption
} from "discord.js";
import fetch from "node-fetch";
import { configuration } from "../../configuration";
import { log } from "../../log";
import { getUserStatisticsCanvas } from "../../canvas/user";
import fs from "fs";

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
    await interaction.deferReply();
    const username = interaction.options.getString("username") ?? "";
    // test if username is valid.
    if (!UserRegEx.test(username)) {
      await interaction.editReply(
        `Error: Usernames may only be to 3 to 20 characters long and may only contain alphanumeric characters and/or underscores.`
      );
      return;
    }
    // test if there is data
    const response = await fetch(`${configuration.baseURL}/users/${username}`);
    const data = await response.json();
    if (!data || data === "Not Found.") {
      await interaction.editReply(
        `Error: Play data for user ${username} does not exist.\nThis is probably because there is no one with that username.`
      );
      return;
    }
    // format data first
    // general
    try {
      const fileName = await getUserStatisticsCanvas(data);
      await interaction.editReply({ files: [fileName] });
      fs.unlinkSync(fileName);
      log.info(`Deleted file ${fileName}`);
    } catch (error: any) {
      await interaction.editReply(
        "An error occurred while looking up user data. Please try again. If this persists, please contact the bot's owner."
      );
      log.error("An error occurred while looking up user data:");
      log.error(error.stack);
      return;
    }
  }
};
