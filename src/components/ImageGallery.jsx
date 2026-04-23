import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGallery = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === images?.length - 1 ? 0 : prev + 1));
  }, [images]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images?.length - 1 : prev - 1));
  }, [images]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images, onClose, nextImage, prevImage]);

  if (!images || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all z-50"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Image Display */}
        <div className="relative w-full max-w-5xl h-full max-h-[80vh] flex items-center justify-center px-4">
          
          {images.length > 1 && (
            <button 
              onClick={prevImage}
              className="absolute left-4 md:left-10 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 p-3 rounded-full transition-all z-50"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <motion.img 
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={images[currentIndex]} 
            alt={`gallery-${currentIndex}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />

          {images.length > 1 && (
            <button 
              onClick={nextImage}
              className="absolute right-4 md:right-10 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 p-3 rounded-full transition-all z-50"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Counter & Thumbnails */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center">
          <p className="text-white/80 font-medium mb-4">
            {currentIndex + 1} / {images.length}
          </p>
          
          {images.length > 1 && (
            <div className="flex gap-2 px-4 max-w-full overflow-x-auto pb-2 custom-scrollbar">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-rose-500 scale-110 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageGallery;
