import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-rose-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 text-center"
      >
        <motion.div 
          className="flex justify-center mb-6"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Heart className="w-16 h-16 text-rose-500 fill-rose-500" />
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-violet-900 tracking-tight">
          Gửi Tũn yêu
        </h1>
        
        <div className="h-20"> {/* Fixed height to prevent layout shift during typewriter */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-lg md:text-2xl text-rose-600 font-medium max-w-2xl mx-auto"
          >
            "Cảm ơn vì đã đến và làm cho thanh xuân của anh trở nên rực rỡ nhất."
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-12"
        >
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Cuộn xuống để xem lại hành trình</p>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-12 bg-rose-300 mx-auto"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
