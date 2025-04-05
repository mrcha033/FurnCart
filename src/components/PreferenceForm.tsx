import React, { useState, useEffect } from 'react';
import { RecommendationResponse } from '../App';
import { getRecommendations, checkServerConnection } from '../services/api';

interface PreferenceFormProps {
  setRecommendations: React.Dispatch<React.SetStateAction<RecommendationResponse | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const PreferenceForm: React.FC<PreferenceFormProps> = ({ setRecommendations, setLoading }) => {
  const [roomType, setRoomType] = useState('living_room');
  const [style, setStyle] = useState('modern');
  const [size, setSize] = useState('medium');
  const [budget, setBudget] = useState(1500);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [serverConnected, setServerConnected] = useState<boolean | null>(null);

  // Check server connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkServerConnection();
      setServerConnected(isConnected);
      if (!isConnected) {
        setError('Cannot connect to the recommendation server. Please try again later.');
      }
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check server connection again before submitting
    const isConnected = await checkServerConnection();
    if (!isConnected) {
      setError('Cannot connect to the server. Please check your internet connection or try again later.');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending request with preferences:', {
        room_type: roomType,
        style,
        size,
        budget,
        image_url: imageUrl || undefined,
      });
      
      const data = await getRecommendations({
        room_type: roomType,
        style,
        size,
        budget,
        image_url: imageUrl || undefined,
      });
      
      console.log('Received recommendations:', data);
      setRecommendations(data);
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(`Failed to fetch recommendations: ${err.message || 'Unknown error'}. Please try again.`);
      setRecommendations(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {serverConnected === false && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded">
          ⚠️ The recommendation server is currently unavailable. Recommendations may not work at this time.
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Type Selection */}
          <div className="mb-4">
            <label htmlFor="roomType" className="block text-gray-700 font-medium mb-2">
              Room Type
            </label>
            <select
              id="roomType"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="living_room">Living Room</option>
              <option value="bedroom">Bedroom</option>
              <option value="dining_room">Dining Room</option>
              <option value="office">Home Office</option>
            </select>
          </div>

          {/* Style Selection */}
          <div className="mb-4">
            <label htmlFor="style" className="block text-gray-700 font-medium mb-2">
              Style Preference
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="scandinavian">Scandinavian</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>

          {/* Size Selection */}
          <div className="mb-4">
            <label htmlFor="size" className="block text-gray-700 font-medium mb-2">
              Room Size
            </label>
            <select
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Budget Input */}
          <div className="mb-4">
            <label htmlFor="budget" className="block text-gray-700 font-medium mb-2">
              Budget (${budget})
            </label>
            <input
              type="range"
              id="budget"
              min="250"
              max="5000"
              step="50"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$250</span>
              <span>$5000</span>
            </div>
          </div>
        </div>

        {/* Optional Image URL Input */}
        <div className="mb-6">
          <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">
            Room Image URL (Optional)
          </label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter URL of your room image"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Adding a room image may help our AI make better recommendations.
          </p>
        </div>

        {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded border border-red-200">{error}</div>}

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300"
            disabled={serverConnected === false}
          >
            Get Recommendations
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreferenceForm; 