import fs from "fs";
import path from "path";
import {
  ActivityType,
  ChatInputCommandInteraction,
  Client,
  Collection,
  Events,
  GatewayIntentBits
} from "discord.js";
import { configuration } from "./configuration";
import { log } from "./log";
require("dotenv").config({});

class BotClient extends Client {
  public commands: Collection<string, any>;

  constructor(options: any) {
    super(options);
    this.commands = new Collection();
  }
}

const client: any = new BotClient({
  intents: [GatewayIntentBits.Guilds]
});
client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      log.info(`Loaded command ${command.data.name} to bot.`);
    } else {
      log.warn(
        `The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.once(Events.ClientReady, (event: any) => {
  log.info(
    `Logged in as ${event.user.tag} with base url ${configuration.baseURL}`
  );

  client.user.setPresence({
    activities: [
      {
        name: `Mathematical Base Defenders`,
        type: ActivityType.Watching
      }
    ]
  });
});

client.on(
  Events.InteractionCreate,
  async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = (interaction.client as any).commands.get(
      interaction.commandName
    );

    if (!command) {
      log.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      log.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true
        });
      }
    }
  }
);

client.login(process.env.DISCORD_TOKEN);
