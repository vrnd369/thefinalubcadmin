/**
 * Utility functions for managing user cache state
 * Tracks whether a user is "existing" (has visited before) to enable caching
 */

const USER_CACHE_KEY = 'ubc_user_visited';
const CACHE_TIMESTAMP_KEY = 'ubc_cache_timestamp';

/**
 * Check if the current user is an existing user (has visited before)
 * @returns {boolean} True if user has visited before, false if new user
 */
export const isExistingUser = () => {
  try {
    const hasVisited = localStorage.getItem(USER_CACHE_KEY);
    return hasVisited === 'true';
  } catch (error) {
    console.error('Error checking user cache status:', error);
    return false;
  }
};

/**
 * Mark the current user as an existing user
 * This should be called after the first successful data load
 */
export const markUserAsExisting = () => {
  try {
    localStorage.setItem(USER_CACHE_KEY, 'true');
    localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error marking user as existing:', error);
  }
};

/**
 * Clear the user cache status (useful for testing or reset)
 */
export const clearUserCache = () => {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error clearing user cache:', error);
  }
};

/**
 * Get the timestamp when user was first marked as existing
 * @returns {string|null} ISO timestamp or null
 */
export const getCacheTimestamp = () => {
  try {
    return localStorage.getItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error getting cache timestamp:', error);
    return null;
  }
};

