import React, { useState, useEffect } from 'react';

interface HeroSlide {
  id: number;
  image: string;
}

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: HeroSlide[] = [
    { id: 1, image: '/Lizexpress Ltd images/Liz Web Images (3).jpg' },
    { id: 2, image: '/Lizexpress Ltd images/Liz Web Images (4).jpg' },
    { id: 3, image: '/Lizexpress Ltd images/Liz Web Images (7).jpg' },
    { id: 4, image: '/Lizexpress Ltd images/Liz Web Images (8).jpg' },
    { id: 5, image: '/Lizexpress Ltd images/Liz Web Images (10).jpg' },
    { id: 6, image: '/Lizexpress Ltd images/Liz Web Images (11).jpg' },
    { id: 7, image: '/Lizexpress Ltd images/Liz Web Images (13).jpg' },
    { id: 8, image: '/Lizexpress Ltd images/Liz Web Images (15).jpg' },
    { id: 9, image: '/Lizexpress Ltd images/Liz Web Images (16).jpg' },
    { id: 10, image: '/Lizexpress Ltd images/Liz Web Images (18).jpg' }
  ];

  // Auto-slide only if more than 1 slide
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative bg-white overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="relative h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px] overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out transform ${
                index === currentSlide
                  ? 'opacity-100 translate-x-0 z-10'
                  : 'opacity-0 translate-x-full z-0'
              }`}
            >
              <img
                src={slide.image}
                alt={`Carousel Slide ${index + 1}`}
                className="w-full max-w-[480px] object-contain drop-shadow-xl transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Dot Navigation (Only if more than 1 slide) */}
        {slides.length > 1 && (
          <div className="mt-8 flex justify-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-[#F7941D] scale-125 shadow-lg'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default Hero;
