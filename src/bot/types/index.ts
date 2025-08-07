import { Message } from 'discord.js';

export type CommandFunction = (msg: Message, args: string[]) => Promise<void>;

export interface DiscordUser {
  id: string;
  username: string;
}
