import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#4A0E67] via-[#2d0a3d] to-[#F7941D] flex items-center justify-center z-[9999]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo Container with 3D Effect */}
        <div className="relative mb-8">
          <div className="relative">
            {/* Shadow layers for 3D effect */}
            <div className="absolute inset-0 bg-black/30 rounded-3xl transform translate-x-2 translate-y-2 blur-sm"></div>
            <div className="absolute inset-0 bg-black/20 rounded-3xl transform translate-x-1 translate-y-1 blur-sm"></div>
            
            {/* Main logo container */}
            <div className="relative w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-slow">
              {/* Logo */}
              <div className="text-center">
                <div className="text-2xl font-bold text-[#4A0E67] leading-tight">
                  Liz
                </div>
                <div className="text-2xl font-bold text-[#F7941D] leading-tight -mt-1">
                  Express
                </div>
              </div>
              
              {/* Rotating ring around logo */}
              <div className="absolute inset-0 border-4 border-transparent border-t-[#F7941D] rounded-3xl animate-spin-slow"></div>
              
              {/* Pulsing dots */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#F7941D] rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#4A0E67] rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 animate-fade-in-up">
            LizExpress
          </h1>
          <p className="text-xl text-white/90 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            Swap what you have for what you need!
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Preloader;