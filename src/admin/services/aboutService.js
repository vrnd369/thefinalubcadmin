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
  orderBy 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { validateAndCompressDocument } from '../../utils/firestoreCompression';
import { isExistingUser, markUserAsExisting } from '../../utils/userCache';

const ABOUT_SECTIONS_COLLECTION = 'aboutSections';

/**
 * Get all about sections ordered by their order field
 * Uses cache for existing users, server for new users
 * @returns {Promise<Array>} Array of about sections
 */
export const getAboutSections = async () => {
  try {
    const useCache = isExistingUser();
    const q = query(collection(db, ABOUT_SECTIONS_COLLECTION), orderBy('order', 'asc'));
    const snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
    const sections = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // Mark user as existing after first successful fetch
    if (!useCache && sections.length >= 0) {
      markUserAsExisting();
    }
    
    return sections;
  } catch (error) {
    console.error('Error fetching about sections:', error);
    throw error;
  }
};

/**
 * Get a single about section by ID
 * Uses cache for existing users, server for new users
 * @param {string} id - Document ID
 * @returns {Promise<Object>} About section data
 */
export const getAboutSection = async (id) => {
  try {
    const useCache = isExistingUser();
    const docSnap = useCache 
      ? await getDoc(doc(db, ABOUT_SECTIONS_COLLECTION, id))
      : await getDocFromServer(doc(db, ABOUT_SECTIONS_COLLECTION, id));
    if (docSnap.exists()) {
      // Mark user as existing after first successful fetch
      if (!useCache) {
        markUserAsExisting();
      }
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Section not found');
  } catch (error) {
    console.error('Error fetching about section:', error);
    throw error;
  }
};

/**
 * Add a new about section
 * @param {Object} section - About section data
 * @returns {Promise<string>} Document ID of the new section
 */
export const addAboutSection = async (section) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...section,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const docRef = await addDoc(collection(db, ABOUT_SECTIONS_COLLECTION), compressedData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding about section:', error);
    throw error;
  }
};

/**
 * Update an existing about section
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateAboutSection = async (id, updates) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(doc(db, ABOUT_SECTIONS_COLLECTION, id), compressedData);
  } catch (error) {
    console.error('Error updating about section:', error);
    throw error;
  }
};

/**
 * Delete an about section
 * @param {string} id - Document ID
 * @returns {Promise<void>}
 */
export const deleteAboutSection = async (id) => {
  try {
    await deleteDoc(doc(db, ABOUT_SECTIONS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting about section:', error);
    throw error;
  }
};

/**
 * Reorder sections by updating their order field
 * @param {Array<{id: string, order: number}>} sections - Array of sections with new order
 * @returns {Promise<void>}
 */
export const reorderAboutSections = async (sections) => {
  try {
    const updatePromises = sections.map(({ id, order }) =>
      updateDoc(doc(db, ABOUT_SECTIONS_COLLECTION, id), {
        order,
        updatedAt: new Date().toISOString()
      })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error reordering about sections:', error);
    throw error;
  }
};

