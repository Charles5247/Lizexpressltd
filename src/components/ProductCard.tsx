import React from 'react';
import { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="flex flex-col items-center p-2 transition-transform hover:scale-105">
      <div className="bg-gray-100 p-2 rounded-lg mb-2 w-full flex justify-center items-center" style={{ height: '120px' }}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="h-auto max-w-full max-h-full object-contain"
        />
      </div>
      <h3 className="text-center font-semibold text-sm">{product.name}</h3>
      <p className="text-[#4A0E67] text-xs text-center">{product.price}</p>
      <button className="mt-2 text-[#F7941D] text-xs hover:underline">
        Place Order
      </button>
    </div>
  );
};

export default ProductCard;