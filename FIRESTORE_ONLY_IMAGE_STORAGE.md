# Firestore-Only Image Storage Implementation

## Overview

This implementation stores all images in Firestore (not Firebase Storage) to work within the Spark Plan limitations. Images are stored as separate documents in an `images` collection, and home sections reference them by document ID.

## How It Works

### Architecture

1. **Images Collection**: Each image is stored as a separate document in the `images` Firestore collection
   - Document contains: `name`, `data` (base64), `contentType`, `size`, `uploadedAt`
   - Each image document is limited to ~500KB (leaves room for other fields)
   - Home sections stay under 1MB because they only store image IDs (not base64)

2. **Image References**: Home sections store image document IDs instead of base64 strings
   - Example: `content.image = "abc123"` (document ID)
   - Components resolve IDs to URLs when rendering

3. **Image Resolution**: Components use `resolveImageUrl()` utility to:
   - Check if value is already a URL (base64 or http) → use directly
   - If it's an ID → fetch from Firestore `images` collection
   - Return base64 data URL for rendering

## Files Changed

### 1. `src/admin/services/imageService.js`
- **Changed**: Now stores images in Firestore `images` collection
- **Returns**: Document ID (not URL)
- **Compression**: Images compressed to 500KB max before upload
- **Functions**:
  - `uploadImage(file, name)` → Returns document ID
  - `getImageById(imageId)` → Returns base64 data URL
  - `getAllImages()` → Returns array with IDs and base64 URLs
  - `deleteImage(imageId)` → Deletes from Firestore

### 2. `src/admin/components/ImageSelector/ImageSelector.jsx`
- **Changed**: Now handles image IDs instead of URLs
- **Features**:
  - Uploads return document IDs
  - Automatically resolves IDs to URLs for preview
  - Supports both IDs and URLs (backward compatible)
  - Compression target: 500KB (down from 1MB)

### 3. `src/utils/imageUtils.js` (NEW)
- **Purpose**: Utility to resolve image IDs to URLs
- **Function**: `resolveImageUrl(imageRef)` → Returns base64 or http URL

### 4. `src/components/DynamicSections/OverviewSection.jsx`
- **Changed**: Resolves image IDs for logo and background image
- **Uses**: `resolveImageUrl()` in `useEffect`

### 5. `src/components/DynamicSections/TextImageSection.jsx`
- **Changed**: Resolves image ID for section image
- **Uses**: `resolveImageUrl()` in `useEffect`

### 6. `src/components/DynamicSections/CarouselSection.jsx`
- **Changed**: Resolves image IDs for each carousel item
- **Uses**: `resolveImageUrl()` in `BrandCard` component

### 7. `src/components/DynamicSections/FeatureCardsSection.jsx`
- **Changed**: Resolves icon image IDs for each feature card
- **Uses**: `resolveImageUrl()` in `FeatureCard` component

### 8. `src/admin/services/homeSectionMigration.js`
- **Changed**: Migrates base64 images to Firestore `images` collection
- **Process**:
  1. Finds base64 images in home sections
  2. Uploads each to `images` collection as separate document
  3. Replaces base64 string with document ID
  4. Updates home section document

### 9. `FIRESTORE_RULES.md`
- **Updated**: Added rule for `images` collection

## Firestore Rules Required

Add this to your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... existing rules ...
    
    // Allow read/write access to images collection
    match /images/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Migration Process

1. **Go to Home Management** (`/admin/home`)
2. **Click "🔄 Fix Document Size"** button
3. **Confirm migration**
4. System will:
   - Find all sections with base64 images
   - Upload each image to `images` collection
   - Replace base64 with document IDs
   - Update home section documents

## Benefits

✅ **Works on Spark Plan** - No Storage needed  
✅ **Stays under 1MB limit** - Images in separate documents  
✅ **Backward compatible** - Handles both IDs and URLs  
✅ **Automatic compression** - Images compressed to 500KB  
✅ **Easy migration** - One-click migration tool  

## Limitations

⚠️ **500KB per image** - Images must be compressed to 500KB  
⚠️ **Separate documents** - Each image = 1 Firestore document  
⚠️ **Read operations** - Components fetch images separately (slight performance impact)  

## Image Size Limits

- **Before compression**: Max 20MB
- **After compression**: Max 500KB per image
- **Home section document**: Max 1MB (but stays small with IDs)

## Usage Example

### Uploading an Image
```javascript
const imageId = await uploadImage(file, 'my-image.jpg');
// Returns: "abc123" (document ID)
```

### Using in Home Section
```javascript
{
  content: {
    image: "abc123", // Document ID, not base64
    backgroundImage: "def456"
  }
}
```

### Rendering in Component
```javascript
const imageUrl = await resolveImageUrl(content.image);
// Returns: "data:image/jpeg;base64,..." or http URL
<img src={imageUrl} />
```

## Troubleshooting

### "Document size exceeds 1MB" error
- Run the migration tool to move base64 images to separate documents
- Check if any section still has base64 data

### Images not showing
- Check Firestore rules allow read access to `images` collection
- Verify image ID exists in `images` collection
- Check browser console for errors

### Upload fails
- Verify Firestore rules allow write to `images` collection
- Check image is compressed to under 500KB
- Verify internet connection

