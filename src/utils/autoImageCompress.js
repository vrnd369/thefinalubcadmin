/**
 * Automatic Image Compression Utility
 * Automatically compresses images on upload to meet size requirements
 */

/**
 * Resize and compress an image file to under the maximum size
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @param {number} options.maxSize - Maximum size in bytes (default: 500KB)
 * @param {number} options.maxWidth - Maximum width in pixels (default: 1200)
 * @param {number} options.maxHeight - Maximum height in pixels (default: 1200)
 * @param {number} options.initialQuality - Initial JPEG quality 0-1 (default: 0.85)
 * @param {Function} options.onProgress - Progress callback (optional)
 * @returns {Promise<File>} Compressed image file
 */
export const autoCompressImage = (file, options = {}) => {
  const {
    maxSize = 500 * 1024, // 500KB default
    maxWidth = 1200,
    maxHeight = 1200,
    initialQuality = 0.85,
    onProgress
  } = options;

  return new Promise((resolve, reject) => {
    // Validate file
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!file.type || !file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    // Check if file is already small enough
    if (file.size <= maxSize) {
      if (onProgress) {
        onProgress({ status: 'complete', message: 'Image is already small enough, no compression needed' });
      }
      resolve(file);
      return;
    }

    if (onProgress) {
      onProgress({ 
        status: 'compressing', 
        message: `Compressing image from ${(file.size / 1024).toFixed(2)}KB...` 
      });
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        // Resize if image is larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Use white background for transparent images (PNG) when converting to JPEG
        if (file.type === 'image/png' || file.type === 'image/gif') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output type - convert PNG/GIF to JPEG for better compression
        const shouldConvertToJpeg = file.type === 'image/png' || file.type === 'image/gif' || file.size > 300 * 1024;
        const outputType = shouldConvertToJpeg ? 'image/jpeg' : (file.type || 'image/jpeg');
        
        // Iterative compression to ensure under max size
        const compress = (quality) => {
          if (onProgress) {
            onProgress({ 
              status: 'compressing', 
              message: `Compressing at quality ${(quality * 100).toFixed(0)}%...` 
            });
          }

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              // If still too large and quality can be reduced, try again
              if (blob.size > maxSize && quality > 0.1) {
                // Reduce quality by 0.1 each iteration
                const newQuality = Math.max(0.1, quality - 0.1);
                compress(newQuality);
              } else if (blob.size > maxSize) {
                // If still too large after quality reduction, reduce dimensions
                const newWidth = Math.floor(width * 0.9);
                const newHeight = Math.floor(height * 0.9);
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.clearRect(0, 0, newWidth, newHeight);
                
                // Redraw with white background if needed
                if (shouldConvertToJpeg) {
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, newWidth, newHeight);
                }
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                width = newWidth;
                height = newHeight;
                compress(0.7); // Try with medium quality after resize
              } else {
                // Successfully compressed under max size
                const fileName = shouldConvertToJpeg ? file.name.replace(/\.(png|gif|webp)$/i, '.jpg') : file.name;
                const compressedFile = new File([blob], fileName, {
                  type: outputType,
                  lastModified: Date.now()
                });
                
                if (onProgress) {
                  onProgress({ 
                    status: 'complete', 
                    message: `Compression complete: ${(compressedFile.size / 1024).toFixed(2)}KB`,
                    originalSize: file.size,
                    compressedSize: compressedFile.size
                  });
                }

                resolve(compressedFile);
              }
            },
            outputType,
            shouldConvertToJpeg ? quality : (file.type === 'image/png' ? undefined : quality)
          );
        };
        
        // Start compression with initial quality
        compress(initialQuality);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Upload handler with automatic compression
 * @param {File} file - Image file to upload
 * @param {Function} uploadFunction - Function to upload the compressed file
 * @param {Object} options - Compression and upload options
 * @returns {Promise} Result from upload function
 */
export const uploadImageWithAutoCompress = async (file, uploadFunction, options = {}) => {
  try {
    // Automatically compress the image
    const compressedFile = await autoCompressImage(file, options);
    
    // Upload the compressed file
    return await uploadFunction(compressedFile);
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

