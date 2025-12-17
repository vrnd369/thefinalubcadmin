import { doc, getDoc, getDocFromServer, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { validateAndCompressDocument } from "../../utils/firestoreCompression";
import { isExistingUser, markUserAsExisting } from "../../utils/userCache";

const ENQUIRY_FORM_CONFIG_DOC = "enquiry-form-config";

/**
 * Get enquiry form configuration
 * Uses cache for existing users, server for new users
 * @returns {Promise<Object>} Enquiry form configuration
 */
export const getEnquiryFormConfig = async () => {
  try {
    const useCache = isExistingUser();
    const docSnap = useCache 
      ? await getDoc(doc(db, "enquiry-form", ENQUIRY_FORM_CONFIG_DOC))
      : await getDocFromServer(doc(db, "enquiry-form", ENQUIRY_FORM_CONFIG_DOC));
    if (docSnap.exists()) {
      // Mark user as existing after first successful fetch
      if (!useCache) {
        markUserAsExisting();
      }
      return docSnap.data();
    }
    // Return default configuration
    return {
      title: "Enquiry Form",
      subtitle: "Tell us what you need",
      buttonText: "Submit Form",
      submittingText: "Submitting...",
      successMessage: "Thank you! Your enquiry has been submitted successfully.",
      errorMessage: "There was an error submitting your enquiry. Please try again.",
      fields: [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          placeholder: "John",
          required: true,
          order: 1
        },
        {
          name: "lastName",
          label: "Last Name",
          type: "text",
          placeholder: "Smith",
          required: true,
          order: 2
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "john@gmail.com",
          required: true,
          order: 3
        },
        {
          name: "requirement",
          label: "Requirement",
          type: "select",
          placeholder: "Select requirement",
          required: true,
          defaultValue: "Traders and distributors",
          options: [
            "Traders and distributors",
            "Partnership",
            "General Enquiry"
          ],
          order: 4
        },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          placeholder: "Your message here...",
          required: false,
          rows: 5,
          order: 5
        }
      ]
    };
  } catch (error) {
    console.error("Error fetching enquiry form config:", error);
    // Return default on error
    return {
      title: "Enquiry Form",
      subtitle: "Tell us what you need",
      buttonText: "Submit Form",
      submittingText: "Submitting...",
      successMessage: "Thank you! Your enquiry has been submitted successfully.",
      errorMessage: "There was an error submitting your enquiry. Please try again.",
      fields: [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          placeholder: "John",
          required: true,
          order: 1
        },
        {
          name: "lastName",
          label: "Last Name",
          type: "text",
          placeholder: "Smith",
          required: true,
          order: 2
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "john@gmail.com",
          required: true,
          order: 3
        },
        {
          name: "requirement",
          label: "Requirement",
          type: "select",
          placeholder: "Select requirement",
          required: true,
          defaultValue: "Traders and distributors",
          options: [
            "Traders and distributors",
            "Partnership",
            "General Enquiry"
          ],
          order: 4
        },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          placeholder: "Your message here...",
          required: false,
          rows: 5,
          order: 5
        }
      ]
    };
  }
};

/**
 * Set enquiry form configuration
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
export const setEnquiryFormConfig = async (config) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...config,
      updatedAt: new Date().toISOString(),
    });

    await setDoc(doc(db, "enquiry-form", ENQUIRY_FORM_CONFIG_DOC), compressedData, {
      merge: true,
    });
  } catch (error) {
    console.error("Error setting enquiry form config:", error);
    throw error;
  }
};

