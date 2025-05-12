import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonialData } from '../data/testimonialData';

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonialData.length - 1 ? 0 : prev + 1));
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonialData.length - 1 : prev - 1));
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="bg-[#F7941D] rounded-lg p-4 text-white relative">
          <h2 className="text-xl font-bold mb-4">Testimonials</h2>
          
          <div className="flex items-center">
            <button onClick={prevTestimonial} className="mr-4">
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex-grow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-full mr-4 flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={testimonialData[activeIndex].avatar} 
                    alt={testimonialData[activeIndex].name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                
                <div>
                  <h3 className="font-bold">{testimonialData[activeIndex].name}</h3>
                  <p className="text-sm">{testimonialData[activeIndex].date}</p>
                  <p className="text-sm mt-1">{testimonialData[activeIndex].text}</p>
                </div>
              </div>
            </div>
            
            <button onClick={nextTestimonial} className="ml-4">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;