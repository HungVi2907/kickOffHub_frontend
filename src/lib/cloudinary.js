/**
 * =============================================================================
 * CLOUDINARY CONFIGURATION
 * =============================================================================
 * 
 * This module provides configuration and utilities for Cloudinary image uploads.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://cloudinary.com and sign up/login
 * 2. Navigate to Settings > Upload > Upload presets
 * 3. Click "Add upload preset"
 * 4. Set "Signing Mode" to "Unsigned" (CRITICAL - signed presets cause 400 error!)
 * 5. Name it exactly as configured below (e.g., "unsigned_upload")
 * 6. Save and use that preset name in your .env file
 * 
 * COMMON ERROR CAUSES:
 * - 400 Bad Request: Upload preset doesn't exist OR is set to "Signed" mode
 * - 401 Unauthorized: Using signed preset without API key (impossible from browser)
 * 
 * ENVIRONMENT VARIABLES:
 * - VITE_CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 * - VITE_CLOUDINARY_UPLOAD_PRESET: Your UNSIGNED upload preset name
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Cloudinary configuration object
 * 
 * IMPORTANT: The upload_preset MUST be UNSIGNED in your Cloudinary dashboard.
 * A signed preset will ALWAYS fail with 400 from the browser.
 */
export const CLOUDINARY_CONFIG = {
  // Your Cloudinary cloud name (from dashboard)
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dwb1iwxp9',
  
  // Your UNSIGNED upload preset name
  // CRITICAL: This preset MUST exist in Cloudinary and be set to UNSIGNED mode
  // Go to: Settings > Upload > Upload presets > Add upload preset > Signing Mode: Unsigned
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload',
  
  // Maximum file size in bytes (5MB)
  maxFileSize: 5 * 1024 * 1024,
  
  // Allowed file types
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}

// =============================================================================
// UPLOAD FUNCTION
// =============================================================================

/**
 * Upload an image file directly to Cloudinary using UNSIGNED preset
 * 
 * This function uses Cloudinary's unsigned upload API, which allows
 * direct browser-to-Cloudinary uploads without exposing API secrets.
 * 
 * WHY UNSIGNED PRESET IS REQUIRED:
 * - Signed presets require API secret for signature generation
 * - API secrets cannot be exposed in browser code (security risk)
 * - Unsigned presets allow direct browser uploads without secrets
 * - Using signed preset from browser → 400 Bad Request
 * 
 * @param {File} file - The image file to upload (REQUIRED, must not be null)
 * @param {Object} options - Optional configuration
 * @param {string} options.folder - Cloudinary folder to upload to
 * @returns {Promise<string>} - The secure_url of the uploaded image
 * @throws {Error} - If upload fails, file is null, or validation fails
 * 
 * @example
 * const imageUrl = await uploadToCloudinary(file)
 * // Returns: "https://res.cloudinary.com/dwb1iwxp9/image/upload/v123/abc.jpg"
 */
