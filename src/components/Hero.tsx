import React, { useState, useEffect } from 'react';

interface HeroSlide {
  id: number;
  image: string;
}

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: HeroSlide[] = [
    { id: 1, image: '/Lizexpress_Ltd_images/3.svg' },
    { id: 2, image: '/Lizexpress_Ltd_images/4.svg' },
    { id: 3, image: '/Lizexpress_Ltd_images/8.svg' },
    { id: 4, image: '/Lizexpress_Ltd_images/10.svg' },
    { id: 5, image: '/Lizexpress_Ltd_images/11.svg' },
    { id: 6, image: '/Lizexpress_Ltd_images/13.svg' },
    { id: 7, image: '/Lizexpress_Ltd_images/15.svg' },
    { id: 8, image: '/Lizexpress_Ltd_images/17.svg' },
    { id: 9, image: '/Lizexpress_Ltd_images/19.svg' }
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
      <div className="w-full px-0 py-0">
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
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
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Overlayed Carousel Indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex justify-center">
              <div className="bg-black/40 rounded-full px-4 py-2 flex gap-3 backdrop-blur-sm">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/70 ${
                      index === currentSlide
                        ? 'bg-[#F7941D] scale-125 shadow-lg'
                        : 'bg-gray-300 hover:bg-[#F7941D]/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dot Navigation (Only if more than 1 slide) */}
      </div>
    </section>
  );
};

export default Hero;