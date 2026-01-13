import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { handleCommand } from "./handlers/commandHandler.js";

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", () => {
  console.log(`bot is running as ${client.user?.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith("!")) return;
  await handleCommand(msg);
});

client.on("error", console.error);

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

client.login(process.env.BOT_TOKEN);

// connect DB AFTER Discord login
(async () => {
  await connectDB();
})();

// graceful shutdown
const shutdown = async () => {
  console.log("Shutting down...");

  if (client.isReady()) {
    await client.destroy();
    console.log("Discord disconnected");
  }

  await mongoose.connection.close();
  console.log("MongoDB closed");

  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
