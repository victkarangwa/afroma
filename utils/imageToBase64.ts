import * as FileSystem from 'expo-file-system';

export const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
    
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
};

export const convertImagesToBase64 = async (imageUris: string[]): Promise<string[]> => {
  try {
    const base64Promises = imageUris.map(uri => imageToBase64(uri));
    const base64Strings = await Promise.all(base64Promises);
    return base64Strings;
  } catch (error) {
    console.error('Error converting images to base64:', error);
    throw new Error('Failed to convert images to base64');
  }
}; 