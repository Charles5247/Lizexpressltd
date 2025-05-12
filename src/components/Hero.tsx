import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 flex justify-center">
            <img 
              src="https://imgur.com/HcVBiqw.png" 
              alt="Person with shopping bags"
              className="max-w-full h-auto rounded-lg object-cover"
              style={{ maxHeight: '400px' }}
            />
          </div>
          <div className="w-full md:w-1/2 mt-6 md:mt-0 text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-[#4A0E67]">Swap </span>
              <span className="text-black">what you have</span>
              <br />
              <span className="text-[#4A0E67]">for </span>
              <span className="text-[#F7941D]">what you need!</span>
            </h1>
            <div className="mt-4 flex justify-center md:justify-end">
              <div className="flex space-x-2">
                <div className="h-3 w-3 bg-[#F7941D] rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;