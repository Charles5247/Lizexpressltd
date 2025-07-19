import React, { useState, useEffect } from 'react';

interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  highlight: string;
}

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: HeroSlide[] = [
    {
      id: 1,
      image: 'https://drive.google.com/uc?export=view&id=1vQD9-4mYYvzVikn9IJEKb1zCm6a0v2EI',
      title: 'Swap',
      subtitle: 'what you have',
      highlight: 'for what you need!'
    },
    {
      id: 3,
      image: 'https://imgur.com/i6uhzyK.png',
      title: 'Trade your Appliances',
      subtitle: 'cashlessly',
      highlight: 'and efficiently!'
    },
    {
      id: 3,
      image: 'https://drive.google.com/file/d/1vQD9-4mYYvzVikn9IJEKb1zCm6a0v2EI/view?usp=drive_link',
      title: 'Trade your Appliances',
      subtitle: 'cashlessly',
      highlight: 'and efficiently!'
    }
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
              className={`absolute inset-0 flex flex-col md:flex-row-reverse items-center justify-between gap-6 md:gap-6 transition-all duration-1000 ease-in-out transform ${
                index === currentSlide
                  ? 'opacity-100 translate-x-0 z-10'
                  : 'opacity-0 translate-x-full z-0'
              }`}
            >
              {/* Text Content (Right) */}
              <div className="w-full md:w-1/2 text-center md:text-left px-2 md:px-4 space-y-3 md:space-y-4 animate-fade-in-up">
                <h1 className="text-[clamp(1.5rem,5vw,2.5rem)] font-extrabold leading-snug">
                  <span className="text-[#4A0E67] block">{slide.title}</span>
                  <span className="text-black block">{slide.subtitle}</span>
                  <span className="text-[#F7941D] block">{slide.highlight}</span>
                </h1>
                <div className="w-14 h-1 bg-gradient-to-r from-[#4A0E67] to-[#F7941D] rounded-full mx-auto md:mx-0"></div>
              </div>

              {/* Image (Left) */}
              <div className="w-full md:w-1/2 flex justify-center md:justify-start px-2">
                <img
                  src={slide.image}
                  alt={`${slide.title} ${slide.subtitle}`}
                  className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[480px] object-contain drop-shadow-xl transition-transform duration-700 hover:scale-105"
                />
              </div>
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
