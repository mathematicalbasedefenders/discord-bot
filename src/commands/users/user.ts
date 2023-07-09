import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
import { configuration } from "../../configuration";
import { log } from "../../log";

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
	"Dec.",
];

function getLevel(experiencePoints: number | undefined) {
	if (typeof experiencePoints !== "number") {
		return {
			level: 0,
			progressToNext: 0,
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
		progressToNext: stock / (100 * 1.1 ** level + 1),
	};
}

function addCommas(x: any) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getRank(membership: any) {
	// TODO: Refactor this stupid thing already
	if (membership?.isDeveloper) {
		return "[D]";
	}
	if (membership?.isAdministrator) {
		return "[A]";
	}
	if (membership?.isModerator) {
		return "[M]";
	}
	if (membership?.isContributor) {
		return "[C]";
	}
	if (membership?.isTester) {
		return "[T]";
	}
	if (membership?.isDonator) {
		return "[$]";
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
		.addStringOption((option) =>
			option
				.setName("username")
				.setDescription("The user to get data of.")
				.setRequired(true)
				.setMaxLength(20)
				.setMinLength(3)
		),
	async execute(interaction: any) {
		const username = interaction.options.getString("username");
		// test if username is valid.
		if (!UserRegEx.test(username)) {
			await interaction.reply(
				`Error: Usernames may only be to 3 to 20 characters long and may only contain alphanumeric characters and/or underscores.`
			);
			return;
		}
		// test if there is data
		const response = await fetch(
			`${configuration.baseURL}/users/${username}`
		);
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
			const stats = data.statistics;
			const level = addCommas(
				getLevel(stats.totalExperiencePoints).level
			);
			const formattedEXP = addCommas(stats.totalExperiencePoints);
			const joinDateString = formatJoinDate(data.creationDateAndTime);
			const rankString = getRank(data.membership);
			// scores - singleplayer
			const easySingleString =
				addCommas(
					stats.personalBestScoreOnEasySingleplayerMode.score
				) ?? "N/A";
			const standardSingleString =
				addCommas(
					stats.personalBestScoreOnStandardSingleplayerMode.score
				) ?? "N/A";
			const easyRankString = stats.personalBestScoreOnEasySingleplayerMode
				.globalRank
				? `(#${stats.personalBestScoreOnEasySingleplayerMode.globalRank})`
				: "";
			const standardRankString = stats
				.personalBestScoreOnStandardSingleplayerMode.globalRank
				? `(#${stats.personalBestScoreOnStandardSingleplayerMode.globalRank})`
				: "";
			// scores - multiplayer
			const multiWins = stats.multiplayer.gamesWon;
			const multiPlays = stats.multiplayer.gamesPlayed;
			const winRatio = multiPlays === 0 ? 0 : multiWins / multiPlays;
			const winRatioString = (winRatio * 100).toFixed(3);
			// there is data, now parse it
			await interaction.reply(
				`${rankString} **${username}** | **Play Data**\nLevel **${level}** (${formattedEXP}EXP)\nJoined **${joinDateString}**\nEZ-SP: **${easySingleString} ${easyRankString}** ST-SP: **${standardSingleString} ${standardRankString}**\nMP: **${winRatioString}%** (${addCommas(
					multiWins
				)}/${addCommas(multiPlays)})`
			);
		} catch (error: any) {
			await interaction.reply(
				"An error occurred while looking up user data."
			);
			log.error("An error occurred while looking up user data.");
			log.error(error.stack);
			return;
		}
	},
};
