import { RecommendationResponse } from '../App';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface PreferenceInput {
  room_type: string;
  style: string;
  size: string;
  budget: number;
  image_url?: string;
}

export const getRecommendations = async (preferences: PreferenceInput): Promise<RecommendationResponse> => {
  try {
    const response = await fetch(`${API_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}; 