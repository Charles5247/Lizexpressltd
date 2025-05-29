import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ItemDetails: React.FC = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock data - replace with actual data fetching
  const item = {
    name: "Go Portable Bluetooth Speaker",
    description: "A neatly used GO Portable BT Speaker in Lagos, Nigeria. There's no issue with it at all. I'd like to swap for a VR Glass.",
    category: "Electronics",
    condition: "Neatly Used",
    estimatedCost: "N37,000",
    swapFor: "VR Glasses",
    location: "Jos, Nigeria",
    images: [
      "https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg",
      "https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg",
      "https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg"
    ]
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image Gallery */}
            <div className="md:w-1/2 relative">
              <div className="aspect-w-4 aspect-h-3 relative">
                <img
                  src={item.images[currentImageIndex]}
                  alt={item.name}
                  className="w-full h-[400px] object-cover"
                />
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              <div className="flex justify-center mt-4 space-x-2">
                {item.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-[#F7941D]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Item Details */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-[#4A0E67] mb-4">{item.name}</h1>
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Description:</h2>
                  <p className="text-gray-600">{item.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Category:</h2>
                    <p className="text-gray-600">{item.category}</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Condition:</h2>
                    <p className="text-gray-600">{item.condition}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Estimated Cost Value:</h2>
                    <p className="text-gray-600">{item.estimatedCost}</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Swap For:</h2>
                    <p className="text-gray-600">{item.swapFor}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Location:</h2>
                  <p className="text-gray-600">{item.location}</p>
                </div>
              </div>

              <button className="mt-8 w-full bg-[#F7941D] text-white py-3 rounded-lg font-bold hover:bg-[#e68a1c] transition-colors">
                START A CHAT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;