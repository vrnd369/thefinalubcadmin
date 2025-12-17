import {
  collection,
  doc,
  getDocs,
  getDoc,
  getDocsFromServer,
  getDocFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { validateAndCompressDocument } from "../../utils/firestoreCompression";
import { isExistingUser, markUserAsExisting } from "../../utils/userCache";

const BRAND_PAGES_COLLECTION = "brandPages";

/**
 * Get all brand pages ordered by brand name
 * Uses cache for existing users, server for new users
 * @returns {Promise<Array>} Array of brand page objects
 */
export const getBrandPages = async () => {
  try {
    const useCache = isExistingUser();
    const snapshot = useCache 
      ? await getDocs(collection(db, BRAND_PAGES_COLLECTION))
      : await getDocsFromServer(collection(db, BRAND_PAGES_COLLECTION));
    const pages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Sort by brand name
    const sortedPages = pages.sort((a, b) =>
      (a.brandName || "").localeCompare(b.brandName || "")
    );
    
    // Mark user as existing after first successful fetch
    if (!useCache && sortedPages.length >= 0) {
      markUserAsExisting();
    }
    
    return sortedPages;
  } catch (error) {
    console.error("Error fetching brand pages:", error);
    throw error;
  }
};

/**
 * Real-time subscription to all brand pages ordered by brand name.
 * @param {(pages: Array) => void} callback
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} unsubscribe function
 */
export const subscribeBrandPages = (callback, onError) => {
  try {
    const unsubscribe = onSnapshot(
      collection(db, BRAND_PAGES_COLLECTION),
      (snapshot) => {
        const pages = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => (a.brandName || "").localeCompare(b.brandName || ""));
        callback(pages);
      },
      (error) => {
        console.error("Error subscribing to brand pages:", error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("Error initializing brand pages subscription:", error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Get a single brand page by document ID
 * Uses cache for existing users, server for new users
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Brand page data
 */
export const getBrandPage = async (id) => {
  try {
    const useCache = isExistingUser();
    const docSnap = useCache 
      ? await getDoc(doc(db, BRAND_PAGES_COLLECTION, id))
      : await getDocFromServer(doc(db, BRAND_PAGES_COLLECTION, id));
    if (docSnap.exists()) {
      // Mark user as existing after first successful fetch
      if (!useCache) {
        markUserAsExisting();
      }
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching brand page:", error);
    throw error;
  }
};

/**
 * Get a brand page by brandId (brand identifier like "soil-king")
 * Uses cache for existing users, server for new users
 * @param {string} brandId - Brand identifier
 * @returns {Promise<Object|null>} Brand page data or null
 */
export const getBrandPageByBrandId = async (brandId) => {
  try {
    const useCache = isExistingUser();
    const q = query(
      collection(db, BRAND_PAGES_COLLECTION),
      where("brandId", "==", brandId)
    );
    // Use cache for existing users, server for new users
    const snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
    if (snapshot.empty) {
      return null;
    }
    const pageData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    
    // Mark user as existing after first successful fetch
    if (!useCache) {
      markUserAsExisting();
    }
    
    return pageData;
  } catch (error) {
    console.error("Error fetching brand page by brandId:", error);
    throw error;
  }
};

/**
 * Add a new brand page
 * @param {Object} pageData - Brand page data
 * @returns {Promise<string>} Document ID of the new brand page
 */
export const addBrandPage = async (pageData) => {
  try {
    // Ensure document (including any base64 data) is under 500KB
    const compressedData = await validateAndCompressDocument({
      ...pageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const docRef = await addDoc(
      collection(db, BRAND_PAGES_COLLECTION),
      compressedData
    );
    return docRef.id;
  } catch (error) {
    console.error("Error adding brand page:", error);
    throw error;
  }
};

/**
 * Update an existing brand page
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateBrandPage = async (id, updates) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    await updateDoc(doc(db, BRAND_PAGES_COLLECTION, id), compressedData);
  } catch (error) {
    console.error("Error updating brand page:", error);
    throw error;
  }
};

/**
 * Delete a brand page
 * @param {string} id - Document ID
 * @returns {Promise<void>}
 */
export const deleteBrandPage = async (id) => {
  try {
    await deleteDoc(doc(db, BRAND_PAGES_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting brand page:", error);
    throw error;
  }
};

/**
 * Check if a brand page exists for a given brandId
 * @param {string} brandId - Brand identifier
 * @returns {Promise<boolean>}
 */
export const brandPageExists = async (brandId) => {
  try {
    const page = await getBrandPageByBrandId(brandId);
    return page !== null;
  } catch (error) {
    console.error("Error checking brand page existence:", error);
    return false;
  }
};
