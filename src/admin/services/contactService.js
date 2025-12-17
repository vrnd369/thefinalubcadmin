import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { validateAndCompressDocument } from '../../utils/firestoreCompression';
import { isExistingUser, markUserAsExisting } from '../../utils/userCache';

const CONTACT_COLLECTION = 'contactPage';
const CONTACT_DOC_ID = 'default';

/**
 * Get Contact page configuration (single document)
 * Uses cache for existing users, server for new users
 */
export const getContactConfig = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, CONTACT_COLLECTION, CONTACT_DOC_ID);
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    if (!snap.exists()) {
      return null;
    }
    // Mark user as existing after first successful fetch
    if (!useCache) {
      markUserAsExisting();
    }
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error('Error fetching contact config:', error);
    throw error;
  }
};

/**
 * Check if a Contact page config already exists
 */
export const hasContactConfig = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, CONTACT_COLLECTION, CONTACT_DOC_ID);
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    return snap.exists();
  } catch (error) {
    console.error('Error checking contact config:', error);
    return false;
  }
};

/**
 * Save (create or update) Contact page configuration
 */
export const saveContactConfig = async (config) => {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...config,
      updatedAt: now
    };
    if (!config.createdAt) {
      payload.createdAt = now;
    }

    const compressedData = await validateAndCompressDocument(payload);

    const ref = doc(db, CONTACT_COLLECTION, CONTACT_DOC_ID);
    await setDoc(ref, compressedData, { merge: true });
  } catch (error) {
    console.error('Error saving contact config:', error);
    throw error;
  }
};

/**
 * Import initial Contact page configuration from the current static Contact.jsx
 * This gives a one-click way to bootstrap the CMS from the live site design.
 */
export const importContactFromLive = async () => {
  // These defaults mirror the current static Contact.jsx and Contact.css
  const defaultConfig = {
    pageTitle: 'Contact Us - UBC | United Brothers Company',
    bannerTagStar: '★',
    bannerTagText: 'CONTACT US',
    heading: 'Get in touch with us',
    // Info panel (left)
    infoPanel: {
      backgroundColor: '#323790',
      width: 413,
      height: 542,
      paddingTop: 48,
      paddingRight: 40,
      paddingBottom: 48,
      paddingLeft: 40,
      gap: 40
    },
    // Items shown in the left panel
    infoItems: [
      {
        id: 'corporate',
        type: 'location',
        title: 'Corporate Office',
        text: 'H.No. 8-2-334/60 & 61, Road No. 5,\nBanjara Hills, Hyderabad-500034, Telangana.',
        locationKey: 'corporate'
      },
      {
        id: 'mfg',
        type: 'location',
        title: 'Mfg. Office & Facility',
        text: 'Sy. No. 810-812, 820 & 821,\nGummadidala (Village & Mandal) –\n502313, Sangareddy District,\nTelangana.',
        locationKey: 'mfg'
      },
      {
        id: 'email',
        type: 'email',
        title: 'Email',
        text: 'marketing@soilkingfoods.com'
      },
      {
        id: 'phone',
        type: 'phone',
        title: 'Call us',
        text: '+91 8143150953 | 04023399533'
      }
    ],
    // Map locations and embeds
    locations: [
      {
        id: 'loc-corporate',
        key: 'corporate',
        name: 'Corporate Office',
        address: 'H.No. 8-2-334/60 & 61, Road No. 5, Banjara Hills, Hyderabad-500034, Telangana.',
        mapEmbed:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.5!2d78.4250!3d17.4230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91d8b8b8b8b9%3A0x3b8b8b8b8b8b8b8b!2sRoad+No.+5%2C+Banjara+Hills%2C+Hyderabad%2C+Telangana+500034!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin',
        directionsUrl:
          'https://www.google.com/maps/search/?api=1&query=H.No.+8-2-334%2F60+%26+61%2C+Road+No.+5%2C+Banjara+Hills%2C+Hyderabad-500034%2C+Telangana'
      },
      {
        id: 'loc-mfg',
        key: 'mfg',
        name: 'Mfg. Office & Facility',
        address:
          'Sy. No. 810-812, 820 & 821, Gummadidala (Village & Mandal) – 502313, Sangareddy District, Telangana.',
        mapEmbed:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.5!2d78.4250!3d17.4230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91d8b8b8b8b9%3A0x3b8b8b8b8b8b8b8b!2sGummadidala%2C+Telangana+502313!5e0!3m2!1sen!2sin!4v1234567890124!5m2!1sen!2sin',
        directionsUrl:
          'https://www.google.com/maps/search/?api=1&query=Sy.+No.+810-812%2C+820+%26+821%2C+Gummadidala%2C+Sangareddy+District%2C+Telangana+502313'
      }
    ],
    defaultLocationKey: 'corporate',
    mapContainer: {
      width: 853,
      height: 541,
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
      grayscale: true
    },
    directionsButton: {
      text: 'Get Directions',
      backgroundColor: '#323790',
      textColor: '#FFFFFF'
    },
    // Tell Us Section with default form fields
    tellUsSection: {
      tagStar: '★',
      tagText: 'TELL US',
      heading: 'Tell Us\nWhat You Need',
      description: 'Whether it\'s bulk orders, private\nlabeling, or partnerships —\nwe\'re here to help.',
      backgroundColor: '#000000',
      buttonBackgroundColor: '#323790',
      buttonTextColor: '#FFFFFF',
      submitButtonText: 'Submit Form',
      formFields: [
        {
          name: 'firstName',
          label: 'First Name',
          type: 'text',
          placeholder: 'John',
          required: true
        },
        {
          name: 'lastName',
          label: 'Last Name',
          type: 'text',
          placeholder: 'Smith',
          required: true
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'john@example.com',
          required: true
        },
        {
          name: 'requirement',
          label: 'Requirement',
          type: 'select',
          defaultValue: 'Bulk Orders',
          options: [
            'Bulk Orders',
            'Private Labeling',
            'Partnerships',
            'General Inquiry'
          ],
          required: true
        },
        {
          name: 'message',
          label: 'Message',
          type: 'textarea',
          placeholder: 'Your message here...',
          rows: 5,
          required: false
        }
      ]
    }
  };

  await saveContactConfig(defaultConfig);
  return defaultConfig;
};


