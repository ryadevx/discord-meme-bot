import { Message } from 'discord.js';
import { uploadMemee } from '../../controllers/meme.controller.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embedUtils.js';

export async function uploadCommand(
  msg: Message,
  args: string[]
): Promise<void> {
  const attachment = msg.attachments.first();

  if (!attachment?.contentType?.startsWith('image/')) {
    await msg.reply({
      embeds: [createErrorEmbed('Attach a valid image')],
    });
    return;
  }

  let description = '';
  let keywords: string[] = [];

  if (args.length) {
    if (args[0].includes(',')) {
      keywords = args[0].split(',').map(k => k.trim());
      description = args.slice(1).join(' ');
    } else {
      description = args.join(' ');
    }
  }

  const meme = await uploadMemee(
  {
    id: msg.author.id,
    username: msg.author.username
  },
  attachment.url,
  description,
  keywords
);

  await msg.reply({
    embeds: [
      createSuccessEmbed(
        '✅ Meme uploaded',
        `ID: ${meme._id}`
      ),
    ],
  });
}
