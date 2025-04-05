import { RecommendationResponse } from '../App';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface PreferenceInput {
  room_type: string;
  style: string;
  size: string;
  budget: number;
  image_url?: string;
}

export const checkServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/status`);
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking server connection:', error);
    return false;
  }
};

export const getRecommendations = async (preferences: PreferenceInput): Promise<RecommendationResponse> => {
  try {
    // First check if server is reachable
    const isConnected = await checkServerConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to the server. Please check your internet connection or try again later.');
    }
    
    console.log(`Sending request to ${API_URL}/recommend`);
    
    const response = await fetch(`${API_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(preferences),
      credentials: 'omit', // Don't send cookies for cross-origin requests
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      // Try to get more detailed error information if available
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // If parsing JSON fails, use the default error message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}; 