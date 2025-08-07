import fs from 'fs/promises';
import path from 'path';
import { Attachment } from 'discord.js';


export async function saveAttachment(attachment: Attachment): Promise<string> {
  const response = await fetch(attachment.url);
  const buffer = await response.arrayBuffer();
  const fileExtension = path.extname(attachment.name || '.png');
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExtension}`;
  const filePath = path.join('uploads', fileName);
  
  await fs.writeFile(filePath, Buffer.from(buffer));
  return filePath;
}