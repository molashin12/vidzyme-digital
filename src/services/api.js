import { auth } from '../config/firebase';

// Backend API base URL - update this based on your deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get the current user's ID token for authentication
 * @returns {Promise<string>} ID token
 */
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>} API response
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const token = await getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Upload file with authentication
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - Form data with file
 * @returns {Promise<any>} API response
 */
async function uploadFile(endpoint, formData) {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

// Video API functions
export const videoAPI = {
  /**
   * Generate video using complete pipeline
   * @param {object} data - Video generation data
   * @returns {Promise<any>} Generation result
   */
  async generateVideo(data) {
    return apiRequest('/video/create-complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Generate video without Genkit
   * @param {object} data - Video generation data
   * @returns {Promise<any>} Generation result
   */
  async generateVideoSimple(data) {
    return apiRequest('/video/generate-simple', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Extract frame from video
   * @param {FormData} formData - Form data with video file
   * @returns {Promise<any>} Extraction result
   */
  async extractFrame(formData) {
    return uploadFile('/video/extract-frame', formData);
  },

  /**
   * Analyze image
   * @param {FormData} formData - Form data with image file
   * @returns {Promise<any>} Analysis result
   */
  async analyzeImage(formData) {
    return uploadFile('/video/analyze-image', formData);
  },

  /**
   * Generate prompt from image
   * @param {FormData} formData - Form data with image file
   * @returns {Promise<any>} Prompt generation result
   */
  async generatePrompt(formData) {
    return uploadFile('/video/generate-prompt', formData);
  },

  /**
   * Generate image
   * @param {object} data - Image generation data
   * @returns {Promise<any>} Generation result
   */
  async generateImage(data) {
    return apiRequest('/video/generate-image', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get video status
   * @param {string} videoId - Video ID
   * @returns {Promise<any>} Video status
   */
  async getVideoStatus(videoId) {
    return apiRequest(`/video/status/${videoId}`);
  },

  /**
   * List user videos
   * @returns {Promise<any>} User videos
   */
  async listVideos() {
    return apiRequest('/video/list');
  },

  /**
   * Delete video
   * @param {string} videoId - Video ID
   * @returns {Promise<any>} Deletion result
   */
  async deleteVideo(videoId) {
    return apiRequest(`/video/${videoId}`, {
      method: 'DELETE',
    });
  },
};

// Auth API functions
export const authAPI = {
  /**
   * Verify token
   * @returns {Promise<any>} Token verification result
   */
  async verifyToken() {
    return apiRequest('/auth/verify');
  },

  /**
   * Get user profile
   * @returns {Promise<any>} User profile
   */
  async getProfile() {
    return apiRequest('/auth/profile');
  },
};

// Health API functions
export const healthAPI = {
  /**
   * Check API health
   * @returns {Promise<any>} Health status
   */
  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  },

  /**
   * Get detailed health info
   * @returns {Promise<any>} Detailed health info
   */
  async getHealthInfo() {
    const response = await fetch(`${API_BASE_URL}/health/info`);
    return await response.json();
  },
};

export default {
  videoAPI,
  authAPI,
  healthAPI,
};