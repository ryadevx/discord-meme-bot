import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { connectDB } from '../config/db.js';
import { handleCommand } from './handlers/commandHandler.js';

config();
connectDB();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', async () => {
  console.log(`bot is running as ${client.user?.tag}`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.content.startsWith('!')) return;
  await handleCommand(msg);
});

client.on('error', (error) => {
  console.error('discord client error', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandled rejection at', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('uncaught exception', error);
  process.exit(1);
});

client.login(process.env.BOT_TOKEN);