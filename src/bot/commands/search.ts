import { Message, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { searchMemes } from '../../controllers/meme.controller.js';
import { createErrorEmbed } from '../utils/embedUtils.js';
import fs from 'fs/promises';
import path from 'path';

export async function searchCommand(msg: Message, args: string[]): Promise<void> {
  if (args.length === 0) {
    await msg.reply({ embeds: [createErrorEmbed('Please provide search terms.')] });
    return;
  }

  const results = await searchMemes(msg.author, args);
  
  if (results.length === 0) {
    await msg.reply({ embeds: [createErrorEmbed('No memes found.')] });
    return;
  }

  const limitedResults = results.slice(0, 3);
  
  for (const meme of limitedResults) {
    try {
      const imageBuffer = await fs.readFile(meme.imagePath);
      const attachment = new AttachmentBuilder(imageBuffer, { 
        name: path.basename(meme.imagePath) 
      });
      
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🖼️ Meme')
        .setDescription(meme.description || 'No description')
        .addFields(
          { name: 'Keywords', value: meme.keywords.join(', ') || 'None' },
          { name: 'ID', value: meme._id.toString() }
        )
        .setImage(`attachment://${path.basename(meme.imagePath)}`);

      await msg.reply({ embeds: [embed], files: [attachment] });
    } catch (fileError) {
      console.error('Error reading meme file:', fileError);
    }
  }

  if (results.length > 3) {
    await msg.reply(`Found ${results.length} total results. Showing first 3.`);
  }
}