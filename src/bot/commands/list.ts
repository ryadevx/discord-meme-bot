import {
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { getAllMemes } from '../../controllers/meme.controller.js';
import { createErrorEmbed } from '../utils/embedUtils.js';

export async function listCommand(msg: Message): Promise<void> {
  try {
    const allMemes = await getAllMemes();

    if (allMemes.length === 0) {
      await msg.reply({
        embeds: [createErrorEmbed('No memes found in the database.')],
      });
      return;
    }

    let currentIndex = 0;
    const totalMemes = allMemes.length;

    const generateEmbed = (index: number): EmbedBuilder => {
      const meme = allMemes[index];

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`🖼️ Meme ${index + 1} of ${totalMemes}`)
        .setDescription(meme.description || 'No description')
        .setImage(meme.imageUrl)
        .setFooter({ 
          text: `Created ${new Date(meme.createdAt).toLocaleDateString()}` 
        })
        .setTimestamp();

      // Add fields safely with fallbacks
      const fields = [];

      if (meme.keywords && meme.keywords.length > 0) {
        fields.push({
          name: 'Keywords',
          value: meme.keywords.join(', '),
          inline: true,
        });
      }

      if (meme.createdBy && meme.createdBy.username) {
        fields.push({
          name: 'Uploaded by',
          value: meme.createdBy.username,
          inline: true,
        });
      }

      fields.push({
        name: 'ID',
        value: `\`${meme._id}\``,
        inline: false,
      });

      if (fields.length > 0) {
        embed.addFields(fields);
      }

      return embed;
    };

    const generateButtons = (index: number): ActionRowBuilder<ButtonBuilder> => {
      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('first')
          .setLabel('⏮️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(index === 0),
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(index === 0),
        new ButtonBuilder()
          .setCustomId('counter')
          .setLabel(`${index + 1} / ${totalMemes}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('▶️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(index === totalMemes - 1),
        new ButtonBuilder()
          .setCustomId('last')
          .setLabel('⏭️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(index === totalMemes - 1)
      );
    };

    // Send initial message
    const reply = await msg.reply({
      embeds: [generateEmbed(currentIndex)],
      components: totalMemes > 1 ? [generateButtons(currentIndex)] : [],
    });

    // If only one meme, no need for button collector
    if (totalMemes <= 1) return;

    // Create button collector
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 600000, // 10 minutes
    });

    collector.on('collect', async (interaction) => {
      // Only allow the original command user to use buttons
      if (interaction.user.id !== msg.author.id) {
        await interaction.reply({
          content: '❌ Only the command user can use these buttons!',
          ephemeral: true,
        });
        return;
      }

      // Update index based on button
      switch (interaction.customId) {
        case 'first':
          currentIndex = 0;
          break;
        case 'prev':
          currentIndex = Math.max(0, currentIndex - 1);
          break;
        case 'next':
          currentIndex = Math.min(totalMemes - 1, currentIndex + 1);
          break;
        case 'last':
          currentIndex = totalMemes - 1;
          break;
      }

      // Update the message
      await interaction.update({
        embeds: [generateEmbed(currentIndex)],
        components: [generateButtons(currentIndex)],
      });
    });

    collector.on('end', async () => {
      // Disable all buttons when collector expires
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('first')
          .setLabel('⏮️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('counter')
          .setLabel(`${currentIndex + 1} / ${totalMemes}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('▶️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('last')
          .setLabel('⏭️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      await reply.edit({ components: [disabledRow] }).catch(() => {});
    });
  } catch (err) {
    console.error('❌ List error:', err);
    await msg.reply({
      embeds: [
        createErrorEmbed(
          err instanceof Error ? err.message : 'Failed to list memes'
        ),
      ],
    });
  }
}