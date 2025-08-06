import { postApi } from '@/http/postApi';

// Test post creation API
export const testPostCreation = async () => {
  console.log('Testing post creation API...');
  
  try {
    // Test 1: Create a simple text post
    const simplePost = await postApi.createPost({
      content: "This is a test post from the mobile app! #TestPost #MobileApp"
    });
    
    if (simplePost && simplePost.success) {
      console.log('✅ Simple post created successfully:', simplePost.data);
    } else {
      console.log('❌ Failed to create simple post:', simplePost?.message);
    }
    
    // Test 2: Create a post with media file IDs (for future use)
    const postWithMedia = await postApi.createPost({
      content: "This is a test post with media files! #TestPost #Media",
      mediaFileIds: [1, 2, 3] // Example media file IDs
    });
    
    if (postWithMedia && postWithMedia.success) {
      console.log('✅ Post with media created successfully:', postWithMedia.data);
    } else {
      console.log('❌ Failed to create post with media:', postWithMedia?.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing post creation:', error);
  }
};

// Test post listing with profile type filter
export const testPostListing = async () => {
  console.log('Testing post listing API...');
  
  try {
    // Test 1: Get posts for DATING profile type
    const datingPosts = await postApi.getPosts(1, 10, '', 'DATING');
    
    if (datingPosts && datingPosts.success) {
      console.log('✅ Dating posts loaded:', datingPosts.list.length);
      console.log('Request filters:', datingPosts.filters);
    } else {
      console.log('❌ Failed to load dating posts:', datingPosts?.message);
    }
    
    // Test 2: Get posts for NETWORKING profile type
    const networkingPosts = await postApi.getPosts(1, 10, '', 'NETWORKING');
    
    if (networkingPosts && networkingPosts.success) {
      console.log('✅ Networking posts loaded:', networkingPosts.list.length);
      console.log('Request filters:', networkingPosts.filters);
    } else {
      console.log('❌ Failed to load networking posts:', networkingPosts?.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing post listing:', error);
  }
}; 