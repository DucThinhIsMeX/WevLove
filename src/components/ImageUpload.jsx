import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUpload = ({ 
  images = [], 
  onChange, 
  onRemove, 
  multiple = false, 
  label = "Thêm ảnh",
  maxImages = 10 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    if (multiple) {
      onChange(files.slice(0, maxImages - images.length));
    } else {
      onChange([files[0]]);
    }
  };

  const onFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
          flex flex-col items-center justify-center gap-3
          ${isDragging 
            ? 'border-rose-500 bg-rose-50 scale-[1.02]' 
            : 'border-gray-200 hover:border-rose-300 hover:bg-gray-50'}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileInputChange}
          accept="image/*"
          multiple={multiple}
          className="hidden"
        />
        
        <div className={`p-4 rounded-full ${isDragging ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'}`}>
          <Upload className={`w-8 h-8 ${isDragging ? 'animate-bounce' : ''}`} />
        </div>
        
        <div className="text-center">
          <p className="font-bold text-gray-700">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Kéo thả hoặc nhấn để chọn ảnh</p>
        </div>

        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-rose-500/10 rounded-2xl pointer-events-none border-2 border-rose-500"
          />
        )}
      </div>

      {/* Preview Gallery */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {images.map((url, idx) => (
              <motion.div
                key={url + idx}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square group rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <img 
                  src={url} 
                  alt="preview" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(idx);
                    }}
                    className="p-2 bg-white/90 text-rose-500 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
            
            {multiple && images.length < maxImages && (
              <motion.div
                layout
                onClick={triggerFileInput}
                className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-rose-300 hover:text-rose-400 hover:bg-rose-50/30 transition-all cursor-pointer"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[10px] font-medium">Thêm tiếp</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;
