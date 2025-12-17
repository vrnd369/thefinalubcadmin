import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  getDocFromServer,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../firebase/config";
import { isExistingUser, markUserAsExisting } from "../../utils/userCache";

const IMAGES_COLLECTION = "images"; // Separate collection for image metadata
const STORAGE_IMAGES_PATH = "images"; // Storage path for images

/**
 * Upload an image file to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} name - Name for the file
 * @returns {Promise<string>} Document ID of the uploaded image (use this ID to reference the image)
 */
export const uploadImage = async (file, name) => {
  try {
    const fileName = name || file.name;
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageFileName = `${timestamp}_${sanitizedFileName}`;
    const storagePath = `${STORAGE_IMAGES_PATH}/${storageFileName}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, storagePath);
    const uploadResult = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Store metadata in Firestore
    const docRef = await addDoc(collection(db, IMAGES_COLLECTION), {
      name: fileName,
      url: downloadURL, // Storage URL
      storagePath: storagePath, // Store path for deletion
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Return the document ID (use this ID to reference the image)
    return docRef.id;
  } catch (error) {
    console.error("Error uploading image:", error);
    // Provide more specific error messages
    if (error.code === "permission-denied" || error.code === "storage/unauthorized") {
      throw new Error("Permission denied. Please check Firebase Storage rules.");
    } else if (error.code === "unavailable" || error.code === "storage/retry-limit-exceeded") {
      throw new Error(
        "Storage is unavailable. Please check your internet connection."
      );
    } else if (error.code === "resource-exhausted" || error.code === "storage/quota-exceeded") {
      throw new Error(
        "Storage quota exceeded. Please check your Firebase Storage quota."
      );
    }
    throw new Error(
      error.message || "Failed to upload image. Please try again."
    );
  }
};


/**
 * Get an image by document ID from Firestore
 * Uses server-only read to avoid stale cache data
 * @param {string} imageId - Document ID of the image
 * @returns {Promise<string>} Storage URL or base64 data URL (for backward compatibility)
 */
export const getImageById = async (imageId) => {
  try {
    if (!imageId) {
      console.warn("getImageById: imageId is empty");
      return null;
    }

    // Normalize IDs that might come in as paths (e.g., "images/assets/logo.png").
    // Firestore document IDs cannot contain slashes, so we strip to the last segment.
    let normalizedId = imageId.trim();
    if (normalizedId.includes("/")) {
      const parts = normalizedId.split("/").filter(Boolean);
      normalizedId = parts[parts.length - 1];
      console.warn(
        `getImageById: received path-like imageId "${imageId}", normalized to "${normalizedId}"`
      );
    }

    if (!normalizedId) {
      console.warn("getImageById: normalized imageId is empty");
      return null;
    }

    const docRef = doc(db, IMAGES_COLLECTION, normalizedId);
    const useCache = isExistingUser();
    const docSnap = useCache ? await getDoc(docRef) : await getDocFromServer(docRef);

    if (docSnap.exists()) {
      if (!useCache) {
        markUserAsExisting();
      }
      const data = docSnap.data();

      // Priority: Storage URL > base64 data (for backward compatibility)
      const imageUrl = data.url || data.data || null;
      
      if (imageUrl) {
        // If it's a Storage URL (http/https), return it directly
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
          return imageUrl;
        }
        
        // If it's a base64 data URL (legacy), return it for backward compatibility
        if (imageUrl.startsWith("data:image/")) {
          return imageUrl;
        } else if (imageUrl.startsWith("data:")) {
          return imageUrl;
        } else {
          // If it's just base64 without the data URL prefix, add it
          const contentType = data.contentType || "image/png";
          return `data:${contentType};base64,${imageUrl}`;
        }
      } else {
        // Only log in development mode to reduce console noise
        if (process.env.NODE_ENV === 'development') {
          console.debug("getImageById: Image document exists but no url/data field found", imageId);
        }
        return null;
      }
    } else {
      // Only log in development mode to reduce console noise
      // Missing images are common when data is cleaned up or migrated
      if (process.env.NODE_ENV === 'development') {
        console.debug("getImageById: Image document does not exist", imageId);
      }
      return null;
    }
  } catch (error) {
    console.error("Error fetching image by ID:", error.message);
    return null;
  }
};

/**
 * Get all uploaded images from Firestore
 * @returns {Promise<Array>} Array of image objects with id, name, and Storage URL or base64 data URL
 */
export const getAllImages = async () => {
  try {
    const q = query(
      collection(db, IMAGES_COLLECTION),
      orderBy("uploadedAt", "desc")
    );
    const snapshot = await getDocs(q);

    const images = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Untitled",
        url: data.url || data.data || "", // Storage URL (preferred) or base64 data URL (legacy)
        contentType: data.contentType || "image/png",
        size: data.size || 0,
        uploadedAt: data.uploadedAt || data.createdAt,
      };
    });

    return images;
  } catch (error) {
    console.error("Error fetching images:", error);
    // Return empty array if collection doesn't exist yet or permission denied
    if (
      error.code === "permission-denied" ||
      error.code === "not-found" ||
      error.message?.includes("not found")
    ) {
      return [];
    }
    // Log error for debugging
    console.error("Error fetching images:", error.message);
    return []; // Return empty array instead of throwing to prevent UI blocking
  }
};

/**
 * Delete an image from Firestore and Storage
 * @param {string} imageId - Document ID of the image
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageId) => {
  try {
    // Get the image document to find the storage path
    const imageDocRef = doc(db, IMAGES_COLLECTION, imageId);
    const imageDoc = await getDoc(imageDocRef);
    
    if (imageDoc.exists()) {
      const data = imageDoc.data();
      
      // Delete from Storage if storagePath exists
      if (data.storagePath) {
        try {
          const storageRef = ref(storage, data.storagePath);
          await deleteObject(storageRef);
        } catch (storageError) {
          // Log but don't fail if storage deletion fails (file might not exist)
          console.warn("Error deleting from Storage:", storageError);
        }
      }
    }
    
    // Delete the Firestore document
    await deleteDoc(imageDocRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
