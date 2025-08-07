import { Message } from 'discord.js';
import { uploadCommand } from '../commands/upload.js';
import { searchCommand } from '../commands/search.js';
import { deleteCommand } from '../commands/delete.js';
import { helpCommand } from '../commands/help.js';
import { createErrorEmbed } from '../utils/embedUtils.js';
import type { CommandFunction } from '../types/index.js';

const commands: Record<string, CommandFunction> = {
  '!upload': uploadCommand,
  '!search': searchCommand,
  '!delete': deleteCommand,
  '!help': helpCommand
};

export async function handleCommand(msg: Message): Promise<void> {
  const content = msg.content.trim();
  const [cmd, ...args] = content.split(/\s+/);

  try {
    const commandHandler = commands[cmd];
    if (commandHandler) {
      await commandHandler(msg, args);
    }
  } catch (error) {
    console.error('Command error:', error);
    const embed = createErrorEmbed(
      error instanceof Error ? error.message : 'An unexpected error occurred.'
    );
    await msg.reply({ embeds: [embed] });
  }
}