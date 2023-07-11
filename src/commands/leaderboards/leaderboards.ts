import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
import { configuration } from "../../configuration";
import { log } from "../../log";
import _ from "lodash";

function addCommas(x: any) {
	if (typeof x === "undefined") {
		return undefined;
	}
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatLeaderboardsString(data: any, mode: string) {
	let rankPadding = data.length >= 10 ? 1 : 0;
	let usernamePadding = data
		.map((element: any) => element.username.length)
		.reduce((a: number, b: number) => Math.max(a, b), -Infinity);
	let scorePadding = data
		.map((element: any) => addCommas(element.statistics.score).length)
		.reduce((a: number, b: number) => Math.max(a, b), -Infinity);
	// create string
	let string = `${_.startCase(mode)} Singleplayer Leaderboards\n\`\`\`ansi\n`;
	for (let i = 0; i < Math.min(data.length, 25); i++) {
		const rank = `#${i + 1}`.padStart(rankPadding, " ");
		const username = `${data[i].username}`.padEnd(usernamePadding, " ");
		const score = `${addCommas(data[i].statistics.score)}`.padStart(
			scorePadding,
			" "
		);
		string += `${rank} ${username} ${score}\n`;
	}
	string += `\`\`\``;
	if (data.length > 25) {
		string += `\nOnly Top 25 shown.`;
	}
	return string;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leaderboards")
		.setDescription("Shows the leaderboards for a Singleplayer mode.")
		.addStringOption((option) =>
			option
				.setName("mode")
				.setDescription("The mode to get data of.")
				.setRequired(true)
				.setMaxLength(20)
				.setMinLength(3)
		),
	async execute(interaction: any) {
		const mode = interaction.options.getString("mode");
		// test if username is valid.
		if (mode !== "easy" && mode !== "standard") {
			await interaction.reply(
				`Error: Mode can only be \`easy\` or \`standard\`.`
			);
			return;
		}
		// test if there is data
		const response = await fetch(
			`${configuration.baseURL}/leaderboards/${mode}`
		);
		const data = await response.json();
		// check if there is no one
		if (data.length === 0) {
			await interaction.reply(
				`There is currently no one on the leaderboards.`
			);
			return;
		}
		await interaction.reply(formatLeaderboardsString(data, mode));
		return;
	},
};
