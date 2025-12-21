import { Message } from 'discord.js';
import { deleteMeme } from '../../controllers/meme.controller.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embedUtils.js';

export async function deleteCommand(
  msg: Message,
  args: string[]
): Promise<void> {
  if (!args[0]) {
    await msg.reply({
      embeds: [createErrorEmbed('Provide meme ID')],
    });
    return;
  }

  try {
    console.log('🔍 Delete command called');
    console.log('   User:', msg.author.username, '(' + msg.author.id + ')');
    console.log('   Meme ID:', args[0]);

    await deleteMeme(
      {
        id: msg.author.id,
        username: msg.author.username,
      },
      args[0]
    );

    console.log('✅ Delete successful');

    await msg.reply({
      embeds: [createSuccessEmbed('🗑 Meme deleted')],
    });
  } catch (err) {
    console.error('❌ Delete error:', err);

    await msg.reply({
      embeds: [
        createErrorEmbed(
          err instanceof Error ? err.message : 'Delete failed'
        ),
      ],
    });
  }
}
