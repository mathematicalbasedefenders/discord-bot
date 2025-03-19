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
const months = [
  "Jan.",
  "Feb.",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug.",
  "Sep.",
  "Oct.",
  "Nov.",
  "Dec."
];

function getLevel(experiencePoints: number | undefined) {
  if (typeof experiencePoints !== "number") {
    return {
      level: 0,
      progressToNext: 0
    };
  }
  let level = 0;
  let stock = experiencePoints;
  while (stock > 100 * 1.1 ** level) {
    stock -= 100 * 1.1 ** level;
    level++;
  }
  return {
    level: level,
    progressToNext: stock / (100 * 1.1 ** level + 1)
  };
}

function addCommas(x: any) {
  if (typeof x === "undefined") {
    return undefined;
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getRank(membership: any) {
  // TODO: Refactor this stupid thing already
  if (membership?.isDeveloper) {
    return "Developer";
  }
  if (membership?.isAdministrator) {
    return "Administrator";
  }
  if (membership?.isModerator) {
    return "Moderator";
  }
  if (membership?.isContributor) {
    return "Contributor";
  }
  if (membership?.isTester) {
    return "Tester";
  }
  if (membership?.isDonator) {
    return "Donator";
  }
  // No rank
  return "";
}

function formatJoinDate(toFind: Date) {
  const date = new Date(toFind);
  return `${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

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
