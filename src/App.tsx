import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import PreferenceForm from './components/PreferenceForm';
import ProductList from './components/ProductList';
import Cart from './components/Cart';

// Define types for our application
export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
}

export interface RecommendationResponse {
  products: Product[];
  total_price: number;
}

export interface CartItem extends Product {
  quantity: number;
}

function App() {
  // State for storing recommendations and cart items
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to handle adding a product to cart
  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // If item already exists in cart, increase quantity
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // If item is new, add it to cart with quantity 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Function to handle removing a product from cart
  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.id !== productId)
    );
  };

  // Function to update product quantity in cart
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  // Calculate total price of items in cart
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemCount={cartItems.reduce((count, item) => count + item.quantity, 0)} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Preference Form Section */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Find Your Perfect Furniture Bundle</h2>
            <PreferenceForm 
              setRecommendations={setRecommendations} 
              setLoading={setLoading} 
            />
          </div>
        </section>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations && !loading && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Recommended Furniture</h2>
            <ProductList 
              products={recommendations.products} 
              addToCart={addToCart} 
            />
            <div className="mt-6 text-right">
              <p className="text-xl font-semibold">Total Bundle Price: ${recommendations.total_price.toFixed(2)}</p>
              <button 
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full"
                onClick={() => recommendations.products.forEach(product => addToCart(product))}
              >
                Add All to Cart
              </button>
            </div>
          </section>
        )}

        {/* Cart Section */}
        {cartItems.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h2>
            <Cart 
              items={cartItems} 
              removeFromCart={removeFromCart} 
              updateQuantity={updateQuantity}
              cartTotal={cartTotal}
            />
          </section>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-24">
        <div className="container mx-auto px-4 text-center">
          <p>© 2023 FurnCart: AI Furniture Recommender + Cart Generator</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
