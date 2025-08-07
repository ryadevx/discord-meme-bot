// src/tests/bot.test.ts - Simple testing without Jest
import { uploadMemee, searchMemes } from '../controllers/meme.controller.js';
import { deleteMeme } from '../bot/commands/delete.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';

const mockUser = {
  id: '123456789',
  username: 'testuser'
};

const mockAdmin = {
  id: '987654321',
  username: 'admin'
};

// Simple assertion function
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Test failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

async function testUploadMeme() {
  console.log('\n🧪 Testing uploadMeme...');
  
  // Test 1: Normal upload
  const meme1 = await uploadMemee(
    mockUser,
    'test/image1.png',
    'Funny cat meme',
    ['funny', 'cat', 'meme']
  );
  
  assert(meme1.description === 'Funny cat meme', 'Upload with description works');
  assert(meme1.keywords.includes('funny'), 'Keywords are saved correctly');
  assert(meme1.imagePath === 'test/image1.png', 'Image path is saved');
  
  // Test 2: Upload without description
  const meme2 = await uploadMemee(mockUser, 'test/image2.png');
  assert(meme2.description === '', 'Empty description works');
  assert(meme2.keywords.length === 0, 'Empty keywords work');
  
  // Test 3: Too many keywords (should limit to 5)
  const meme3 = await uploadMemee(
    mockUser,
    'test/image3.png',
    'Test',
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  );
  assert(meme3.keywords.length <= 5, 'Keywords are limited to 5');
  
  console.log('✅ All upload tests passed!');
  return [meme1, meme2, meme3];
}

async function testSearchMemes(uploadedMemes: any[]) {
  console.log('\n🔍 Testing searchMemes...');
  
  // Test 1: Search by keyword
  const results1 = await searchMemes(mockUser, ['funny']);
  assert(results1.length > 0, 'Search by keyword finds results');
  assert(results1.some((m: any) => m.keywords.includes('funny')), 'Results contain searched keyword');
  
  // Test 2: Search by description
  const results2 = await searchMemes(mockUser, ['cat']);
  assert(results2.length > 0, 'Search by description works');
  
  // Test 3: Search with no results
  const results3 = await searchMemes(mockUser, ['nonexistent']);
  assert(results3.length === 0, 'Search with no matches returns empty array');
  
  // Test 4: Multiple search terms
  const results4 = await searchMemes(mockUser, ['funny', 'cat']);
  assert(results4.length > 0, 'Multiple search terms work');
  
  console.log('✅ All search tests passed!');
  return results1;
}

async function testDeleteMeme(memeToDelete: any) {
  console.log('\n🗑️ Testing deleteMeme...');
  
  // Test 1: User can delete own meme
  const result1 = await deleteMeme(mockUser, memeToDelete._id.toString());
  assert(result1 === true, 'User can delete own meme');
  
  // Test 2: Try to delete non-existent meme
  try {
    await deleteMeme(mockUser, '507f1f77bcf86cd799439011');
    assert(false, 'Should throw error for non-existent meme');
  } catch (error: any) {
    assert(error.message === 'Meme not found', 'Throws correct error for non-existent meme');
  }
  
  console.log('✅ All delete tests passed!');
}

async function testErrorCases() {
  console.log('\n⚠️ Testing error cases...');
  
  // Test 1: Invalid user for upload
  try {
    await uploadMemee(null, 'test.png');
    assert(false, 'Should throw error for null user');
  } catch (error: any) {
    assert(error.message === 'Invalid user data', 'Throws error for invalid user');
  }
  
  // Test 2: Empty search terms
  try {
    await searchMemes(mockUser, []);
    assert(false, 'Should throw error for empty search');
  } catch (error: any) {
    assert(error.message === 'Search terms required', 'Throws error for empty search');
  }
  
  // Test 3: User tries to delete someone else's meme
  const otherUserMeme = await uploadMemee(mockAdmin, 'test/admin.png', 'Admin meme');
  try {
    await deleteMeme(mockUser, otherUserMeme._id.toString());
    assert(false, 'Should throw error when deleting others meme');
  } catch (error: any) {
    assert(error.message === 'You can only delete your own memes', 'Throws correct permission error');
  }
  
  console.log('✅ All error tests passed!');
}

async function runAllTests() {
  console.log('🚀 Starting Meme Bot Tests...');
  console.log('================================');
  
  try {
    // Setup test database
    process.env.MONGODB_URI = 'mongodb://localhost:27017/meme_test';
    await connectDB();
    console.log('📊 Connected to test database');
    
    // Run all tests
    const uploadedMemes = await testUploadMeme();
    const searchResults = await testSearchMemes(uploadedMemes);
    await testDeleteMeme(uploadedMemes[0]);
    await testErrorCases();
    
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('================================');
    
  } catch (error) {
    console.error('\n💥 TEST FAILED:', error);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up test database...');
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('✅ Cleanup complete');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };