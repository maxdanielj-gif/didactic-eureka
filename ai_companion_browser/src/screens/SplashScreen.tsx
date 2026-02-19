import React, { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-600 flex flex-col items-center justify-center p-4 safe-top safe-bottom">
      <div className="animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-[#FFEB2A]/20 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
            <i className="fa fa-robot text-8xl text-[#FFEB2A] animate-pulse-soft"></i>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-[#FFEB2A] text-center mt-8 animate-slide-up">
          indigo AI
        </h1>
        <p className="text-[#FFEB2A]/80 text-center mt-4 text-lg animate-slide-up">
          Your Personal AI Friend
        </p>
      </div>
      <div className="mt-12 flex space-x-2">
        <div className="w-3 h-3 bg-[#FFEB2A]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-[#FFEB2A]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-[#FFEB2A]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default SplashScreen;