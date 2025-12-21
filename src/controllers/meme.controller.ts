import Meme from '../models/meme.model.js';
import cloudinary from '../config/cloudinary.js';
import type { DiscordUserDTO } from '../bot/types/index.js';

/**
 * UPLOAD MEME
 */
export async function uploadMemee(
  discordUser: DiscordUserDTO,
  imageUrl: string,
  description = '',
  keywords: string[] = []
) {
  if (!discordUser?.id) {
    throw new Error('Invalid Discord user');
  }

  const cleanKeywords = keywords
    .filter(Boolean)
    .map(k => k.trim().toLowerCase())
    .slice(0, 10);

  const uploadResult = await cloudinary.uploader.upload(imageUrl, {
    folder: 'discord-memes',
    resource_type: 'image',
  });

  return Meme.create({
    imageUrl: uploadResult.secure_url,
    description: description.substring(0, 500),
    keywords: cleanKeywords,
    createdBy: {
      discordId: discordUser.id,
      username: discordUser.username,
    },
  });
}

/**
 * SEARCH MEMES
 */
export async function searchMemes(searchTerms: string[]) {
  const cleanTerms = searchTerms
    .filter(Boolean)
    .map(t => t.toLowerCase())
    .slice(0, 5);

  const query = {
    $or: [
      { description: { $regex: cleanTerms.join('|'), $options: 'i' } },
      { keywords: { $in: cleanTerms } },
    ],
  };

  return Meme.find(query)
    .sort({ createdAt: -1 })
    .limit(20);
}

/**
 * DELETE MEME (SAFE + STRICT MODE)
 */
export async function deleteMeme(
  discordUser: DiscordUserDTO,
  memeId: string
): Promise<boolean> {
  console.log('🔍 deleteMeme called');
  console.log('   User ID:', discordUser.id);
  console.log('   Username:', discordUser.username);
  console.log('   Meme ID:', memeId);

  // Validate ObjectId format
  if (!memeId.match(/^[0-9a-fA-F]{24}$/)) {
    console.log('❌ Invalid ObjectId format');
    throw new Error('Invalid meme ID format');
  }

  const meme = await Meme.findById(memeId);

  if (!meme) {
    console.log('❌ Meme not found in database');
    throw new Error('Meme not found');
  }

  // 🔐 STRICT MODE SAFETY CHECK
  if (!meme.createdBy) {
    console.log('❌ Meme has no owner');
    throw new Error('Meme owner missing');
  }

  console.log('📝 Meme found!');
  console.log('   Owner Discord ID:', meme.createdBy.discordId);
  console.log('   Owner Username:', meme.createdBy.username);
  console.log('   Comparison:', meme.createdBy.discordId, '===', discordUser.id);
  console.log('   Match:', meme.createdBy.discordId === discordUser.id);

  // 🔐 OWNERSHIP CHECK
  if (meme.createdBy.discordId !== discordUser.id) {
    console.log('❌ User does not own this meme');
    throw new Error('You can only delete your own memes');
  }

  await meme.deleteOne();
  console.log('✅ Meme deleted from database');

  return true;
}

/**
 * GET ALL MEMES
 */
export async function getAllMemes() {
  return Meme.find({})
    .sort({ createdAt: -1 })
    .lean();
}
