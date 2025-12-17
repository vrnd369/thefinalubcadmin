import { 
  collection, 
  addDoc, 
  getDocs, 
  getDocsFromServer,
  getDoc, 
  getDocFromServer,
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { isExistingUser, markUserAsExisting } from '../../utils/userCache';

const VIDEOS_COLLECTION = 'videos'; // Separate collection for video metadata
const STORAGE_VIDEOS_PATH = 'videos'; // Storage path for videos


/**
 * Upload a video file to Firebase Storage (maintains original quality)
 * @param {File} file - Video file to upload
 * @param {string} name - Name for the file
 * @returns {Promise<string>} Document ID of the uploaded video (use this ID to reference the video)
 */
export const uploadVideo = async (file, name) => {
  try {
    const fileName = name || file.name;
    
    // Validate file
    if (!file) {
      throw new Error('No file provided. File is null or undefined.');
    }
    
    if (!(file instanceof File) && !(file instanceof Blob)) {
      throw new Error(`Invalid file object provided. Expected File or Blob, got: ${typeof file}.`);
    }
    
    if (file.size === 0) {
      throw new Error('File is empty (0 bytes). Cannot upload empty file.');
    }
    
    // Warn if file is suspiciously small (less than 1KB)
    if (file.size < 1024) {
      console.warn('⚠️ Warning: File is very small:', file.size, 'bytes. This may indicate a problem.');
    }
    
    // Test if we can read a slice of the file to verify it's valid
    try {
      const testSlice = file.slice(0, Math.min(100, file.size));
      if (testSlice.size === 0 && file.size > 0) {
        throw new Error('File appears to be corrupted - cannot read file data.');
      }
    } catch (testError) {
      console.error('File validation test failed:', testError);
      throw new Error(`File validation failed: ${testError.message}. The file may be corrupted.`);
    }
    
    // Upload to Firebase Storage (no compression - maintain quality)
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageFileName = `${timestamp}_${sanitizedFileName}`;
    const storagePath = `${STORAGE_VIDEOS_PATH}/${storageFileName}`;

    const storageRef = ref(storage, storagePath);
    const uploadResult = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Store metadata in Firestore
    const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), {
      name: fileName,
      url: downloadURL, // Storage URL
      storagePath: storagePath, // Store path for deletion
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    
    // Return the document ID (use this ID to reference the video)
    return docRef.id;
  } catch (error) {
    console.error('Error uploading video:', error);
    // Provide more specific error messages
    if (error.code === 'permission-denied' || error.code === 'storage/unauthorized') {
      throw new Error('Permission denied. Please check Firebase Storage rules.');
    } else if (error.code === 'unavailable' || error.code === 'storage/retry-limit-exceeded') {
      throw new Error('Storage is unavailable. Please check your internet connection.');
    } else if (error.code === 'resource-exhausted' || error.code === 'storage/quota-exceeded') {
      throw new Error('Storage quota exceeded. Please check your Firebase Storage quota.');
    }
    throw new Error(error.message || 'Failed to upload video. Please try again.');
  }
};

/**
 * Get a video by document ID from Firestore
 * @param {string} videoId - Document ID of the video
 * @returns {Promise<string>} Storage URL or base64 data URL (for backward compatibility)
 */
export const getVideoById = async (videoId) => {
  try {
    if (!videoId) {
      console.warn('getVideoById: videoId is empty');
      return null;
    }
    
    const useCache = isExistingUser();
    const docRef = doc(db, VIDEOS_COLLECTION, videoId);
    const docSnap = useCache ? await getDoc(docRef) : await getDocFromServer(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Mark user as existing after first successful fetch
      if (!useCache) {
        markUserAsExisting();
      }
      
      // Priority: Storage URL > base64 data (for backward compatibility)
      const videoUrl = data.url || data.data || data.base64 || null;
      
      if (videoUrl) {
        // If it's a Storage URL (http/https), return it directly
        if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
          return videoUrl;
        }
        
        // If it's a base64 data URL (legacy), return it for backward compatibility
        if (videoUrl.startsWith('data:video/')) {
          return videoUrl;
        } else {
          // If it's just base64 without the data URL prefix, add it
          return `data:video/webm;base64,${videoUrl}`;
        }
      } else {
        console.warn('getVideoById: Video document exists but no url/data field found');
        return null;
      }
    } else {
      // Video document doesn't exist - this is expected for optional videos
      // Silently return null instead of warning
      return null;
    }
  } catch (error) {
    console.error('Error fetching video by ID:', error);
    console.error('Error details:', error.message, error.stack);
    return null;
  }
};

/**
 * Get all uploaded videos from Firestore
 * @returns {Promise<Array>} Array of video objects with id, name, and Storage URL or base64 data URL
 */
export const getAllVideos = async () => {
  try {
    const useCache = isExistingUser();
    const q = query(collection(db, VIDEOS_COLLECTION), orderBy('uploadedAt', 'desc'));
    const snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
    
    const videos = snapshot.docs.map(doc => {
      const data = doc.data();
      const videoUrl = data.url || data.data || '';
      
      // Validate that video URL exists and is valid
      // Storage URLs (http/https) or base64 data URLs are valid
      const isValidVideoUrl = videoUrl && 
        (videoUrl.startsWith('http://') || 
         videoUrl.startsWith('https://') || 
         (videoUrl.startsWith('data:video/') && videoUrl.length > 100));
      
      return {
        id: doc.id,
        name: data.name || 'Untitled',
        url: isValidVideoUrl ? videoUrl : '', // Storage URL or base64 data URL
        contentType: data.contentType || 'video/mp4',
        size: data.size || 0,
        uploadedAt: data.uploadedAt || data.createdAt,
        isValid: isValidVideoUrl
      };
    }).filter(video => video.isValid); // Filter out videos with invalid URLs
    
    // Mark user as existing after first successful fetch
    if (!useCache && videos.length >= 0) {
      markUserAsExisting();
    }
    
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    // Return empty array if collection doesn't exist yet or permission denied
    if (error.code === 'permission-denied' || 
        error.code === 'not-found' ||
        error.message?.includes('not found')) {
      return [];
    }
    return [];
  }
};

/**
 * Delete a video from Firestore and Storage
 * @param {string} videoId - Document ID of the video
 * @returns {Promise<void>}
 */
export const deleteVideo = async (videoId) => {
  try {
    // Get the video document to find the storage path
    const videoDocRef = doc(db, VIDEOS_COLLECTION, videoId);
    const videoDoc = await getDoc(videoDocRef);
    
    if (videoDoc.exists()) {
      const data = videoDoc.data();
      
      // Delete from Storage if storagePath exists
      if (data.storagePath) {
        try {
          const storageRef = ref(storage, data.storagePath);
          await deleteObject(storageRef);
        } catch (storageError) {
          // Log but don't fail if storage deletion fails (file might not exist)
          console.warn('Error deleting from Storage:', storageError);
        }
      }
    }
    
    // Delete the Firestore document
    await deleteDoc(videoDocRef);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

