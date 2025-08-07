import { Message } from 'discord.js';
import { deleteMeme } from '../../controllers/meme.controller.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embedUtils.js';

export async function deleteCommand(msg: Message, args: string[]): Promise<void> {
  if (args.length === 0) {
    await msg.reply({ embeds: [createErrorEmbed('Please provide a meme ID to delete.')] });
    return;
  }

  const memeId = args[0];
  await deleteMeme(msg.author, memeId);
  
  const embed = createSuccessEmbed('Deleted!', `Meme ${memeId} has been deleted.`);
  await msg.reply({ embeds: [embed] });
}
