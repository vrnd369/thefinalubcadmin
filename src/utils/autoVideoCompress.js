/**
 * Automatic Video Compression Utility
 * Automatically compresses videos on upload to meet size requirements
 * 
 * Uses MediaRecorder API for browser-based video compression
 * Target: 750KB binary size (becomes ~1MB when base64-encoded for Firestore)
 */

/**
 * Compress a video file to under the maximum size
 * @param {File} file - Original video file
 * @param {Object} options - Compression options
 * @param {number} options.maxSize - Maximum size in bytes (default: 1000KB)
 * @param {number} options.maxWidth - Maximum width in pixels (default: 1280)
 * @param {number} options.maxHeight - Maximum height in pixels (default: 720)
 * @param {number} options.maxDuration - Maximum duration in seconds (default: 30)
 * @param {number} options.targetBitrate - Target bitrate in bps (default: 200000 = 200kbps)
 * @param {Function} options.onProgress - Progress callback (optional)
 * @returns {Promise<File>} Compressed video file
 */
export const autoCompressVideo = (file, options = {}) => {
  const {
    maxSize = 750 * 1024, // 750KB default (becomes ~1MB when base64-encoded for Firestore)
    maxWidth = 1280,
    maxHeight = 720,
    maxDuration = 30, // 30 seconds max
    targetBitrate = 500000, // 500kbps initial (increased for better quality)
    onProgress
  } = options;

  return new Promise((resolve, reject) => {
    console.log('🎬 Starting video compression...', {
      fileName: file?.name || 'unknown',
      fileSize: file ? (file.size / 1024 / 1024).toFixed(2) + 'MB' : 'unknown',
      fileType: file?.type || 'unknown',
      maxSize: (maxSize / 1024).toFixed(0) + 'KB',
      maxDuration: maxDuration + 's',
      maxDimensions: `${maxWidth}x${maxHeight}`
    });

    // Check browser support
    if (!window.MediaRecorder) {
      const errorMsg = 'Your browser does not support video compression. Please use Chrome, Firefox, or Edge.';
      console.error('❌', errorMsg);
      reject(new Error(errorMsg));
      return;
    }

    // Validate file
    if (!file) {
      const errorMsg = 'No file provided';
      console.error('❌', errorMsg);
      reject(new Error(errorMsg));
      return;
    }

    if (!file.type || !file.type.startsWith('video/')) {
      const errorMsg = 'File is not a video. Please select a video file.';
      console.error('❌', errorMsg, { fileType: file.type });
      reject(new Error(errorMsg));
      return;
    }

    // Check if file is already small enough
    if (file.size <= maxSize) {
      console.log('✅ Video is already small enough, no compression needed');
      if (onProgress) {
        onProgress({ 
          status: 'complete', 
          message: 'Video is already small enough, no compression needed' 
        });
      }
      resolve(file);
      return;
    }

    // Warn if file is very large (may take long to process)
    if (file.size > 100 * 1024 * 1024) { // 100MB
      console.warn('⚠️ Large video file detected. Compression may take several minutes.');
      if (onProgress) {
        onProgress({ 
          status: 'compressing', 
          message: 'Large video detected. This may take a few minutes...' 
        });
      }
    }

    // Set up timeout (5 minutes max)
    const compressionTimeout = setTimeout(() => {
      console.error('❌ Compression timeout after 5 minutes');
      if (onProgress) {
        onProgress({ 
          status: 'error', 
          message: 'Compression is taking too long. Please try a shorter video.' 
        });
      }
      reject(new Error('Compression timeout. The video may be too large or complex. Please try a shorter video.'));
    }, 300000); // 5 minutes

    // Clear timeout on success or failure
    const clearTimeoutAndResolve = (result) => {
      clearTimeout(compressionTimeout);
      resolve(result);
    };

    const clearTimeoutAndReject = (error) => {
      clearTimeout(compressionTimeout);
      reject(error);
    };

    if (onProgress) {
      onProgress({ 
        status: 'compressing', 
        message: `Compressing video from ${(file.size / 1024 / 1024).toFixed(2)}MB...` 
      });
    }

    // Create video element to load and process the video
    // Make it visible (off-screen) to avoid browser power-saving restrictions
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Style video element to be off-screen but visible to browser
    // This prevents browser from pausing it for power saving
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);
    
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    // Create object URL for video
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadedmetadata = () => {
      try {
        console.log('📹 Video metadata loaded');
        // Get video properties
        const originalWidth = video.videoWidth;
        const originalHeight = video.videoHeight;
        const duration = video.duration;

        console.log('📊 Video properties:', {
          dimensions: `${originalWidth}x${originalHeight}`,
          duration: duration.toFixed(2) + 's',
          fileSize: (file.size / 1024 / 1024).toFixed(2) + 'MB'
        });

        // Check duration
        if (duration > maxDuration) {
          const errorMsg = `Video is too long (${duration.toFixed(1)}s). Maximum duration is ${maxDuration} seconds. Please trim the video before uploading.`;
          console.error('❌', errorMsg);
          URL.revokeObjectURL(videoUrl);
          if (video.parentNode) {
            document.body.removeChild(video);
          }
          clearTimeoutAndReject(new Error(errorMsg));
          return;
        }

        if (isNaN(duration) || duration <= 0) {
          const errorMsg = 'Invalid video duration. The video file may be corrupted.';
          console.error('❌', errorMsg);
          URL.revokeObjectURL(videoUrl);
          if (video.parentNode) {
            document.body.removeChild(video);
          }
          clearTimeoutAndReject(new Error(errorMsg));
          return;
        }

        // Calculate new dimensions
        let width = originalWidth;
        let height = originalHeight;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Ensure even dimensions (required for some codecs)
        width = width % 2 === 0 ? width : width - 1;
        height = height % 2 === 0 ? height : height - 1;

        canvas.width = width;
        canvas.height = height;

        if (onProgress) {
          onProgress({ 
            status: 'compressing', 
            message: `Resizing video to ${width}x${height}px...` 
          });
        }

        // Calculate frame rate (24fps default for better quality, lower for longer videos)
        let frameRate = 24; // Increased from 20fps for smoother playback
        if (duration > 20) {
          frameRate = 20; // Still decent frame rate for longer videos
        } else if (duration > 10) {
          frameRate = 22; // Slightly lower for medium videos
        }

        // Try to get MediaRecorder with best codec support
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.log('⚠️ VP9 not supported, trying VP8...');
          mimeType = 'video/webm;codecs=vp8';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            console.log('⚠️ VP8 not supported, trying generic WebM...');
            mimeType = 'video/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              const errorMsg = 'Your browser does not support video compression. Please use Chrome, Firefox, or Edge, or compress the video manually before uploading.';
              console.error('❌', errorMsg);
              URL.revokeObjectURL(videoUrl);
              if (video.parentNode) {
                document.body.removeChild(video);
              }
              clearTimeoutAndReject(new Error(errorMsg));
              return;
            }
          }
        }
        console.log('✅ Using codec:', mimeType);

        // Start compression with MediaRecorder
        const chunks = [];
        let bitrate = targetBitrate;
        let attemptCount = 0;
        const maxAttempts = 5;

        const compressWithBitrate = (currentBitrate) => {
          console.log(`🔄 Compression attempt ${attemptCount + 1}/${maxAttempts} at ${(currentBitrate / 1000).toFixed(0)}kbps`);
          if (onProgress) {
            onProgress({ 
              status: 'compressing', 
              message: `Compressing at ${(currentBitrate / 1000).toFixed(0)}kbps (attempt ${attemptCount + 1}/${maxAttempts})...` 
            });
          }

          const options = {
            mimeType: mimeType,
            videoBitsPerSecond: currentBitrate
          };

          try {
            // Create canvas stream with the target frame rate
            // This ensures MediaRecorder records at the correct frame rate
            const canvasStream = canvas.captureStream(frameRate);
            
            const mediaRecorder = new MediaRecorder(
              canvasStream,
              options
            );
            
            console.log('📹 MediaRecorder created:', {
              frameRate: frameRate + 'fps',
              mimeType: mimeType,
              bitrate: (currentBitrate / 1000).toFixed(0) + 'kbps',
              expectedDuration: duration.toFixed(2) + 's',
              expectedFrames: Math.ceil(duration * frameRate)
            });

            mediaRecorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) {
                chunks.push(e.data);
              }
            };

            mediaRecorder.onstop = () => {
              const blob = new Blob(chunks, { type: mimeType });
              console.log(`📦 Compression attempt ${attemptCount + 1} complete:`, {
                size: (blob.size / 1024).toFixed(2) + 'KB',
                target: (maxSize / 1024).toFixed(0) + 'KB',
                success: blob.size <= maxSize
              });
              
              // CRITICAL: Verify the compressed video duration matches the original
              const verifyDuration = () => {
                return new Promise((resolveVerify, rejectVerify) => {
                  const testVideo = document.createElement('video');
                  const testVideoUrl = URL.createObjectURL(blob);
                  testVideo.src = testVideoUrl;
                  testVideo.preload = 'metadata';
                  
                  const timeout = setTimeout(() => {
                    URL.revokeObjectURL(testVideoUrl);
                    rejectVerify(new Error('Duration verification timeout'));
                  }, 10000);
                  
                  testVideo.onloadedmetadata = () => {
                    clearTimeout(timeout);
                    const compressedDuration = testVideo.duration;
                    const originalDuration = duration;
                    const durationDiff = Math.abs(compressedDuration - originalDuration);
                    const durationPercent = (compressedDuration / originalDuration) * 100;
                    
                    console.log('📹 Duration verification:', {
                      originalDuration: originalDuration.toFixed(3) + 's',
                      compressedDuration: compressedDuration.toFixed(3) + 's',
                      difference: durationDiff.toFixed(3) + 's',
                      coverage: durationPercent.toFixed(1) + '%'
                    });
                    
                    URL.revokeObjectURL(testVideoUrl);
                    
                    // Accept if duration is within 5% of original (allows for minor encoding differences)
                    if (durationPercent >= 95) {
                      resolveVerify(true);
                    } else {
                      rejectVerify(new Error(`Compressed video duration (${compressedDuration.toFixed(2)}s) is too short. Expected: ${originalDuration.toFixed(2)}s`));
                    }
                  };
                  
                  testVideo.onerror = () => {
                    clearTimeout(timeout);
                    URL.revokeObjectURL(testVideoUrl);
                    rejectVerify(new Error('Failed to load compressed video for duration verification'));
                  };
                  
                  testVideo.load();
                });
              };
              
              // Check if compressed size is acceptable
              if (blob.size <= maxSize) {
                // Verify duration before accepting
                verifyDuration().then(() => {
                  // Success! Duration is correct
                  const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webm';
                  const compressedFile = new File([blob], fileName, {
                    type: mimeType,
                    lastModified: Date.now()
                  });

                  console.log('✅ Compression successful with full duration!', {
                    original: (file.size / 1024 / 1024).toFixed(2) + 'MB',
                    compressed: (compressedFile.size / 1024).toFixed(2) + 'KB',
                    reduction: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%',
                    originalDuration: duration.toFixed(2) + 's'
                  });

                  URL.revokeObjectURL(videoUrl);
                  // Clean up video element
                  if (video.parentNode) {
                    document.body.removeChild(video);
                  }
                  
                  if (onProgress) {
                    onProgress({ 
                      status: 'complete', 
                      message: `Compression complete: ${(compressedFile.size / 1024).toFixed(2)}KB`,
                      originalSize: file.size,
                      compressedSize: compressedFile.size
                    });
                  }

                  clearTimeoutAndResolve(compressedFile);
                }).catch((durationError) => {
                  // Duration verification failed - retry compression
                  console.warn('⚠️ Duration verification failed:', durationError.message);
                  
                  if (attemptCount < maxAttempts - 1) {
                    // Retry with adjusted settings
                    attemptCount++;
                    chunks.length = 0;
                    
                    // Increase frame rate slightly to ensure better duration coverage
                    const newFrameRate = Math.min(30, frameRate + 2);
                    if (newFrameRate !== frameRate) {
                      frameRate = newFrameRate;
                      console.log(`📈 Increasing frame rate to ${frameRate}fps for better duration coverage`);
                    }
                    
                    // Slightly reduce bitrate to stay under size limit
                    const newBitrate = Math.floor(currentBitrate * 0.9);
                    
                    console.log(`🔄 Retrying compression to fix duration issue...`);
                    setTimeout(() => compressWithBitrate(newBitrate), 100);
                  } else {
                    // Max attempts reached
                    const errorMsg = `Compressed video duration is too short. Please try a shorter video or compress it manually.`;
                    console.error('❌', errorMsg);
                    URL.revokeObjectURL(videoUrl);
                    if (video.parentNode) {
                      document.body.removeChild(video);
                    }
                    clearTimeoutAndReject(new Error(errorMsg));
                  }
                });
              } else if (attemptCount < maxAttempts - 1) {
                // Still too large, reduce bitrate and try again
                attemptCount++;
                chunks.length = 0; // Clear chunks
                const newBitrate = Math.floor(currentBitrate * 0.85); // Reduce by 15% (less aggressive)
                
                console.log(`⚠️ Video still too large (${(blob.size / 1024).toFixed(2)}KB), reducing bitrate to ${(newBitrate / 1000).toFixed(0)}kbps`);
                
                if (newBitrate < 100000) { // Minimum 100kbps (increased for better quality)
                  const errorMsg = `Unable to compress video to under ${(maxSize / 1024).toFixed(0)}KB. The video may be too long or complex. Please try a shorter video or reduce the quality manually.`;
                  console.error('❌', errorMsg);
                  URL.revokeObjectURL(videoUrl);
                  if (video.parentNode) {
                    document.body.removeChild(video);
                  }
                  clearTimeoutAndReject(new Error(errorMsg));
                  return;
                }

                // Reduce frame rate if needed (but keep it higher for quality)
                if (attemptCount > 3) {
                  frameRate = Math.max(15, frameRate - 1); // Keep minimum 15fps
                  console.log(`📉 Reducing frame rate to ${frameRate}fps`);
                }

                // Retry with lower bitrate
                setTimeout(() => compressWithBitrate(newBitrate), 100);
              } else {
                // Max attempts reached
                const errorMsg = `Unable to compress video to under ${(maxSize / 1024).toFixed(0)}KB after ${maxAttempts} attempts. Please try a shorter video or compress it manually before uploading.`;
                console.error('❌', errorMsg, {
                  finalSize: (blob.size / 1024).toFixed(2) + 'KB',
                  targetSize: (maxSize / 1024).toFixed(0) + 'KB'
                });
                URL.revokeObjectURL(videoUrl);
                if (video.parentNode) {
                  document.body.removeChild(video);
                }
                clearTimeoutAndReject(new Error(errorMsg));
              }
            };

            mediaRecorder.onerror = (e) => {
              const errorMsg = `Compression error: ${e.error?.message || 'Unknown error'}`;
              console.error('❌ MediaRecorder error:', e.error || e);
              URL.revokeObjectURL(videoUrl);
              if (video.parentNode) {
                document.body.removeChild(video);
              }
              clearTimeoutAndReject(new Error(errorMsg));
            };

            // Flag to prevent multiple calls to startCompression
            let compressionStarted = false;
            
            // Wait for video to be ready and start compression
            const startCompression = async () => {
              // Prevent multiple calls
              if (compressionStarted) {
                console.log('⚠️ Compression already started, ignoring duplicate call');
                return;
              }
              
              // Check if MediaRecorder is already recording
              if (mediaRecorder.state === 'recording') {
                console.log('⚠️ MediaRecorder already recording, ignoring duplicate start');
                return;
              }
              
              compressionStarted = true;
              
              // Use seek-based method which is more reliable and doesn't require playback
              console.log('🎬 Using seek-based frame capture method (more reliable)...');
              
              // Manually seek through video and capture frames
              // CRITICAL: We need to capture frames for the FULL duration
              // MediaRecorder records at frameRate, so we need to provide frames continuously
              let frameIndex = 0;
              
              // Calculate total frames needed for the FULL duration
              // We need at least duration * frameRate frames to cover the full video
              // Add a few extra frames to ensure we don't cut off the end
              const totalFrames = Math.ceil(duration * frameRate) + Math.ceil(frameRate * 0.5); // Add 0.5 seconds worth of frames as buffer
              const frameTimeStep = 1 / frameRate;
              
              // Calculate the actual time we'll cover
              const actualDuration = (totalFrames - 1) * frameTimeStep;
              
              console.log(`📹 Video compression settings:`, {
                originalDuration: duration.toFixed(3) + 's',
                frameRate: frameRate + 'fps',
                totalFrames: totalFrames,
                frameTimeStep: frameTimeStep.toFixed(4) + 's',
                expectedOutputDuration: actualDuration.toFixed(3) + 's',
                lastFrameTime: ((totalFrames - 1) * frameTimeStep).toFixed(3) + 's',
                durationCoverage: ((actualDuration / duration) * 100).toFixed(1) + '%'
              });
              
              // Start recording - check state first
              if (mediaRecorder.state === 'inactive') {
                console.log('🎬 Starting MediaRecorder...');
                try {
                  mediaRecorder.start();
                } catch (err) {
                  console.error('❌ Failed to start MediaRecorder:', err);
                  compressionStarted = false;
                  clearTimeoutAndReject(new Error(`Failed to start recording: ${err.message}`));
                  return;
                }
              } else {
                console.log('⚠️ MediaRecorder not in inactive state:', mediaRecorder.state);
                compressionStarted = false;
                return;
              }
              
              // Safety timeout - stop recording if it takes too long (duration * 3 + 10 seconds buffer)
              const maxRecordingTime = (duration * 3000) + 10000;
              const recordingTimeout = setTimeout(() => {
                console.warn('⚠️ Recording timeout, forcing stop...');
                if (mediaRecorder.state !== 'inactive') {
                  mediaRecorder.stop();
                }
              }, maxRecordingTime);
              
              // Track progress
              const startTime = Date.now();
              let lastProgressUpdate = 0;
              
              const captureFrame = () => {
                // Check if we've captured all frames (including the last one)
                if (frameIndex >= totalFrames || mediaRecorder.state === 'inactive') {
                  if (frameIndex >= totalFrames) {
                    const lastFrameTime = (frameIndex - 1) * frameTimeStep;
                    console.log(`✅ All ${totalFrames} frames captured!`, {
                      lastFrameIndex: frameIndex - 1,
                      lastFrameTime: lastFrameTime.toFixed(3) + 's',
                      originalDuration: duration.toFixed(3) + 's',
                      coverage: ((lastFrameTime / duration) * 100).toFixed(1) + '%'
                    });
                  } else {
                    console.log('⚠️ Frame capture stopped early, stopping recording...');
                  }
                  clearTimeout(recordingTimeout);
                  // Wait longer to ensure MediaRecorder processes all frames, especially the last one
                  // The delay should be at least 2-3 frame intervals to ensure last frame is captured
                  const stopDelay = Math.max(500, (2 / frameRate) * 1000);
                  setTimeout(() => {
                    if (mediaRecorder.state !== 'inactive') {
                      console.log('🛑 Stopping MediaRecorder...');
                      mediaRecorder.stop();
                    }
                  }, stopDelay);
                  return;
                }
                
                // Calculate target time - ensure we capture the full duration
                // We want to capture frames evenly spaced throughout the video
                let targetTime;
                
                // Calculate time based on frame index
                targetTime = frameIndex * frameTimeStep;
                
                // For frames beyond the original duration, keep showing the last frame
                // This ensures MediaRecorder records for the full expected duration
                if (targetTime >= duration) {
                  // Show the last frame (at duration - small epsilon)
                  targetTime = Math.max(0, duration - 0.01);
                } else {
                  // Normal frame within video duration
                  targetTime = Math.min(targetTime, duration - 0.01);
                }
                
                const progress = Math.min(100, (targetTime / duration) * 100);
                const elapsed = Date.now() - startTime;
                
                // Update progress every 500ms
                if (elapsed - lastProgressUpdate > 500) {
                  console.log(`📊 Compression progress: ${progress.toFixed(1)}% (${frameIndex}/${totalFrames} frames, ${targetTime.toFixed(2)}s / ${duration.toFixed(2)}s)`);
                  if (onProgress) {
                    onProgress({ 
                      status: 'compressing', 
                      message: `Compressing... ${progress.toFixed(0)}% (${frameIndex}/${totalFrames} frames)` 
                    });
                  }
                  lastProgressUpdate = elapsed;
                }
                
                video.currentTime = targetTime;
                
                const onSeeked = () => {
                  try {
                    // Draw the current frame to canvas
                    ctx.drawImage(video, 0, 0, width, height);
                    
                    const currentFrameTime = video.currentTime;
                    
                    // Log progress for last few frames
                    if (frameIndex >= totalFrames - 3) {
                      const progressPercent = (currentFrameTime / duration) * 100;
                      console.log(`📸 Captured frame ${frameIndex + 1}/${totalFrames} at ${currentFrameTime.toFixed(3)}s (${progressPercent.toFixed(1)}% of ${duration.toFixed(3)}s duration)`);
                    }
                    
                    frameIndex++;
                    
                    // Calculate how much time we've covered so far
                    const timeCovered = frameIndex * frameTimeStep;
                    const isComplete = timeCovered >= actualDuration;
                    
                    if (!isComplete && mediaRecorder.state !== 'inactive') {
                      // Continue capturing frames - use frame-rate-based timing
                      // This ensures we provide frames at the correct interval
                      const nextFrameDelay = Math.max(1, (frameTimeStep * 1000) - 2); // Slightly faster than frame rate
                      requestAnimationFrame(() => {
                        setTimeout(captureFrame, nextFrameDelay);
                      });
                    } else {
                      // We've covered the full duration
                      const durationCoverage = Math.min(100, (timeCovered / duration) * 100);
                      console.log(`✅ Frame capture complete!`, {
                        totalFramesCaptured: frameIndex,
                        timeCovered: timeCovered.toFixed(3) + 's',
                        originalDuration: duration.toFixed(3) + 's',
                        expectedDuration: actualDuration.toFixed(3) + 's',
                        coverage: durationCoverage.toFixed(1) + '%',
                        frameRate: frameRate + 'fps'
                      });
                      
                      // CRITICAL: Continue drawing the last frame to ensure MediaRecorder records for full duration
                      // MediaRecorder needs continuous frames, so we keep drawing until we've covered the full time
                      console.log('📸 Continuing to draw frames to ensure full duration...');
                      let continuationIndex = frameIndex;
                      const continueDrawing = () => {
                        // Keep drawing the last frame (video is at the end)
                        ctx.drawImage(video, 0, 0, width, height);
                        continuationIndex++;
                        
                        const continuationTime = continuationIndex * frameTimeStep;
                        
                        // Continue until we've covered the full expected duration
                        if (continuationTime < actualDuration && mediaRecorder.state !== 'inactive') {
                          const delay = Math.max(1, frameTimeStep * 1000);
                          requestAnimationFrame(() => {
                            setTimeout(continueDrawing, delay);
                          });
                        } else {
                          // We've covered the full duration
                          console.log(`✅ Completed full duration: ${continuationTime.toFixed(3)}s (target: ${actualDuration.toFixed(3)}s, original: ${duration.toFixed(3)}s)`);
                          clearTimeout(recordingTimeout);
                          // Wait longer to ensure MediaRecorder processes all frames
                          // Wait at least 10% of duration or 1 second
                          const stopDelay = Math.max(1000, Math.ceil(duration * 100));
                          setTimeout(() => {
                            if (mediaRecorder.state !== 'inactive') {
                              console.log('🛑 Stopping MediaRecorder after full duration...');
                              mediaRecorder.stop();
                            }
                          }, stopDelay);
                        }
                      };
                      // Start continuation
                      continueDrawing();
                    }
                  } catch (err) {
                    console.error('❌ Error capturing frame:', err);
                    // Continue anyway - increment frame index
                    frameIndex++;
                    if (frameIndex < totalFrames && mediaRecorder.state !== 'inactive') {
                      requestAnimationFrame(() => {
                        setTimeout(captureFrame, 5);
                      });
                    } else {
                      clearTimeout(recordingTimeout);
                      const stopDelay = Math.max(500, (2 / frameRate) * 1000);
                      setTimeout(() => {
                        if (mediaRecorder.state !== 'inactive') {
                          mediaRecorder.stop();
                        }
                      }, stopDelay);
                    }
                  }
                };
                
                // Set up seek handler with timeout
                let seekTimeout;
                const seekHandler = () => {
                  if (seekTimeout) {
                    clearTimeout(seekTimeout);
                  }
                  onSeeked();
                };
                
                video.onseeked = seekHandler;
                
                // Add timeout in case seek doesn't fire (safety net)
                seekTimeout = setTimeout(() => {
                  console.warn(`⚠️ Seek timeout for frame ${frameIndex}, triggering anyway...`);
                  video.onseeked = null; // Remove handler to prevent double call
                  onSeeked();
                }, 1000);
                
                // If already at the target time (or very close), trigger immediately
                if (Math.abs(video.currentTime - targetTime) < 0.05) {
                  if (seekTimeout) {
                    clearTimeout(seekTimeout);
                  }
                  video.onseeked = null; // Remove handler to prevent double call
                  onSeeked();
                }
              };
              
              // Wait for video to be ready, then start capturing
              if (video.readyState >= 2) {
                console.log('✅ Video ready, starting frame capture...');
                captureFrame();
              } else {
                console.log('⏳ Waiting for video to be ready...');
                const startCaptureWhenReady = () => {
                  if (frameIndex === 0 && video.readyState >= 2) {
                    console.log('✅ Video ready, starting frame capture...');
                    captureFrame();
                  }
                };
                video.onloadeddata = startCaptureWhenReady;
                video.oncanplay = startCaptureWhenReady;
              }
            };

            // Wait for video to be ready - use single event to prevent multiple calls
            const startWhenReady = () => {
              if (video.readyState >= 2) {
                startCompression();
              }
            };
            
            if (video.readyState >= 2) {
              // Video has enough data
              startCompression();
            } else {
              // Only set one event listener to prevent multiple calls
              video.oncanplay = startWhenReady;
              // Remove other listener to prevent duplicate calls
              video.onloadeddata = null;
            }

          } catch (error) {
            const errorMsg = `Compression failed: ${error.message}`;
            console.error('❌', errorMsg, error);
            URL.revokeObjectURL(videoUrl);
            if (video.parentNode) {
              document.body.removeChild(video);
            }
            clearTimeoutAndReject(new Error(errorMsg));
          }
        };

        // Start compression
        console.log('🚀 Starting compression with initial bitrate:', (bitrate / 1000).toFixed(0) + 'kbps');
        compressWithBitrate(bitrate);

      } catch (error) {
        const errorMsg = `Failed to process video: ${error.message}`;
        console.error('❌', errorMsg, error);
        URL.revokeObjectURL(videoUrl);
        if (video.parentNode) {
          document.body.removeChild(video);
        }
        clearTimeoutAndReject(new Error(errorMsg));
      }
    };

    video.onerror = (e) => {
      const error = video.error;
      const errorMsg = error 
        ? `Failed to load video: ${error.message || 'Unknown error'} (Code: ${error.code})`
        : 'Failed to load video. The file may be corrupted or in an unsupported format.';
      console.error('❌ Video load error:', error || e);
      URL.revokeObjectURL(videoUrl);
      if (video.parentNode) {
        document.body.removeChild(video);
      }
      clearTimeoutAndReject(new Error(errorMsg));
    };

    // Load video metadata
    video.load();
  });
};

/**
 * Upload handler with automatic compression
 * @param {File} file - Video file to upload
 * @param {Function} uploadFunction - Function to upload the compressed file
 * @param {Object} options - Compression and upload options
 * @returns {Promise} Result from upload function
 */
export const uploadVideoWithAutoCompress = async (file, uploadFunction, options = {}) => {
  try {
    // Automatically compress the video
    const compressedFile = await autoCompressVideo(file, options);
    
    // Upload the compressed file
    return await uploadFunction(compressedFile);
  } catch (error) {
    throw new Error(`Video upload failed: ${error.message}`);
  }
};



