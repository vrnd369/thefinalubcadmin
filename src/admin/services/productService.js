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
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { validateAndCompressDocument } from '../../utils/firestoreCompression';
import { isExistingUser, markUserAsExisting } from '../../utils/userCache';

const BRANDS_COLLECTION = 'brands';
const CATEGORIES_COLLECTION = 'categories';
const PRODUCTS_COLLECTION = 'products';

// ========== BRANDS ==========

/**
 * Get all brands ordered by their order field
 * Uses cache for existing users, server for new users
 * @returns {Promise<Array>} Array of brand objects
 */
export const getBrands = async () => {
  try {
    const useCache = isExistingUser();
    // Try to order by 'order' field, but fallback to all documents if it fails
    let snapshot;
    try {
      const q = query(collection(db, BRANDS_COLLECTION), orderBy('order', 'asc'));
      // Use cache for existing users, server for new users
      snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
    } catch (orderError) {
      // If orderBy fails (e.g., missing index or no order field), fetch all without ordering
      console.warn('Could not order by "order" field, fetching all brands:', orderError);
      snapshot = useCache 
        ? await getDocs(collection(db, BRANDS_COLLECTION))
        : await getDocsFromServer(collection(db, BRANDS_COLLECTION));
    }
    
    // Map documents to brand objects
    // id = Firestore document ID (used for delete/update operations)
    // brandId = Brand identifier from data (like "soil-king") for URLs/filtering
    const brands = snapshot.docs.map(doc => {
      const data = doc.data();
      const brandIdentifier = data.id || doc.id; // Brand identifier from data or fallback to doc ID
      return {
        id: doc.id, // Firestore document ID - used for delete/update operations
        brandId: brandIdentifier, // Brand identifier (like "soil-king") for display/URLs
        name: data.name,
        icon: data.icon,
        order: data.order || 0,
        enabled: data.enabled !== false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        // Include any other fields from data
        ...Object.fromEntries(
          Object.entries(data).filter(([key]) => 
            !['id', 'name', 'icon', 'order', 'enabled', 'createdAt', 'updatedAt'].includes(key)
          )
        )
      };
    });
    
    // Sort in memory if orderBy wasn't applied or to ensure consistent ordering
    brands.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Mark user as existing after first successful fetch
    if (!useCache && brands.length > 0) {
      markUserAsExisting();
    }
    
    return brands;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

/**
 * Get a single brand by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Brand data
 */
export const getBrand = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, BRANDS_COLLECTION, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching brand:', error);
    throw error;
  }
};

/**
 * Add a new brand
 * @param {Object} brand - Brand data
 * @returns {Promise<string>} Document ID of the new brand
 */
export const addBrand = async (brand) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...brand,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const docRef = await addDoc(collection(db, BRANDS_COLLECTION), compressedData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding brand:', error);
    throw error;
  }
};

/**
 * Update an existing brand
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateBrand = async (id, updates) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(doc(db, BRANDS_COLLECTION, id), compressedData);
  } catch (error) {
    console.error('Error updating brand:', error);
    throw error;
  }
};

/**
 * Delete a brand
 * @param {string} id - Document ID
 * @returns {Promise<void>}
 */