export async function uploadToCloudinary(file, options = {}) {
  // ==========================================================================
  // VALIDATION: Ensure file is provided
  // ==========================================================================
  if (!file) {
    throw new Error('No file selected for upload. Please select an image file.')
  }

  // Debug logging - helps identify issues
  console.log('📤 Cloudinary Upload Starting:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: `${(file.size / 1024).toFixed(1)} KB`,
    cloudName: CLOUDINARY_CONFIG.cloudName,
    uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
  })

  // ==========================================================================
  // VALIDATION: Check file type
  // ==========================================================================
  if (!CLOUDINARY_CONFIG.allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed types: ${CLOUDINARY_CONFIG.allowedTypes.join(', ')}`
    )
  }

  // ==========================================================================
  // VALIDATION: Check file size
  // ==========================================================================
  if (file.size > CLOUDINARY_CONFIG.maxFileSize) {
    const maxSizeMB = CLOUDINARY_CONFIG.maxFileSize / (1024 * 1024)
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum of ${maxSizeMB}MB`)
  }

  // ==========================================================================
  // BUILD FORMDATA
  // IMPORTANT: These fields are REQUIRED for Cloudinary unsigned upload
  // ==========================================================================
  const formData = new FormData()
  
  // REQUIRED: The actual file to upload
  formData.append('file', file)
  
  // REQUIRED: The unsigned upload preset name
  // This MUST match an existing UNSIGNED preset in your Cloudinary dashboard
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)
  
  // OPTIONAL: Specify folder for organization
  if (options.folder) {
    formData.append('folder', options.folder)
  }

  // ==========================================================================
  // BUILD UPLOAD URL
  // Format: https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
  // ==========================================================================
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`
  
  console.log('📤 Cloudinary Upload URL:', uploadUrl)

  // ==========================================================================
  // MAKE THE UPLOAD REQUEST
  // ==========================================================================
  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      // NOTE: Do NOT set Content-Type header - browser sets it automatically
      // with correct boundary for multipart/form-data
    })

    // Parse response body
    const data = await response.json()

    // ==========================================================================
    // HANDLE ERRORS
    // ==========================================================================
    if (!response.ok) {
      // Log full error for debugging
      console.error('❌ Cloudinary Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        fullResponse: data,
      })

      // Provide helpful error message based on status code
      if (response.status === 400) {
        const errorMsg = data.error?.message || 'Bad Request'
        throw new Error(
          `Cloudinary upload failed (400): ${errorMsg}. ` +
          `This usually means the upload preset "${CLOUDINARY_CONFIG.uploadPreset}" ` +
          `doesn't exist or is set to "Signed" mode. ` +
          `Please create an UNSIGNED preset in Cloudinary dashboard.`
        )
      }
      
      if (response.status === 401) {
        throw new Error(
          `Cloudinary upload failed (401): Unauthorized. ` +
          `The upload preset may be signed. Please use an UNSIGNED preset for browser uploads.`
        )
      }

      throw new Error(data.error?.message || `Cloudinary upload failed with status ${response.status}`)
    }

    // ==========================================================================
    // VALIDATE RESPONSE
    // ==========================================================================
    if (!data.secure_url) {
      console.error('❌ Cloudinary response missing secure_url:', data)
      throw new Error('Cloudinary response did not include secure_url')
    }

    console.log('✅ Cloudinary Upload Success:', {
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
    })

    // Return the secure HTTPS URL
    return data.secure_url

  } catch (error) {
    // Re-throw with more context if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error uploading to Cloudinary: ${error.message}`)
    }
    throw error
  }
}

/**
 * Get the secure URL from a Cloudinary upload response (legacy support)
 * 
 * @param {Object} uploadResponse - Response from uploadToCloudinary
 * @returns {string} - The secure HTTPS URL of the uploaded image
 * @deprecated - uploadToCloudinary now returns secure_url directly
 */
export function getSecureUrl(uploadResponse) {
  return uploadResponse?.secure_url || uploadResponse || ''
}

/**
 * Generate a Cloudinary transformation URL
 * 
 * @param {string} url - Original Cloudinary URL
 * @param {Object} transformations - Transformation options
 * @param {number} transformations.width - Width in pixels
 * @param {number} transformations.height - Height in pixels
 * @param {string} transformations.crop - Crop mode (fill, fit, limit, etc.)
 * @param {string} transformations.quality - Quality (auto, auto:best, 80, etc.)
 * @returns {string} - Transformed URL
 * 
 * @example
 * const thumbnail = transformUrl(originalUrl, { width: 300, height: 200, crop: 'fill' })
 */
export function transformUrl(url, transformations = {}) {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }

  const parts = []
  
  if (transformations.width) parts.push(`w_${transformations.width}`)
  if (transformations.height) parts.push(`h_${transformations.height}`)
  if (transformations.crop) parts.push(`c_${transformations.crop}`)
  if (transformations.quality) parts.push(`q_${transformations.quality}`)
  
  if (parts.length === 0) {
    return url
  }

  // Insert transformations into URL
  // Pattern: /upload/transformations/public_id
  const transformString = parts.join(',')
  return url.replace('/upload/', `/upload/${transformString}/`)
}

export default {
  config: CLOUDINARY_CONFIG,
  upload: uploadToCloudinary,
  getSecureUrl,
  transformUrl,
}
