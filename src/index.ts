import { Client, Events, GatewayIntentBits } from "discord.js";
import { log } from "./log";
require("dotenv").config({});
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c: any) => {
	log.info(`Logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
