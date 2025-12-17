# Firebase Data Migration Guide

## How to Import Data from Old Firebase Project to New Project

This guide will help you migrate all your data from the old Firebase project (`theubc-e055c`) to the new one (`theubc-bec27`).

---

## Method 1: Using Migration Script (Recommended)

### Step 1: Install Dependencies (if needed)

The script uses Firebase SDK which should already be installed. If not:

```bash
npm install firebase
```

### Step 2: Run the Migration Script

```bash
node scripts/migrate-firebase-data.js
```

The script will:
- ✅ Connect to your old Firebase project
- ✅ Export all data from all collections
- ✅ Import into your new Firebase project
- ✅ Show progress and summary

### Step 3: Verify Migration

1. Go to Firebase Console → New Project (`theubc-bec27`)
2. Check Firestore Database
3. Verify all collections have data

---

## Method 2: Manual Export/Import via Firebase Console

### Export from Old Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select old project**: `theubc-e055c`
3. **Go to Firestore Database**
4. **For each collection**:
   - Click on the collection
   - Manually copy data (or use Export feature if available)

### Import to New Project

1. **Go to Firebase Console**
2. **Select new project**: `theubc-bec27`
3. **Go to Firestore Database**
4. **Create collections and add documents manually**

⚠️ **Note**: This method is time-consuming for large datasets.

---

## Method 3: Using Firebase CLI (Advanced)

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Export from Old Project

```bash
# Set old project
firebase use theubc-e055c

# Export Firestore data
gcloud firestore export gs://your-bucket-name/backup
```

### Step 4: Import to New Project

```bash
# Set new project
firebase use theubc-bec27

# Import Firestore data
gcloud firestore import gs://your-bucket-name/backup
```

---

## Method 4: Using Admin Panel Import Features

Your application has built-in import features:

### For Home Sections:
1. Go to Admin Panel → Home Management
2. Click "Import from Live Website"
3. This will import your current static home sections

### For Products:
1. Go to Admin Panel → Product Management
2. Click "Import Existing Data"
3. This will import brands, categories, and products

### For Other Sections:
- **About**: Admin Panel → About Management → Import
- **Brand Pages**: Admin Panel → Brand Pages Management → Import
- **Contact**: Admin Panel → Contact Management → Import
- **Careers**: Admin Panel → Careers Management → Import

---

## Collections to Migrate

Make sure these collections are migrated:

- ✅ `homeSections` - Home page content
- ✅ `aboutSections` - About page content
- ✅ `brands` - Brand data
- ✅ `categories` - Category data
- ✅ `products` - Product data
- ✅ `brandPages` - Brand page content
- ✅ `navigation` - Navigation menu
- ✅ `contactPage` - Contact page config
- ✅ `careersPage` - Careers page config
- ✅ `header` - Header/navbar config
- ✅ `footer` - Footer config
- ✅ `images` - Image documents (base64)
- ✅ `videos` - Video documents (base64)
- ✅ `formSubmissions` - Form submissions (optional)
- ✅ `formSubmissionFiles` - Form files (optional)

---

## Important Notes

### ⚠️ Before Migration:

1. **Backup**: Make sure you have a backup of your old data
2. **Firestore Rules**: Ensure new project has proper Firestore rules set up
3. **Storage**: If using Firebase Storage, migrate Storage files separately
4. **Test**: Test migration on a small collection first

### ⚠️ After Migration:

1. **Verify Data**: Check that all data migrated correctly
2. **Test Website**: Make sure website loads correctly
3. **Check Images**: Verify images are displaying
4. **Test Forms**: Test form submissions work

### ⚠️ Limitations:

- **Document IDs**: New documents will have new IDs (old IDs won't be preserved)
- **References**: If documents reference each other by ID, you may need to update references
- **Storage Files**: If you use Firebase Storage, those need to be migrated separately

---

## Troubleshooting

### "Permission Denied" Error
- Check Firestore rules in new project
- Make sure rules allow read/write access

### "Collection Not Found" Error
- Collection doesn't exist in old project (this is OK)
- Script will skip and continue

### "Rate Limit" Error
- Script includes delays to avoid rate limiting
- If still getting errors, increase delay in script

### "Document Too Large" Error
- Some documents might be too large
- Check document size in Firebase Console
- May need to split large documents

---

## Quick Start (Recommended)

1. **Run the migration script**:
   ```bash
   node scripts/migrate-firebase-data.js
   ```

2. **Wait for completion** (may take a few minutes)

3. **Refresh your website** - data should now appear!

4. **Verify in Firebase Console** - check that collections have data

---

## Need Help?

If migration fails:
1. Check browser console for errors
2. Check Firebase Console for permission issues
3. Verify Firestore rules are set correctly
4. Try migrating one collection at a time

