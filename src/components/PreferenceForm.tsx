import React, { useState, useEffect, useRef } from 'react';
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
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [serverConnected, setServerConnected] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedImage(file);
      
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Clear the image URL input since we're using a file
      setImageUrl('');
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      // Create a FormData object if we have an uploaded image
      let imageBase64: string | undefined = undefined;
      
      if (uploadedImage) {
        // Convert the image to base64
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to convert image to base64'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(uploadedImage);
        });
      }
      
      console.log('Sending request with preferences:', {
        room_type: roomType,
        style,
        size,
        budget,
        image_url: imageUrl || undefined,
        image_data: imageBase64 ? '(base64 image data)' : undefined,
      });
      
      const data = await getRecommendations({
        room_type: roomType,
        style,
        size,
        budget,
        image_url: imageUrl || undefined,
        image_data: imageBase64,
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
              min="50"
              max="1000"
              step="50"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$50</span>
              <span>$1000</span>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Room Image (Optional)
          </label>
          
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Room preview" 
                className="w-full h-60 object-cover rounded-md mb-2" 
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex space-x-2">
                <div 
                  className="flex-1 border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
                  <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
                </div>
                
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-gray-500 mt-2">Take Photo</span>
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              
              <div className="mt-4">
                <label htmlFor="imageUrl" className="block text-gray-700 text-sm mb-1">
                  Or provide an image URL:
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    // Clear uploaded image if URL is provided
                    if (e.target.value) {
                      setUploadedImage(null);
                      setImagePreview(null);
                    }
                  }}
                  placeholder="https://example.com/room-image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
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