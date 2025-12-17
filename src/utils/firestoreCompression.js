/**
 * Firestore Document Compression & Validation
 *
 * Goal:
 * - Ensure any document we push to Firestore stays under 500KB
 * - Automatically compress base64 image data inside the document
 *
 * NOTE: This utility is intended to run in the browser (uses Image, canvas, FileReader).
 */

const MAX_DOCUMENT_SIZE = 500 * 1024; // 500KB
const MAX_IMAGE_SIZE = 450 * 1024; // 450KB per image (leave room for other fields)

/**
 * Check if a string is a base64 image data URL.
 */
const isBase64DataUrl = (str) => {
  return typeof str === 'string' && str.startsWith('data:image/');
};

/**
 * Compress a base64 image string to under target size.
 * Preserves PNG transparency - only converts to JPEG for non-transparent images.
 * Returns the new base64 string (PNG or JPEG).
 */
const compressBase64Image = (base64String, maxSize = MAX_IMAGE_SIZE) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Initial max dimension to avoid huge canvases
        const MAX_DIMENSION = 1200;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: true }); // Enable alpha channel
        
        // Detect if image has transparency (PNG, GIF, WebP)
        const hasTransparency = base64String.includes('data:image/png') || 
                                base64String.includes('data:image/gif') || 
                                base64String.includes('data:image/webp');
        
        // Only convert to JPEG if not transparent
        const shouldConvertToJpeg = !hasTransparency;
        const outputType = hasTransparency ? 'image/png' : 'image/jpeg';
        
        // Clear canvas to ensure transparency
        ctx.clearRect(0, 0, width, height);
        
        // Only add white background when converting to JPEG
        if (shouldConvertToJpeg) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        // For PNG with transparency, don't fill - let it stay transparent
        
        ctx.drawImage(img, 0, 0, width, height);

        const compress = (quality) => {
          // For PNG, don't use quality parameter (preserves transparency)
          const qualityParam = outputType === 'image/png' ? undefined : quality;
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              if (blob.size > maxSize) {
                if (outputType === 'image/png' || outputType === 'image/gif' || outputType === 'image/webp') {
                  // For transparent formats, only reduce dimensions
                  const newWidth = Math.floor(width * 0.9);
                  const newHeight = Math.floor(height * 0.9);
                  if (newWidth < 50 || newHeight < 50) {
                    // Too small already – stop
                    resolve(base64String);
                    return;
                  }
                  width = newWidth;
                  height = newHeight;
                  canvas.width = width;
                  canvas.height = height;
                  ctx.clearRect(0, 0, width, height);
                  // Don't fill background for transparent formats
                  ctx.drawImage(img, 0, 0, width, height);
                  compress(undefined); // No quality for PNG
                } else if (quality > 0.1) {
                  // For JPEG, reduce quality first
                  const nextQuality = Math.max(0.1, quality - 0.1);
                  compress(nextQuality);
                } else {
                  // Reduce dimensions if still too large after quality reduction
                  const newWidth = Math.floor(width * 0.9);
                  const newHeight = Math.floor(height * 0.9);
                  if (newWidth < 50 || newHeight < 50) {
                    // Too small already – stop
                    resolve(base64String);
                    return;
                  }
                  width = newWidth;
                  height = newHeight;
                  canvas.width = width;
                  canvas.height = height;
                  ctx.clearRect(0, 0, width, height);
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, width, height);
                  ctx.drawImage(img, 0, 0, width, height);
                  compress(0.7);
                }
              } else {
                // Convert blob back to base64
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to convert blob to base64'));
                reader.readAsDataURL(blob);
              }
            },
            outputType,
            qualityParam
          );
        };

        // Start compression - use undefined quality for PNG, 0.9 for JPEG
        const startQuality = outputType === 'image/png' ? undefined : 0.9;
        compress(startQuality);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = base64String;
    } catch (error) {
      console.error('compressBase64Image error:', error);
      // If anything fails, fall back to original string so we do not break saving
      resolve(base64String);
    }
  });
};

/**
 * Recursively walk an object and compress any base64 image strings.
 */