export const deleteBrand = async (id) => {
  try {
    await deleteDoc(doc(db, BRANDS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
};

// ========== CATEGORIES ==========

/**
 * Get all categories, optionally filtered by brand
 * Uses cache for existing users, server for new users
 * @param {string|null} brandId - Optional brand ID to filter by
 * @returns {Promise<Array>} Array of category objects
 */
export const getCategories = async (brandId = null) => {
  try {
    const useCache = isExistingUser();
    let snapshot;
    // Try to order by 'order' field, but fallback to all documents if it fails
    try {
      let q;
      if (brandId) {
        q = query(
          collection(db, CATEGORIES_COLLECTION), 
          where('brandId', '==', brandId),
          orderBy('order', 'asc')
        );
      } else {
        q = query(collection(db, CATEGORIES_COLLECTION), orderBy('order', 'asc'));
      }
      // Use cache for existing users, server for new users
      snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
    } catch (orderError) {
      // If orderBy fails (e.g., missing index or no order field), fetch all without ordering
      console.warn('Could not order by "order" field, fetching all categories:', orderError);
      if (brandId) {
        const q = query(
          collection(db, CATEGORIES_COLLECTION), 
          where('brandId', '==', brandId)
        );
        snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
      } else {
        snapshot = useCache 
          ? await getDocs(collection(db, CATEGORIES_COLLECTION))
          : await getDocsFromServer(collection(db, CATEGORIES_COLLECTION));
      }
    }
    
    const categories = snapshot.docs.map(doc => {
      const data = doc.data();
      // Extract the category identifier from data (if it exists) - this is the category's own ID field
      const categoryIdentifier = data.id;
      // Build the category object, ensuring document ID is preserved
      const category = {
        id: doc.id, // Firestore document ID - used for delete/update operations (CRITICAL: must be doc.id)
        categoryId: categoryIdentifier || doc.id, // Category identifier from data or fallback to doc ID
        title: data.title,
        subtitle: data.subtitle,
        chip: data.chip,
        brandId: data.brandId,
        image: data.image,
        href: data.href,
        order: data.order || 0,
        enabled: data.enabled !== false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
      
      // Include any other fields from data (excluding 'id' to prevent overwriting document ID)
      Object.keys(data).forEach(key => {
        if (!['id', 'title', 'subtitle', 'chip', 'brandId', 'image', 'href', 'order', 'enabled', 'createdAt', 'updatedAt'].includes(key)) {
          category[key] = data[key];
        }
      });
      
      return category;
    });
    
    // Sort in memory if orderBy wasn't applied or to ensure consistent ordering
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Mark user as existing after first successful fetch
    if (!useCache && categories.length >= 0) {
      markUserAsExisting();
    }
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get a single category by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Category data
 */
export const getCategory = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, CATEGORIES_COLLECTION, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

/**
 * Add a new category
 * @param {Object} category - Category data
 * @returns {Promise<string>} Document ID of the new category
 */
export const addCategory = async (category) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), compressedData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

/**
 * Update an existing category
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateCategory = async (id, updates) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(doc(db, CATEGORIES_COLLECTION, id), compressedData);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete a category
 * @param {string} id - Document ID
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// ========== PRODUCTS ==========

/**
 * Get all products, optionally filtered by brand and/or category
 * Uses cache for existing users, server for new users
 * @param {string|null} brandId - Optional brand ID to filter by
 * @param {string|null} categoryId - Optional category ID to filter by
 * @returns {Promise<Array>} Array of product objects
 */
export const getProducts = async (brandId = null, categoryId = null) => {
  try {
    const useCache = isExistingUser();
    let q;
    const constraints = [];
    
    if (brandId) {
      constraints.push(where('brandId', '==', brandId));
    }
    if (categoryId) {
      constraints.push(where('categoryId', '==', categoryId));
    }
    
    // Try to add orderBy, but handle failures gracefully
    let snapshot;
    try {
      if (constraints.length > 0) {
        // Try with orderBy first
        try {
          q = query(
            collection(db, PRODUCTS_COLLECTION),
            ...constraints,
            orderBy('order', 'asc')
          );
          // Use cache for existing users, server for new users
          snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
        } catch (e) {
          // If orderBy fails, try without it
          // Firestore index may be missing - this is expected and handled gracefully
          // Silently fallback to fetching without order
          q = query(
            collection(db, PRODUCTS_COLLECTION),
            ...constraints
          );
          snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
        }
      } else {
        // No constraints, try with orderBy
        try {
          q = query(collection(db, PRODUCTS_COLLECTION), orderBy('order', 'asc'));
          snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
        } catch (e) {
          // If orderBy fails, fetch without it
          console.warn("Firestore orderBy('order') failed for products, fetching without order and sorting in memory.", e);
          q = query(collection(db, PRODUCTS_COLLECTION));
          snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
        }
      }
    } catch (error) {
      console.error('Error executing Firestore query:', error);
      // Last resort: fetch all without any ordering
      q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
      snapshot = useCache ? await getDocs(q) : await getDocsFromServer(q);
    }
    
    let products = snapshot.docs.map(doc => {
      const data = doc.data();
      // CRITICAL: Preserve Firestore document ID as 'id'
      // If data has a user-defined 'id' field, it will be overwritten by doc.id
      
      // Build product object ensuring Firestore document ID takes precedence
      const product = {
        ...data,
        id: doc.id // ALWAYS use Firestore document ID - this overwrites any user-defined 'id' field
      };
      
      return product;
    });
    
    // Sort in memory if orderBy wasn't applied (check if query has orderBy)
    const hasOrderBy = snapshot.query && snapshot.query._query && snapshot.query._query.orderBy && snapshot.query._query.orderBy.length > 0;
    if (!hasOrderBy) {
      products.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    // Mark user as existing after first successful fetch
    if (!useCache && products.length >= 0) {
      markUserAsExisting();
    }
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get a single product by ID
 * Uses cache for existing users, server for new users
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Product data
 */
export const getProduct = async (id) => {
  try {
    const useCache = isExistingUser();
    // Use cache for existing users, server for new users
    const docSnap = useCache 
      ? await getDoc(doc(db, PRODUCTS_COLLECTION, id))
      : await getDocFromServer(doc(db, PRODUCTS_COLLECTION, id));
    if (docSnap.exists()) {
      // Mark user as existing after first successful fetch
      if (!useCache) {
        markUserAsExisting();
      }
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Add a new product
 * @param {Object} product - Product data
 * @returns {Promise<string>} Document ID of the new product
 */
export const addProduct = async (product) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), compressedData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

/**
 * Update an existing product
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateProduct = async (id, updates) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), compressedData);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product
 * @param {string} id - Document ID
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
  try {
    if (!id) {
      throw new Error('Product ID is required for deletion');
    }
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    console.error('Product ID attempted:', id);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

