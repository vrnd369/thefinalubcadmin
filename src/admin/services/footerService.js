import { doc, getDoc, getDocFromServer, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { validateAndCompressDocument } from "../../utils/firestoreCompression";
import { isExistingUser, markUserAsExisting } from "../../utils/userCache";

const FOOTER_COLLECTION = "footer";
const FOOTER_DOC_ID = "default";

/**
 * Get Footer configuration (single document)
 * Uses cache for existing users, server for new users
 */
export const getFooterConfig = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, FOOTER_COLLECTION, FOOTER_DOC_ID);
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
    console.error("Error fetching footer config:", error);
    throw error;
  }
};

/**
 * Check if a Footer config already exists
 */
export const hasFooterConfig = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, FOOTER_COLLECTION, FOOTER_DOC_ID);
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    return snap.exists();
  } catch (error) {
    console.error("Error checking footer config:", error);
    return false;
  }
};

/**
 * Save (create or update) Footer configuration
 */
export const saveFooterConfig = async (config) => {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...config,
      updatedAt: now,
    };
    if (!config.createdAt) {
      payload.createdAt = now;
    }

    const compressedData = await validateAndCompressDocument(payload);

    const ref = doc(db, FOOTER_COLLECTION, FOOTER_DOC_ID);
    await setDoc(ref, compressedData, { merge: true });
  } catch (error) {
    console.error("Error saving footer config:", error);
    throw error;
  }
};

/**
 * Import initial Footer configuration from the current static Footer.jsx
 */
export const importFooterFromLive = async () => {
  const defaultConfig = {
    // Background color
    backgroundColor: "#333494",

    // Logo
    logo: {
      url: "/assets/Logo.png",
      width: 203,
      height: 78.65,
      alt: "UBC",
    },

    // Navigation links (will be populated from navigation management)
    navigationLinks: [],

    // Contact info
    contact: {
      email: {
        label: "Email",
        value: "info@theubc.com",
        href: "mailto:info@theubc.com",
      },
      phone: {
        label: "Phone",
        value: "+91 95878 35849",
        href: "tel:+919587835849",
      },
    },

    // Slogan
    slogan: {
      text: "Crafting purity,\npreserving taste.",
      fontFamily: "Inter",
      fontSize: 48,
      fontWeight: 500,
      color: "#FFFFFF",
      lineHeight: 106,
      letterSpacing: -0.05,
      textTransform: "lowercase",
    },

    // Social media links
    socialMedia: [
      {
        id: "linkedin",
        name: "LinkedIn",
        url: "https://linkedin.com",
        icon: "linkedin",
      },
    ],

    // Addresses
    addresses: [
      {
        id: "corporate",
        heading: "Corporate Office",
        text: "H.No. 8-2-334/60 & 61,\nRoad No. 5, Banjara Hills,\nHyderabad-500034,\nTelangana.",
        fontFamily: "Inter",
        fontSize: 12,
        fontWeight: 400,
        color: "#C9D2FF",
        lineHeight: 140,
      },
      {
        id: "main",
        heading: "Main Office",
        text: "Sy. No 810 to 812 & 820, 821,\nVillage & Mandal :\nGummadidala-502313, District:\nSangareddy- Telangana.",
        fontFamily: "Inter",
        fontSize: 12,
        fontWeight: 400,
        color: "#C9D2FF",
        lineHeight: 140,
      },
    ],

    // Bottom bar
    bottomBar: {
      developedBy: {
        text: "Designed & Developed by",
        company: "WikiWakyWoo",
        url: "https://www.wikiwakywoo.com/",
        fontFamily: "Inter",
        fontSize: 10.6,
        fontWeight: 400,
        color: "rgba(255, 255, 255, 0.6)",
        lineHeight: 17.5,
      },
      copyright: {
        text: "All Rights Reserved, United Brothers Company (UBC)",
        fontFamily: "Inter",
        fontSize: 10.6,
        fontWeight: 400,
        color: "rgba(255, 255, 255, 0.6)",
        lineHeight: 17.5,
      },
      legalLinks: [
        {
          id: "privacy",
          text: "Privacy policy",
          url: "/privacy",
        },
        {
          id: "cookies",
          text: "Cookies",
          url: "/cookies",
        },
      ],
    },

    // Responsive dimensions
    dimensions: {
      desktop: {
        paddingTop: 72,
        paddingBottom: 24,
        minHeight: 574,
        logoWidth: 203,
        logoHeight: 78.65,
        gridColumns: "520px 260px 320px",
        columnGap: 64,
        rowGap: 48,
      },
      tablet: {
        paddingTop: 64,
        paddingBottom: 24,
        logoWidth: 190,
        logoHeight: 73.5,
        columnGap: 40,
        rowGap: 36,
      },
      mobile: {
        paddingTop: 56,
        paddingBottom: 20,
        logoWidth: 150,
        logoHeight: 58,
        columnGap: 24,
        rowGap: 32,
      },
      smallMobile: {
        paddingTop: 48,
        paddingBottom: 16,
        logoWidth: 150,
        logoHeight: 58,
        columnGap: 16,
        rowGap: 24,
      },
    },
  };

  try {
    await saveFooterConfig(defaultConfig);
    return defaultConfig;
  } catch (error) {
    console.error("Error importing footer from live:", error);
    throw error;
  }
};
