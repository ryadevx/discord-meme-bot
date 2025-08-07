import Meme from '../models/meme.model.js';
import User from '../models/user.model.js';
import fs from 'fs/promises';
import { User as DiscordUser } from 'discord.js';

export async function uploadMemee(
  discordUser: DiscordUser, 
  imagePath: string, 
  description = '', 
  keywords: string[] = []
) {
  if (!discordUser?.id) {
    throw new Error('Invalid user data provided');
  }

  if (!imagePath) {
    throw new Error('Image path is required');
  }

  const cleanKeywords = keywords
    .filter(k => k && k.trim().length > 0)
    .map(k => k.trim().toLowerCase())
    .slice(0, 10);

  const user = await User.findOneAndUpdate(
    { discordId: discordUser.id },
    { 
      username: discordUser.username,
      lastActivity: new Date()
    },
    { upsert: true, new: true }
  );

  const meme = await Meme.create({
    imagePath,
    description: description.substring(0, 500),
    keywords: cleanKeywords,
    createdBy: user._id,
  });

  return meme;
}

export async function searchMemes(discordUser: DiscordUser, searchTerms: string[]) {
  if (!discordUser?.id) {
    throw new Error('Invalid user data provided');
  }

  if (!searchTerms || searchTerms.length === 0) {
    throw new Error('Search terms are required');
  }

  const user = await User.findOne({ discordId: discordUser.id });
  if (!user) {
    throw new Error('User not found. Please upload a meme first to register.');
  }

  const cleanTerms = searchTerms
    .filter(term => term && term.trim().length > 0)
    .map(term => term.trim().toLowerCase())
    .slice(0, 5);

  if (cleanTerms.length === 0) {
    throw new Error('Please provide valid search terms');
  }

  const query: any = {
    $or: [
      { description: { $regex: cleanTerms.join('|'), $options: 'i' } },
      { keywords: { $in: cleanTerms.map(k => new RegExp(k, 'i')) } }
    ]
  };

  if (user.role !== 'admin' && !user.canViewAllMemes) {
    query.createdBy = user._id;
  }

  await User.updateOne(
    { _id: user._id }, 
    { lastActivity: new Date() }
  );

  return Meme.find(query)
    .populate('createdBy', 'username')
    .sort({ createdAt: -1 })
    .limit(20);
}

export async function deleteMeme(discordUser: DiscordUser, memeId: string): Promise<boolean> {
  const user = await User.findOne({ discordId: discordUser.id });
  if (!user) throw new Error('User not found');

  const meme = await Meme.findById(memeId);
  if (!meme) throw new Error('Meme not found');

  const isOwner = meme.createdBy.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new Error('You can only delete your own memes');
  }

  try {
    await fs.unlink(meme.imagePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  await meme.deleteOne();
  return true;
}
