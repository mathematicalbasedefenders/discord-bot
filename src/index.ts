import fs from "fs";
import path from "path";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { log } from "./log";
require("dotenv").config({});

const rawConfig = fs.readFileSync(
	path.join(__dirname, "..", "configuration.json")
);
const configuration = JSON.parse(rawConfig.toString());

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c: any) => {
	log.info(
		`Logged in as ${c.user.tag} with base url ${configuration.baseURL}`
	);
});

client.login(process.env.DISCORD_TOKEN);
