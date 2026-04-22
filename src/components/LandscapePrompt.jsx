import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

const LandscapePrompt = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if device is mobile (rough check via user agent)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      // Or check if it's portrait and small screen
      const mql = window.matchMedia("(orientation: portrait)");
      const isSmallScreen = window.innerWidth < 768;

      if ((isMobile || isSmallScreen) && mql.matches) {
        setIsPortrait(true);
      } else {
        setIsPortrait(false);
      }
    };

    // Initial check
    checkOrientation();

    // Listen to resize and orientation change
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (isPortrait) {
    return (
      <div className="fixed inset-0 z-[9999] bg-pink-100 flex flex-col items-center justify-center p-6 text-center">
        <RotateCcw className="w-20 h-20 text-rose-500 mb-6 animate-spin-slow" />
        <h2 className="text-3xl font-bold text-violet-900 mb-4 font-sans tracking-tight">
          Oops! Màn hình dọc mất rồi
        </h2>
        <p className="text-lg text-rose-600 font-medium leading-relaxed max-w-sm">
          Tũn yêu ơi, xoay ngang điện thoại để xem kỷ niệm của chúng mình rõ hơn nha! 💕
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default LandscapePrompt;
