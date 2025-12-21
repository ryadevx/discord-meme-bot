import { EmbedBuilder } from 'discord.js';

export function createErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('❌ Error')
    .setDescription(message);
}

export function createSuccessEmbed(
  titleOrMessage: string, 
  description?: string
): EmbedBuilder {
  const embed = new EmbedBuilder().setColor('#00ff00');
  
  // If description is provided, use title + description
  if (description) {
    embed.setTitle(titleOrMessage);
    embed.setDescription(description);
  } else {
    // If only one argument, use it as description with default title
    embed.setTitle('✅ Success');
    embed.setDescription(titleOrMessage);
  }
  
  return embed;
}