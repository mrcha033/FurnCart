import React from 'react';
import { Product } from '../App';

interface ProductListProps {
  products: Product[];
  addToCart: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, addToCart }) => {
  if (products.length === 0) {
    return <p>No products found matching your criteria. Try adjusting your preferences.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="h-64 overflow-hidden">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="p-4">
            <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{product.category}</p>
            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{product.description}</p>
            
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
              <button 
                onClick={() => addToCart(product)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors duration-300"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList; 