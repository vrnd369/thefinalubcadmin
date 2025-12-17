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

const HOME_SECTIONS_COLLECTION = 'homeSections';

/**
 * Get all home sections ordered by their order field
 * Uses cache for existing users, server for new users
 * @returns {Promise<Array>} Array of home sections
 */
export const getHomeSections = async () => {
  try {
    const useCache = isExistingUser();
    const q = query(collection(db, HOME_SECTIONS_COLLECTION), orderBy('order', 'asc'));
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
    console.error('Error fetching home sections:', error);
    throw error;
  }
};

/**
 * Get a single home section by ID
 * Uses cache for existing users, server for new users
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Home section data
 */
export const getHomeSection = async (id) => {
  try {
    const useCache = isExistingUser();
    const docSnap = useCache 
      ? await getDoc(doc(db, HOME_SECTIONS_COLLECTION, id))
      : await getDocFromServer(doc(db, HOME_SECTIONS_COLLECTION, id));
    if (docSnap.exists()) {
      // Mark user as existing after first successful fetch
      if (!useCache) {
        markUserAsExisting();
      }
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Section not found');
  } catch (error) {
    console.error('Error fetching home section:', error);
    throw error;
  }
};

/**
 * Add a new home section
 * @param {Object} section - Home section data
 * @returns {Promise<string>} Document ID of the new section
 */
export const addHomeSection = async (section) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...section,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const docRef = await addDoc(collection(db, HOME_SECTIONS_COLLECTION), compressedData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding home section:', error);
    throw error;
  }
};

/**
 * Update an existing home section
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateHomeSection = async (id, updates) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(doc(db, HOME_SECTIONS_COLLECTION, id), compressedData);
  } catch (error) {
    console.error('Error updating home section:', error);
    throw error;
  }
};

/**
 * Delete a home section
 * @param {string} id - Document ID
 * @returns {Promise<void>}
 */
export const deleteHomeSection = async (id) => {
  try {
    await deleteDoc(doc(db, HOME_SECTIONS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting home section:', error);
    throw error;
  }
};

/**
 * Reorder sections by updating their order field
 * @param {Array<{id: string, order: number}>} sections - Array of sections with new order
 * @returns {Promise<void>}
 */
export const reorderSections = async (sections) => {
  try {
    const updatePromises = sections.map(({ id, order }) =>
      updateDoc(doc(db, HOME_SECTIONS_COLLECTION, id), {
        order,
        updatedAt: new Date().toISOString()
      })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error reordering sections:', error);
    throw error;
  }
};

