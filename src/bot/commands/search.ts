import { Message, EmbedBuilder } from 'discord.js';
import { searchMemes } from '../../controllers/meme.controller.js';
import { createErrorEmbed } from '../utils/embedUtils.js';

export async function searchCommand(
  msg: Message,
  args: string[]
): Promise<void> {
  if (args.length === 0) {
    await msg.reply({
      embeds: [createErrorEmbed('Please provide search terms.')],
    });
    return;
  }

  try {
    const results = await searchMemes(args);  // ← FIXED: Remove msg.author

    if (results.length === 0) {
      await msg.reply({
        embeds: [createErrorEmbed('No memes found.')],
      });
      return;
    }

    const limitedResults = results.slice(0, 3);

    for (const meme of limitedResults) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🖼️ Meme')
        .setDescription(meme.description || 'No description')
        .addFields(
          {
            name: 'Keywords',
            value: meme.keywords.length ? meme.keywords.join(', ') : 'None',
          },
          {
            name: 'ID',
            value: meme._id.toString(),  // ← Also convert ObjectId to string
          },
          {
            name: 'Uploaded by',
            value: meme.createdBy?.username ?? "Unknown",  // ← Show who uploaded it
          }
        )
        .setImage(meme.imageUrl)
        .setTimestamp(meme.createdAt);  // ← Show when it was uploaded

      await msg.reply({ embeds: [embed] });
    }

    if (results.length > 3) {
      await msg.reply(
        `Found ${results.length} results. Showing first 3.`
      );
    }
  } catch (err) {
    console.error(err);
    await msg.reply({
      embeds: [
        createErrorEmbed(
          err instanceof Error ? err.message : 'Search failed'
        ),
      ],
    });
  }
}