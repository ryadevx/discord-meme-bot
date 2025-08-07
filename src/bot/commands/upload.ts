import { Message, Attachment } from 'discord.js';
import { uploadMemee } from '../../controllers/meme.controller.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embedUtils.js';
import { saveAttachment } from '../utils/fileUtils.js';

export async function uploadCommand(msg: Message, args: string[]): Promise<void> {
  if (msg.attachments.size === 0) {
    await msg.reply({
      embeds: [createErrorEmbed('Please attach an image to upload.')]
    });
    return;
  }

  const attachment = msg.attachments.first();
  if (!attachment || !attachment.contentType?.startsWith('image/')) {
    await msg.reply({
      embeds: [createErrorEmbed('Please attach a valid image file.')]
    });
    return;
  }

  let description = '';
  let keywords: string[] = [];

  if (args.length > 0) {
    if (args[0].includes(',')) {
      keywords = args[0].split(',').map(k => k.trim()).filter(Boolean);
      description = args.slice(1).join(' ');
    } else {
      description = args.join(' ');
    }
  }

  const filePath = await saveAttachment(attachment);
  const meme = await uploadMemee(msg.author, filePath, description, keywords);

  const embed = createSuccessEmbed(
    '✅ Meme Uploaded!',
    `**ID:** ${meme._id}\n**Description:** ${description || 'No description'}\n**Keywords:** ${keywords.length > 0 ? keywords.join(', ') : 'None'}`
  );

  await msg.reply({ embeds: [embed] });
}
