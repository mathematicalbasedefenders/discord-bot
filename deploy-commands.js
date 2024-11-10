// FIXME: Doesn't follow discord.js docs

const { REST, Routes } = require("discord.js");
require("dotenv").config({});
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, "dist", "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ("data" in command && "execute" in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
	const pathName = path.join(__dirname, "configuration.json");
	const configurationGuilds = JSON.parse(fs.readFileSync(pathName)).guilds;

	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		);

		// The put method is used to fully refresh all commands in the guild with the current set
		// environment variables
		const data = await rest.put(
			Routes.applicationGuildCommands(
				process.env.DISCORD_CLIENT_ID,
				process.env.DISCORD_GUILD_ID
			),
			{ body: commands }
		);
		// configuration
		for (const guild of configurationGuilds) {
			await rest.put(
				Routes.applicationGuildCommands(
					process.env.DISCORD_CLIENT_ID,
					guild
				),
				{ body: commands }
			);
		}

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`
		);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
