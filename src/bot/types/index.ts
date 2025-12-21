import { Message } from 'discord.js';


export interface DiscordUser {
  id: string;
  username: string;
}

export interface DiscordUserDTO {
  id: string;
  username: string;
}

export type CommandFunction = (
  msg: import('discord.js').Message,
  args: string[]
) => Promise<void>;
