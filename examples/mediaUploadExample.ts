import { postApi } from '@/http/postApi';
import { convertImagesToBase64 } from '@/utils/imageToBase64';

// Example usage of media upload API

// 1. Upload a single image
export const uploadSingleImage = async (imageUri: string) => {
  try {
    // Convert image to base64
    const base64 = await convertImagesToBase64([imageUri]);
    
    // Upload to API
    const response = await postApi.uploadMedia({
      fileContent: base64[0],
      mediaType: 'PHOTO',
      featured: true
    });
    
    if (response && response.success) {
      console.log('✅ Image uploaded successfully:', response.data);
      return response.data?.id;
    } else {
      console.log('❌ Failed to upload image:', response?.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    return null;
  }
};

// 2. Upload multiple images
export const uploadMultipleImages = async (imageUris: string[]) => {
  try {
    // Convert images to base64
    const base64Strings = await convertImagesToBase64(imageUris);
    
    // Upload each image
    const uploadPromises = base64Strings.map(async (base64, index) => {
      const response = await postApi.uploadMedia({
        fileContent: base64,
        mediaType: 'PHOTO',
        featured: index === 0 // First image is featured
      });
      
      if (response && response.success && response.data) {
        return response.data.id;
      } else {
        throw new Error(response?.message || 'Failed to upload image');
      }
    });
    
    const mediaIds = await Promise.all(uploadPromises);
    console.log('✅ All images uploaded successfully:', mediaIds);
    return mediaIds;
    
  } catch (error) {
    console.error('❌ Error uploading images:', error);
    return null;
  }
};

// 3. Create post with media
export const createPostWithMedia = async (content: string, imageUris: string[]) => {
  try {
    // Upload images first
    const mediaIds = await uploadMultipleImages(imageUris);
    
    if (!mediaIds) {
      console.log('❌ Failed to upload images');
      return null;
    }
    
    // Create post with media IDs
    const response = await postApi.createPost({
      content,
      mediaFileIds: mediaIds
    });
    
    if (response && response.success) {
      console.log('✅ Post created with media successfully:', response.data);
      return response.data;
    } else {
      console.log('❌ Failed to create post:', response?.message);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error creating post with media:', error);
    return null;
  }
};

// 4. React component example for media upload
export const MediaUploadExample = () => {
  const handleImageUpload = async (selectedImages: string[]) => {
    console.log('Starting image upload...');
    
    try {
      const mediaIds = await uploadMultipleImages(selectedImages);
      
      if (mediaIds) {
        console.log('Images uploaded successfully:', mediaIds);
        // Now you can use these IDs to create a post
        return mediaIds;
      } else {
        console.log('Failed to upload images');
        return null;
      }
    } catch (error) {
      console.error('Error in image upload:', error);
      return null;
    }
  };
  
  return {
    handleImageUpload
  };
}; 