import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const COLLECTION_NAME = "adminUsers";

/**
 * Get all admin users
 */
export async function getAdminUsers() {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    // Sort by created date (newest first)
    return users.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    throw error;
  }
}

/**
 * Get a single admin user by ID
 */
export async function getAdminUser(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin user:", error);
    throw error;
  }
}

/**
 * Get admin user by email
 */
export async function getAdminUserByEmail(email) {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("email", "==", email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin user by email:", error);
    throw error;
  }
}

/**
 * Create a new admin user
 */
export async function createAdminUser(userData) {
  try {
    // Check if email already exists
    const existingUser = await getAdminUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("An admin user with this email already exists.");
    }

    const userDoc = {
      email: userData.email.toLowerCase().trim(),
      password: userData.password ? String(userData.password).trim() : "", // Trim password and ensure it's a string
      role: userData.role,
      name: userData.name || "",
      createdAt: new Date(),
      createdBy: userData.createdBy || null,
      isActive: userData.isActive !== false, // Default to true
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), userDoc);
    return {
      id: docRef.id,
      ...userDoc,
    };
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

/**
 * Update an admin user
 */
export async function updateAdminUser(id, updates) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    // Don't update email if it's the same, or check for duplicates
    if (updates.email) {
      const existingUser = await getAdminUserByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error("An admin user with this email already exists.");
      }
      updateData.email = updates.email.toLowerCase().trim();
    }

    // Trim password if provided
    if (updates.password !== undefined) {
      updateData.password = String(updates.password).trim();
    }

    await updateDoc(docRef, updateData);
    return {
      id,
      ...updateData,
    };
  } catch (error) {
    console.error("Error updating admin user:", error);
    throw error;
  }
}

/**
 * Delete an admin user
 */
export async function deleteAdminUser(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting admin user:", error);
    throw error;
  }
}

/**
 * Authenticate admin user (for login)
 */
export async function authenticateAdminUser(email, password) {
  try {
    // Normalize email (lowercase and trim) to ensure consistent matching
    const normalizedEmail = email ? email.toLowerCase().trim() : "";
    const normalizedPassword = password ? password.trim() : "";

    if (!normalizedEmail || !normalizedPassword) {
      return { success: false, error: "Email and password are required." };
    }

    const user = await getAdminUserByEmail(normalizedEmail);
    if (!user) {
      console.log(`User not found for email: ${normalizedEmail}`);
      return { success: false, error: "Invalid email or password." };
    }

    if (user.isActive === false) {
      return { success: false, error: "This account has been deactivated." };
    }

    // Simple password comparison (in production, use proper password hashing)
    // Compare passwords directly - ensure no extra whitespace
    const storedPassword = user.password ? String(user.password).trim() : "";
    const providedPassword = normalizedPassword;

    if (storedPassword !== providedPassword) {
      console.log(`Password mismatch for user: ${normalizedEmail}`);
      console.log(`Stored password length: ${storedPassword.length}, Provided password length: ${providedPassword.length}`);
      return { success: false, error: "Invalid email or password." };
    }

    // Return user data without password
    const { password: _, ...userData } = user;
    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error("Error authenticating admin user:", error);
    return { success: false, error: "Authentication failed. Please try again." };
  }
}

