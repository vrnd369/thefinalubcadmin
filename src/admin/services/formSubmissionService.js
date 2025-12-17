import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { validateAndCompressDocument } from "../../utils/firestoreCompression";

const FORM_SUBMISSIONS_COLLECTION = "formSubmissions";
const FILES_COLLECTION = "formSubmissionFiles";

/**
 * Upload a file to Firestore
 * @param {File} file - File to upload
 * @param {string} submissionId - Optional submission ID to associate with
 * @returns {Promise<string>} Document ID of the uploaded file
 */
const uploadFileToFirestore = async (file, submissionId = null) => {
  // Firestore document limit is 1MB, but base64 encoding increases size by ~33%
  // So we limit to ~750KB to be safe
  const MAX_FILE_SIZE = 750 * 1024; // 750KB

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size (${(file.size / 1024).toFixed(
        2
      )}KB) exceeds maximum allowed size of ${(MAX_FILE_SIZE / 1024).toFixed(
        2
      )}KB. Please compress or use a smaller file.`
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Data = e.target.result;

        // Check actual base64 size (after encoding)
        const base64Only = base64Data.split(",")[1] || "";
        const estimatedSize = Math.ceil(base64Only.length * 0.75);

        if (estimatedSize > MAX_FILE_SIZE) {
          throw new Error(
            `File is too large after encoding (${(estimatedSize / 1024).toFixed(
              2
            )}KB). Maximum size is ${(MAX_FILE_SIZE / 1024).toFixed(2)}KB.`
          );
        }

        const fileData = {
          name: file.name,
          data: base64Data,
          contentType: file.type,
          size: file.size,
          submissionId: submissionId,
          uploadedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, FILES_COLLECTION), fileData);
        resolve(docRef.id);
      } catch (error) {
        console.error("❌ Error in uploadFileToFirestore:", error);
        reject(error);
      }
    };
    reader.onerror = (error) => {
      console.error("❌ FileReader error:", error);
      reject(new Error("Failed to read file. Please try again."));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Submit a form (public access - no auth required)
 * @param {Object} formData - Form submission data
 * @param {File} file - Optional file to upload
 * @returns {Promise<string>} Document ID of the submission
 */
export const submitForm = async (formData, file = null) => {
  try {

    let fileId = null;
    let fileName = null;

    // Upload file if provided
    if (file) {
      try {
        fileName = file.name;
        fileId = await uploadFileToFirestore(file);

        // Verify fileId was actually returned
        if (!fileId) {
          console.error("❌ File upload returned null/undefined fileId");
          throw new Error("File upload failed: No file ID returned");
        }
      } catch (fileError) {
        console.error("❌ Error uploading file:", fileError);
        console.error("File upload error:", fileError.message);
        // Reset file variables on error
        fileId = null;
        fileName = null;
        // Store error message in submission for debugging
        // The submission will still be saved, but without the file
        // This allows the form to be submitted even if file upload fails
        console.warn(
          "⚠️ Continuing with form submission despite file upload failure"
        );
        // Re-throw the error so the calling code can inform the user
        // But wrap it in a user-friendly message
        throw new Error(
          `File upload failed: ${
            fileError.message || "Unknown error"
          }. The form will be submitted without the file. Please try uploading again or contact support if the problem persists.`
        );
      }
    }

    const submissionData = {
      ...formData,
      status: "new", // new, read, archived
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Add file information if file was uploaded
    if (fileId && fileName) {
      submissionData.fileId = fileId;
      submissionData.fileName = fileName;
      submissionData.fileSize = file.size;
      submissionData.fileType = file.type;
    } else if (formData.fileName) {
      // Keep fileName if provided (for backward compatibility)
      submissionData.fileName = formData.fileName;
    } else if (file) {
      // File was provided but upload failed
      console.warn(
        "⚠️ File was provided but upload failed. File info not included in submission."
      );
    }

    const compressedData = await validateAndCompressDocument(submissionData);

    const docRef = await addDoc(
      collection(db, FORM_SUBMISSIONS_COLLECTION),
      compressedData
    );

    // Update file document with submission ID if file was uploaded
    if (fileId && docRef.id) {
      try {
        const fileDocRef = doc(db, FILES_COLLECTION, fileId);
        await updateDoc(fileDocRef, { submissionId: docRef.id });
      } catch (updateError) {
        console.error(
          "❌ Error updating file with submission ID:",
          updateError
        );
        // Non-critical error, continue
      }
    }

    return docRef.id;
  } catch (error) {
    console.error("❌ Error submitting form:", error);
    throw error;
  }
};

/**
 * Get all form submissions (admin only)
 * @returns {Promise<Array>} Array of form submissions
 */
export const getFormSubmissions = async () => {
  try {
    const q = query(
      collection(db, FORM_SUBMISSIONS_COLLECTION),
      orderBy("submittedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });


    return submissions;
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    throw error;
  }
};

/**
 * Get a single form submission by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Form submission data
 */
export const getFormSubmission = async (id) => {
  try {
    const docRef = doc(db, FORM_SUBMISSIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Form submission not found");
    }
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Error fetching form submission:", error);
    throw error;
  }
};

/**
 * Update form submission status
 * @param {string} id - Document ID
 * @param {string} status - new, read, archived
 * @returns {Promise<void>}
 */
export const updateFormSubmissionStatus = async (id, status) => {
  try {
    const docRef = doc(db, FORM_SUBMISSIONS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating form submission status:", error);
    throw error;
  }
};

/**
 * Delete a form submission
 * @param {string} id - Document ID
 * @returns {Promise<void>}
 */
export const deleteFormSubmission = async (id) => {
  try {
    const docRef = doc(db, FORM_SUBMISSIONS_COLLECTION, id);
    await deleteDoc(docRef);

    // Also delete associated file if exists
    try {
      const fileQuery = query(
        collection(db, FILES_COLLECTION),
        where("submissionId", "==", id)
      );
      const fileSnapshot = await getDocs(fileQuery);
      fileSnapshot.forEach(async (fileDoc) => {
        await deleteDoc(fileDoc.ref);
      });
    } catch (fileError) {
      console.error("Error deleting associated file:", fileError);
      // Non-critical, continue
    }
  } catch (error) {
    console.error("Error deleting form submission:", error);
    throw error;
  }
};

/**
 * Get file data by file ID
 * @param {string} fileId - File document ID
 * @returns {Promise<Object>} File data with download URL
 */
export const getFormSubmissionFile = async (fileId) => {
  try {
    if (!fileId) {
      throw new Error("File ID is required");
    }

    const fileDocRef = doc(db, FILES_COLLECTION, fileId);
    const fileDoc = await getDoc(fileDocRef);

    if (!fileDoc.exists()) {
      console.error("❌ File document does not exist:", fileId);
      throw new Error("File not found in database");
    }

    const fileData = fileDoc.data();

    if (!fileData.data) {
      console.error("❌ File data is missing");
      throw new Error("File data is missing from document");
    }


    return {
      id: fileDoc.id,
      name: fileData.name,
      data: fileData.data, // Base64 data URL
      contentType: fileData.contentType,
      size: fileData.size,
    };
  } catch (error) {
    console.error("❌ Error fetching file:", error);
    throw new Error(error.message || "Failed to fetch file from database");
  }
};
