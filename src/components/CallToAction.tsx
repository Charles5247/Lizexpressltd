import React from 'react';
import { useNavigate } from 'react-router-dom';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-lg md:text-xl font-medium">
              Will you like to get what you want with<br className="hidden md:block" />
              what you have, spending little or NO<br className="hidden md:block" />
              CASH???
            </p>
          </div>
          
          <div>
            <button 
              onClick={() => navigate('/list-item')}
              className="bg-[#F7941D] text-white font-bold py-2 px-6 rounded hover:bg-[#e68a1c] transition-colors"
            >
              CLICK HERE NOW!
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;