# Fix: Missing or Insufficient Permissions Error

## Quick Fix (5 minutes)

You're getting this error because Firebase Firestore doesn't have permission rules for the `homeSections` collection yet.

### Steps to Fix:

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your project: **theubc-e055c**

2. **Navigate to Firestore Rules**
   - Click on **Firestore Database** in the left sidebar
   - Click on the **Rules** tab at the top

3. **Update the Rules**
   - Find the rules editor
   - Add this rule for `homeSections` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow read/write access to navigation collection
    match /navigation/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to navigation-icons collection
    match /navigation-icons/{document=**} {
      allow read, write: if true;
    }
    
    // ✅ ADD THIS - Allow read/write access to homeSections collection
    match /homeSections/{document=**} {
      allow read, write: if true;
    }
    
    // Default rule: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. **Publish the Rules**
   - Click the **Publish** button
   - Wait a few seconds for rules to update

5. **Try Again**
   - Go back to your app
   - Click "Import from Live Website" again
   - It should work now! ✅

## Visual Guide

```
Firebase Console
  └── Project: theubc-e055c
      └── Firestore Database
          └── Rules (tab)
              └── [Paste the rules above]
                  └── Publish
```

## What This Does

- Allows reading and writing to the `homeSections` collection
- This is needed for:
  - Importing sections from live website
  - Creating new sections
  - Editing existing sections
  - Deleting sections

## Security Note

⚠️ These rules allow **anyone** to read/write. For production, you should add authentication checks. See `FIRESTORE_RULES.md` for production-ready rules.

## Still Having Issues?

1. Make sure you clicked **Publish** (not just Save)
2. Wait 10-15 seconds after publishing
3. Refresh your browser
4. Check browser console for other errors
5. Verify you're using the correct Firebase project

