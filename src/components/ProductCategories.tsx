import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { productData } from '../data/productData';

const ProductCategories: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slidesPerView = {
    sm: 2,
    md: 3,
    lg: 5
  };
  
  const totalSlides = Math.ceil(productData.length / slidesPerView.lg);
  
  const nextSlide = () => {
    setActiveSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };
  
  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  // Calculate visible products based on active slide and screen size
  const visibleProducts = productData.slice(
    activeSlide * slidesPerView.lg, 
    (activeSlide + 1) * slidesPerView.lg
  );

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-1 shadow-md hidden md:block"
            onClick={prevSlide}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-1 shadow-md hidden md:block"
            onClick={nextSlide}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === activeSlide ? 'bg-[#F7941D]' : 'bg-gray-300'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;