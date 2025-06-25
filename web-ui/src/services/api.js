// API service for communicating with the Flask backend
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8002';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for most requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle common error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      let message = data?.error || data?.message || 'An error occurred';
      
      switch (status) {
        case 400:
          message = `Bad Request: ${message}`;
          break;
        case 404:
          message = `Not Found: ${message}`;
          break;
        case 413:
          message = 'File too large. Maximum size is 100MB.';
          break;
        case 500:
          message = `Server Error: ${message}`;
          break;
        default:
          message = `Error ${status}: ${message}`;
      }
      
      error.message = message;
    } else if (error.request) {
      // Request made but no response received
      error.message = 'Unable to connect to the server. Please check if the API server is running.';
    } else {
      // Something else happened
      error.message = error.message || 'An unexpected error occurred';
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  // Get available models
  async getModels() {
    try {
      const response = await api.get('/api/models');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch models:', error);
      // Return fallback models if API is not available
      return [];
    }
  },

  // Get available languages
  async getLanguages() {
    try {
      const response = await api.get('/api/languages');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      // Return fallback languages if API is not available
      return [];
    }
  },

  // Start translation
  async startTranslation(file, settings) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('settings', JSON.stringify(settings));

      const response = await api.post('/api/translate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for upload
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to start translation: ${error.message}`);
    }
  },

  // Get translation status
  async getTranslationStatus(translationId) {
    try {
      const response = await api.get(`/api/translate/${translationId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get translation status: ${error.message}`);
    }
  },

  // Pause translation
  async pauseTranslation(translationId) {
    try {
      const response = await api.post(`/api/translate/${translationId}/pause`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to pause translation: ${error.message}`);
    }
  },

  // Resume translation
  async resumeTranslation(translationId) {
    try {
      const response = await api.post(`/api/translate/${translationId}/resume`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to resume translation: ${error.message}`);
    }
  },

  // Cancel translation
  async cancelTranslation(translationId) {
    try {
      const response = await api.delete(`/api/translate/${translationId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to cancel translation: ${error.message}`);
    }
  },

  // Get download URL
  getDownloadUrl(translationId) {
    return `${API_BASE_URL}/api/download/${translationId}`;
  },

  // Download file (triggers browser download)
  async downloadFile(translationId, filename) {
    try {
      const response = await api.get(`/api/download/${translationId}`, {
        responseType: 'blob',
        timeout: 120000, // 2 minutes for download
      });

      // Create blob link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'translated_book');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }
  },
};

// Polling utility for translation status
export class TranslationPoller {
  constructor(translationId, onUpdate, onComplete, onError) {
    this.translationId = translationId;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.onError = onError;
    this.polling = false;
    this.pollInterval = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  start(interval = 2000) {
    if (this.polling) return;
    
    this.polling = true;
    this.retryCount = 0;
    
    const poll = async () => {
      if (!this.polling) return;

      try {
        const status = await apiService.getTranslationStatus(this.translationId);
        
        // Reset retry count on successful response
        this.retryCount = 0;
        
        // Call update callback
        if (this.onUpdate) {
          this.onUpdate(status);
        }

        // Check if translation is complete
        if (status.status === 'completed') {
          this.stop();
          if (this.onComplete) {
            this.onComplete(status);
          }
        } else if (status.status === 'error') {
          this.stop();
          if (this.onError) {
            this.onError(new Error(status.error_message || 'Translation failed'));
          }
        } else if (status.status === 'cancelled') {
          this.stop();
          if (this.onComplete) {
            this.onComplete(status);
          }
        }
      } catch (error) {
        this.retryCount++;
        console.error(`Polling error (attempt ${this.retryCount}):`, error);
        
        if (this.retryCount >= this.maxRetries) {
          this.stop();
          if (this.onError) {
            this.onError(new Error(`Failed to get translation status after ${this.maxRetries} attempts`));
          }
        }
      }
    };

    // Start polling immediately, then at intervals
    poll();
    this.pollInterval = setInterval(poll, interval);
  }

  stop() {
    this.polling = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  isPolling() {
    return this.polling;
  }
}

export default apiService;