import { getHomeSections, getHomeSection, updateHomeSection } from './homeService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

/**
 * Check if a string is a base64 data URL
 */
const isBase64DataUrl = (str) => {
  return typeof str === 'string' && str.startsWith('data:image/');
};

/**
 * Upload base64 image to Firestore images collection and return document ID
 */
const uploadBase64ToFirestore = async (base64String, filename) => {
  try {
    // Extract content type from base64 string
    const mimeMatch = base64String.match(/data:([^;]+);/);
    const contentType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    
    // Calculate size (approximate)
    const base64Data = base64String.split(',')[1];
    const size = Math.ceil(base64Data.length * 0.75); // Base64 is ~33% larger than binary
    
    // Check size (should be under 500KB)
    if (size > 500 * 1024) {
      throw new Error(`Image is too large (${(size / 1024).toFixed(2)}KB). Maximum is 500KB per image.`);
    }
    
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const imageName = `${timestamp}_${sanitizedName}`;
    
    // Store in Firestore images collection
    const docRef = await addDoc(collection(db, 'images'), {
      name: imageName,
      data: base64String, // Store base64 data
      contentType: contentType,
      size: size,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      migrated: true // Mark as migrated
    });
    
    console.log(`✓ Uploaded base64 image to Firestore: ${docRef.id}`);
    return docRef.id; // Return document ID
  } catch (error) {
    console.error('Error uploading base64 to Firestore:', error);
    throw error;
  }
};

/**
 * Recursively find and replace base64 image URLs in an object
 */
const migrateBase64InObject = async (obj, path = '') => {
  const result = { ...obj };
  
  for (const key in result) {
    if (result.hasOwnProperty(key)) {
      const value = result[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string' && isBase64DataUrl(value)) {
        // Found a base64 image - upload to Firestore images collection
        console.log(`Found base64 image at ${currentPath}, uploading to Firestore...`);
        try {
          const filename = `${currentPath.replace(/\./g, '_')}.jpg`;
          const imageId = await uploadBase64ToFirestore(value, filename);
          result[key] = imageId; // Store document ID instead of base64
          console.log(`✓ Migrated ${currentPath} to Firestore image ID: ${imageId}`);
        } catch (error) {
          console.error(`Failed to migrate ${currentPath}:`, error);
          // Keep original if upload fails
        }
      } else if (Array.isArray(value)) {
        // Recursively process array items
        result[key] = await Promise.all(
          value.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
              return migrateBase64InObject(item, `${currentPath}[${index}]`);
            } else if (typeof item === 'string' && isBase64DataUrl(item)) {
              return uploadBase64ToFirestore(item, `${currentPath}_${index}.jpg`)
                .catch(err => {
                  console.error(`Failed to migrate ${currentPath}[${index}]:`, err);
                  return item; // Keep original if upload fails
                });
            }
            return item;
          })
        );
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        result[key] = await migrateBase64InObject(value, currentPath);
      }
    }
  }
  
  return result;
};

/**
 * Migrate a single home section - replace base64 images with Storage URLs
 * @param {string} sectionId - ID of the section to migrate
 * @returns {Promise<Object>} Updated section data
 */
export const migrateHomeSection = async (sectionId) => {
  try {
    console.log(`Starting migration for section: ${sectionId}`);
    
    // Get the section
    const section = await getHomeSection(sectionId);
    if (!section) {
      throw new Error(`Section ${sectionId} not found`);
    }
    
    // Migrate base64 images in content
    let migratedContent = section.content || {};
    if (section.content) {
      migratedContent = await migrateBase64InObject(section.content, 'content');
    }
    
    // Migrate base64 images in styles (if any)
    let migratedStyles = section.styles || {};
    if (section.styles) {
      migratedStyles = await migrateBase64InObject(section.styles, 'styles');
    }
    
    // Prepare updated section
    const updatedSection = {
      ...section,
      content: migratedContent,
      styles: migratedStyles,
      migratedAt: new Date().toISOString()
    };
    
    // Remove the id field before updating (it's the document ID, not a field)
    delete updatedSection.id;
    
    // Update the section
    await updateHomeSection(sectionId, updatedSection);
    
    console.log(`✓ Successfully migrated section: ${sectionId}`);
    return updatedSection;
  } catch (error) {
    console.error(`Error migrating section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Migrate all home sections that contain base64 images
 * @returns {Promise<Array>} Array of migrated section IDs
 */
export const migrateAllHomeSections = async () => {
  try {
    console.log('Starting migration of all home sections...');
    
    const sections = await getHomeSections();
    const migratedIds = [];
    
    for (const section of sections) {
      try {
        // Check if section has base64 images
        const hasBase64 = JSON.stringify(section).includes('data:image/');
        
        if (hasBase64) {
          console.log(`Section ${section.id} contains base64 images, migrating...`);
          await migrateHomeSection(section.id);
          migratedIds.push(section.id);
        } else {
          console.log(`Section ${section.id} is already migrated or has no images.`);
        }
      } catch (error) {
        console.error(`Failed to migrate section ${section.id}:`, error);
        // Continue with other sections
      }
    }
    
    console.log(`✓ Migration complete. Migrated ${migratedIds.length} sections.`);
    return migratedIds;
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

/**
 * Check if a section needs migration (contains base64 images)
 * @param {string} sectionId - ID of the section to check
 * @returns {Promise<boolean>} True if section needs migration
 */
export const needsMigration = async (sectionId) => {
  try {
    const section = await getHomeSection(sectionId);
    if (!section) return false;
    
    const sectionString = JSON.stringify(section);
    return sectionString.includes('data:image/');
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

