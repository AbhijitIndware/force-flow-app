import RNFS from 'react-native-fs';

/**
 * Converts a file URI to a base64 string with the appropriate data prefix.
 * @param uri The file URI to read.
 * @param mimeType The MIME type of the file (e.g., 'image/jpeg', 'application/pdf').
 * @returns A promise that resolves to the base64 encoded string.
 */
export const fileToBase64 = async (uri: string, mimeType: string): Promise<string> => {
  try {
    // For iOS, the URI might have a 'file://' prefix which RNFS handles, 
    // but sometimes it needs to be cleaned depending on the source.
    const path = uri.replace('file://', '');
    const base64 = await RNFS.readFile(path, 'base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error reading file as base64:', error);
    throw error;
  }
};
