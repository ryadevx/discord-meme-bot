import { Message, EmbedBuilder } from 'discord.js';

export async function helpCommand(msg: Message, args: string[]): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🤖 Meme Bot Commands')
    .addFields(
      { name: '!upload [keywords] [description]', value: 'Upload a meme (attach image)' },
      { name: '!search <terms>', value: 'Search memes' },
      { name: '!delete <meme_id>', value: 'Delete your meme' },
      { name: '!help', value: 'Show commands' }
    );

  await msg.reply({ embeds: [embed] });
}
