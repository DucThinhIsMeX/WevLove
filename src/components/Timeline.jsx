import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plane, Star, Gift } from 'lucide-react';
import { getMemories } from '../data/mockData';
import { playHover } from '../utils/audio';

const iconConfig = {
  Heart: { icon: <Heart className="w-5 h-5 text-white" />, color: 'bg-rose-400 shadow-rose-200' },
  Plane: { icon: <Plane className="w-5 h-5 text-white" />, color: 'bg-sky-400 shadow-sky-200' },
  Star: { icon: <Star className="w-5 h-5 text-white" />, color: 'bg-amber-400 shadow-amber-200' },
  Gift: { icon: <Gift className="w-5 h-5 text-white" />, color: 'bg-purple-400 shadow-purple-200' }
};

const TimelineItem = ({ memory, index }) => {
  const isEven = index % 2 === 0;
  const config = iconConfig[memory.icon] || iconConfig.Heart;

  return (
    <div className={`mb-16 flex items-center w-full flex-row md:justify-between ${isEven ? 'md:flex-row-reverse' : ''}`}>
      <div className="hidden md:block w-5/12"></div>
      
      <div className="z-20">
        <div className={`flex items-center justify-center w-12 h-12 ${config.color} rounded-full shadow-lg transform hover:scale-125 transition-transform duration-300`}>
          {config.icon}
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, x: isEven ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, type: "spring" }}
        onMouseEnter={playHover}
        className="w-full md:w-5/12 bg-white rounded-2xl shadow-xl shadow-pink-100/50 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ml-6 md:ml-0"
      >
        <img 
          src={memory.imageUrl} 
          alt={memory.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-semibold mb-3">
            {memory.date}
          </span>
          <h3 className="text-xl font-bold text-violet-900 mb-2">{memory.title}</h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            {memory.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Timeline = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await getMemories();
      setMemories(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-pink-50 relative overflow-hidden flex justify-center items-center h-64">
        <div className="text-rose-500 font-bold animate-pulse">Đang tải kỷ niệm...</div>
      </section>
    );
  }

  if (memories.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-pink-50/50 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-violet-900 mb-4">Our Love Timeline</h2>
          <p className="text-rose-500">Từng bước chân ta đi qua cùng nhau</p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-rose-200 rounded-full"></div>
          
          <div className="relative z-10 pt-10">
            {memories.map((memory, index) => (
              <TimelineItem key={memory.id} memory={memory} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
