import React, { useState, useEffect, useRef } from 'react';
import { resolveVideoUrl } from '../../../utils/videoUtils';
import { uploadVideo } from '../../services/videoService';
import './VideoSelector.css';

export default function VideoSelector({ value, onChange, label = 'Video' }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef(null);

  // Resolve preview URL when value changes
  useEffect(() => {
    resolvePreview();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract Google Drive file ID from URL
  const extractGoogleDriveFileId = (url) => {
    if (!url || !url.includes('drive.google.com')) {
      return null;
    }

    // Format 1: /file/d/FILE_ID/
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      return fileMatch[1];
    }
    // Format 2: ?id=FILE_ID
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      return idMatch[1];
    }

    return null;
  };

  // Convert Google Drive sharing link to direct video stream URL
  // This works if the file is shared with "Anyone with the link"
  const convertGoogleDriveUrl = (url) => {
    const fileId = extractGoogleDriveFileId(url);
    if (fileId) {
      // Try multiple URL formats for Google Drive videos
      // Format 1: Use 'view' export which is better for streaming videos
      // Format 2: Use 'download' export as fallback
      // The 'view' format works better for HTML5 video elements
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    // If we can't extract ID, return original URL
    return url;
  };

  const resolvePreview = async () => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    try {
      // If it's already a URL (YouTube, Vimeo, Google Drive, or http), convert if needed
      if (value.startsWith('http://') || value.startsWith('https://')) {
        // Convert Google Drive links to direct video stream URL
        if (value.includes('drive.google.com')) {
          const convertedUrl = convertGoogleDriveUrl(value);
          setPreviewUrl(convertedUrl);
          return;
        }
        // For other URLs, use as-is
        setPreviewUrl(value);
        return;
      }

      // If it's a base64 data URL, use it directly
      if (value.startsWith('data:video/')) {
        setPreviewUrl(value);
        return;
      }

      // Otherwise, try to resolve it (Firestore video ID)
      const url = await resolveVideoUrl(value);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error resolving video URL:', error);
      setPreviewUrl(null);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value.trim();
    onChange(url);
  };

  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      // Accept HTTP/HTTPS URLs
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return true;
      }
      
      // Accept base64 data URLs
      if (url.startsWith('data:video/')) {
        return true;
      }
      
      // Accept Firestore IDs (alphanumeric, typically 20-28 chars)
      if (/^[a-zA-Z0-9]{20,28}$/.test(url)) {
        return true;
      }
      
      // Also accept YouTube/Vimeo/Google Drive short formats (for validation messages)
      if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.includes('drive.google.com')) {
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.target.files[0];

    if (!file) {
      console.log('ℹ️ No file selected - user canceled');
      return;
    }

    console.log('📹 File selected:', {
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      e.target.value = ''; // Reset input
      return;
    }

    // Check file size (max 1GB - reasonable limit for Storage)
    const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB
    if (file.size > MAX_VIDEO_SIZE) {
      alert(`Video file is too large (${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB). Please select a video smaller than 1GB.`);
      e.target.value = ''; // Reset input
      return;
    }

    try {
      setUploading(true);
      setUploadProgress('Uploading video to Firebase Storage...');
      
      console.log('🎬 Starting video upload...', {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
        type: file.type
      });
      
      // Upload video directly to Storage (no compression - maintains quality)
      const videoId = await uploadVideo(file, file.name);
      console.log('✅ Upload successful, Video ID:', videoId);
      
      onChange(videoId); // Set the video document ID as selected
      
      setUploadProgress('');
      alert(`Video uploaded successfully!\n\nSize: ${(file.size / 1024 / 1024).toFixed(2)}MB\nQuality: Original (no compression)`);
    } catch (error) {
      console.error('❌ Error uploading video:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setUploadProgress('');
      
      // Provide more helpful error messages
      let errorMessage = error.message || 'Error uploading video.';
      
      if (error.message.includes('Permission denied') || error.message.includes('storage/unauthorized')) {
        errorMessage = 'Permission denied. Please check Firebase Storage security rules.';
      } else if (error.message.includes('quota-exceeded') || error.message.includes('resource-exhausted')) {
        errorMessage = 'Storage quota exceeded. Please check your Firebase Storage quota.';
      } else if (error.message.includes('unavailable') || error.message.includes('retry-limit-exceeded')) {
        errorMessage = 'Storage is unavailable. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to load video')) {
        errorMessage = 'Failed to load video. The file may be corrupted or in an unsupported format.\n\nPlease try:\n- Converting to MP4 format\n- Using a different video file\n- Checking if the file is not corrupted';
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress('');
      e.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="video-selector">
      <label className="admin-label">{label}</label>
      <div className="video-selector-input-group">
        <input
          type="text"
          value={value || ''}
          onChange={handleUrlChange}
          className="admin-input"
          placeholder="Paste YouTube/Vimeo URL or upload a video file"
        />
        <button
          type="button"
          onClick={() => {
            if (!uploading && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className="admin-btn admin-btn-secondary"
          disabled={uploading}
        >
          {uploading ? '⏳ Uploading...' : '📹 Upload Video'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        disabled={uploading}
        style={{ display: 'none' }}
      />

      {uploading && uploadProgress && (
        <p style={{ 
          marginTop: '8px', 
          color: '#3b82f6', 
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {uploadProgress || 'Uploading video... This may take a moment.'}
        </p>
      )}

      {value && !isValidUrl(value) && !uploading && (
        <p style={{ 
          fontSize: '12px', 
          color: '#ef4444', 
          marginTop: '4px',
          marginBottom: '0'
        }}>
          ⚠️ Please enter a valid video URL (YouTube, Vimeo, or Google Drive) or upload a video file
        </p>
      )}

      {previewUrl && (
        <div className="video-preview" style={{ marginTop: '12px' }}>
          {previewUrl.startsWith('http://') || previewUrl.startsWith('https://') ? (
            // External video URL (YouTube, Vimeo, etc.)
            <div className="video-preview-placeholder">
              {previewUrl.includes('drive.google.com') ? (
                // Google Drive - show info and try direct video
                <>
                  <p style={{ fontWeight: 500, marginBottom: '8px', color: '#3b82f6' }}>
                    📹 Google Drive Link Detected
                  </p>
                  <p style={{ fontSize: '12px', wordBreak: 'break-all', marginTop: '4px', color: '#6B7280' }}>
                    {previewUrl.length > 100 ? previewUrl.substring(0, 100) + '...' : previewUrl}
                  </p>
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    background: '#fef3c7', 
                    borderRadius: '6px',
                    border: '1px solid #fbbf24'
                  }}>
                    <p style={{ fontSize: '11px', color: '#92400e', marginBottom: '8px', fontWeight: 500 }}>
                      ⚠️ Google Drive Video Limitations
                    </p>
                    <p style={{ fontSize: '11px', color: '#78350f', marginBottom: '6px', lineHeight: '1.5' }}>
                      Google Drive videos often don't work reliably for direct streaming due to:
                    </p>
                    <ul style={{ fontSize: '11px', color: '#78350f', margin: '4px 0 8px 16px', padding: 0, lineHeight: '1.6' }}>
                      <li>File size restrictions (large files require download confirmation)</li>
                      <li>CORS and security restrictions</li>
                      <li>Inconsistent URL formats</li>
                    </ul>
                    <p style={{ fontSize: '11px', color: '#78350f', marginBottom: '4px', fontWeight: 500 }}>
                      <strong>Recommended Solution:</strong>
                    </p>
                    <p style={{ fontSize: '11px', color: '#78350f', marginBottom: '0', lineHeight: '1.5' }}>
                      1. Download the video from Google Drive<br/>
                      2. Use the <strong>"Upload Video"</strong> button above to upload it directly<br/>
                      3. The video will be uploaded to Firebase Storage (maintains original quality)
                    </p>
                    <p style={{ fontSize: '11px', color: '#78350f', marginTop: '8px', marginBottom: '0', fontStyle: 'italic' }}>
                      Alternative: Upload to YouTube or Vimeo for reliable embedding
                    </p>
                  </div>
                  {/* Try to show video preview if possible */}
                  {(previewUrl.includes('uc?export=view') || previewUrl.includes('uc?export=download')) && (
                    <video
                      src={previewUrl}
                      controls
                      style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '12px' }}
                      onError={(e) => {
                        const videoEl = e.target;
                        // Try alternative format if one fails
                        if (videoEl.src.includes('export=view')) {
                          const fileId = extractGoogleDriveFileId(value);
                          if (fileId) {
                            videoEl.src = `https://drive.google.com/uc?export=download&id=${fileId}`;
                            return;
                          }
                        }
                        console.warn('Google Drive video preview failed - file may not be publicly shared or format not supported');
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </>
              ) : (
                // Other external URLs (YouTube, Vimeo, etc.)
                <>
              <p style={{ fontWeight: 500, marginBottom: '8px' }}>✅ Video URL Valid</p>
              <p style={{ fontSize: '12px', wordBreak: 'break-all', marginTop: '4px', color: '#6B7280' }}>
                {previewUrl.length > 100 ? previewUrl.substring(0, 100) + '...' : previewUrl}
              </p>
              <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px' }}>
                This video will be embedded on the site
              </p>
                </>
              )}
            </div>
          ) : previewUrl.startsWith('data:video/') ? (
            // Base64 video data URL (uploaded video)
            <video
              src={previewUrl}
              controls
              style={{ maxWidth: '100%', maxHeight: '200px' }}
            >
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>
      )}

      <div style={{ marginTop: '12px', padding: '12px', background: '#f3f4f6', borderRadius: '6px' }}>
        <p style={{ fontSize: '12px', color: '#374151', margin: '0 0 8px 0', fontWeight: 500 }}>
          📹 How to add a video:
        </p>
        <ol style={{ fontSize: '11px', color: '#6B7280', margin: '0', paddingLeft: '20px' }}>
          <li><strong>Option 1:</strong> Upload a video file (maintains original quality, max 1GB)</li>
          <li><strong>Option 2:</strong> Upload to YouTube/Vimeo/Google Drive, then paste the URL</li>
        </ol>
        <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px', marginBottom: '0' }}>
          <strong>Supported:</strong> Video files (MP4, WebM, MOV), YouTube/Vimeo URLs, or Google Drive links
        </p>
        <p style={{ fontSize: '10px', color: '#3b82f6', marginTop: '6px', marginBottom: '0' }}>
          ℹ️ Google Drive: File must be shared with "Anyone with the link" for it to work
        </p>
      </div>
    </div>
  );
}