const compressBase64InObject = async (obj, path = '') => {
  if (!obj || typeof obj !== 'object') return obj;

  const result = Array.isArray(obj) ? [...obj] : { ...obj };

  const entries = Array.isArray(result)
    ? result.map((val, index) => [index, val])
    : Object.entries(result);

  for (const [key, value] of entries) {
    const currentPath = path ? `${path}.${key}` : String(key);

    if (typeof value === 'string' && value && isBase64DataUrl(value)) {
      try {
        const commaIndex = value.indexOf(',');
        const base64Data = commaIndex !== -1 ? value.substring(commaIndex + 1) : '';
        const currentSize = Math.ceil(base64Data.length * 0.75);

        if (currentSize > MAX_IMAGE_SIZE) {
          console.log(
            `Compressing base64 image at ${currentPath} (${(currentSize / 1024).toFixed(
              2
            )}KB)...`
          );
          const compressed = await compressBase64Image(value, MAX_IMAGE_SIZE);
          const compressedCommaIndex = compressed && typeof compressed === 'string' ? compressed.indexOf(',') : -1;
          const compressedData = compressedCommaIndex !== -1 ? compressed.substring(compressedCommaIndex + 1) : '';
          const compressedSize = Math.ceil(compressedData.length * 0.75);
          console.log(
            `✓ Compressed ${currentPath} to ${(compressedSize / 1024).toFixed(2)}KB`
          );
          if (Array.isArray(result)) {
            result[key] = compressed;
          } else {
            result[key] = compressed;
          }
        }
      } catch (error) {
        console.error(`Failed to compress ${currentPath}:`, error);
        // Keep original if compression fails
      }
    } else if (Array.isArray(value) || (value && typeof value === 'object')) {
      const compressedChild = await compressBase64InObject(value, currentPath);
      if (Array.isArray(result)) {
        result[key] = compressedChild;
      } else {
        result[key] = compressedChild;
      }
    }
  }

  return result;
};

/**
 * Approximate size of a document in bytes, accounting for base64.
 */
const calculateDocumentSize = (doc) => {
  try {
    const jsonString = JSON.stringify(doc);
    let size = new Blob([jsonString]).size;

    const base64Matches =
      jsonString.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/g) || [];

    base64Matches.forEach((match) => {
      if (match && typeof match === 'string') {
        const commaIndex = match.indexOf(',');
        const dataPart = commaIndex !== -1 ? match.substring(commaIndex + 1) : '';
        const actualSize = Math.ceil(dataPart.length * 0.75);
        size = size - match.length + actualSize;
      }
    });

    return size;
  } catch (error) {
    console.error('Error calculating document size:', error);
    return new Blob([JSON.stringify(doc || {})]).size;
  }
};

/**
 * Validate and compress a document, **trying** to keep it under 500KB.
 *
 * IMPORTANT:
 * - This function will NEVER throw just because the document is big.
 * - It will do multiple compression passes and then return the best result.
 * - Firestore itself still enforces the 1MB hard limit; if something is huge,
 *   Firestore may still reject it – but we won't block it on the client.
 */
export const validateAndCompressDocument = async (doc) => {
  // First pass: compress all base64 images
  let compressed = await compressBase64InObject(doc);
  let size = calculateDocumentSize(compressed);

  // If still large, try a couple more passes
  let attempts = 0;
  const maxAttempts = 3;

  while (size > MAX_DOCUMENT_SIZE && attempts < maxAttempts) {
    console.warn(
      `Document still large after compression pass ${attempts + 1}: ${(size / 1024).toFixed(
        2
      )}KB (target ${(MAX_DOCUMENT_SIZE / 1024).toFixed(2)}KB). Trying again...`
    );
    compressed = await compressBase64InObject(compressed);
    size = calculateDocumentSize(compressed);
    attempts += 1;
  }

  if (size > MAX_DOCUMENT_SIZE) {
    console.warn(
      `Document remains larger than target after ${attempts} compression passes. Returning best-effort compressed document.`
    );
  }

  return compressed;
};

/**
 * Quick check to see the size of a document before saving.
 */
export const checkDocumentSize = (doc) => {
  const size = calculateDocumentSize(doc);
  return {
    size,
    sizeKB: (size / 1024).toFixed(2),
    sizeMB: (size / 1024 / 1024).toFixed(2),
    isValid: size <= MAX_DOCUMENT_SIZE,
    maxSize: MAX_DOCUMENT_SIZE,
    maxSizeKB: (MAX_DOCUMENT_SIZE / 1024).toFixed(2),
  };
};


