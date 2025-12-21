import { Message } from 'discord.js';
import { uploadCommand } from '../commands/upload.js';
import { searchCommand } from '../commands/search.js';
import { deleteCommand } from '../commands/delete.js';
import { helpCommand } from '../commands/help.js';
import { listCommand } from '../commands/list.js';
import { createErrorEmbed } from '../utils/embedUtils.js';
import type { CommandFunction } from '../types/index.js';

const commands: Record<string, CommandFunction> = {
  '!upload': uploadCommand,
  '!search': searchCommand,
  '!delete': deleteCommand,
  '!help': helpCommand,
  '!list': listCommand,
  '!all': listCommand, // Alias for list command
};

export async function handleCommand(msg: Message): Promise<void> {
  if (msg.author.bot) return; // ignore bots
  if (!msg.content.startsWith('!')) return; // ignore normal messages

  const [cmd, ...args] = msg.content.trim().split(/\s+/);

  const commandHandler = commands[cmd];
  if (!commandHandler) return;

  try {
    await commandHandler(msg, args);
  } catch (error) {
    console.error(`Command "${cmd}" failed:`, error);

    await msg.reply({
      embeds: [
        createErrorEmbed(
          error instanceof Error
            ? error.message
            : 'Unexpected error occurred'
        ),
      ],
    });
  }
}