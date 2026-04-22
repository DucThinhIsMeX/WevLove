import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getLocations } from '../data/mockData';
import ImageGallery from './ImageGallery';
import { Images, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Heart Icon using divIcon and SVG
const heartSvg = `
<div class="heart-marker">
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#f43f5e" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
  <div class="heart-shadow"></div>
</div>`;

const customIcon = new L.divIcon({
  html: heartSvg,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const Map = () => {
  const [locations, setLocations] = useState([]);
  const [galleryImages, setGalleryImages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await getLocations();
      setLocations(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Center of the map (Vietnam center - Da Nang)
  const center = [16.0471, 108.2062];

  return (
    <>
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-rose-100 opacity-20 rotate-12">
          <Heart size={120} fill="currentColor" />
        </div>
        <div className="absolute bottom-10 right-10 text-rose-100 opacity-20 -rotate-12">
          <Heart size={160} fill="currentColor" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-violet-900 mb-4 font-serif">Our Memory Map</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-rose-200"></span>
              <p className="text-rose-500 italic font-medium">Nơi tình yêu bắt đầu và lan tỏa</p>
              <span className="h-px w-8 bg-rose-200"></span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="h-[550px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-rose-200/40 border-8 border-white relative"
          >
            <MapContainer center={center} zoom={6} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              {locations.map((loc) => {
                const imagesArray = loc.images || (loc.img ? [loc.img] : []);
                const coverImage = imagesArray.length > 0 ? imagesArray[0] : '';
                const hasMultipleImages = imagesArray.length > 1;

                return (
                  <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon}>
                    <Popup className="cute-popup" minWidth={220}>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-center p-2"
                      >
                        <div className="mb-3">
                          <h3 className="text-violet-900 font-bold text-base leading-tight">
                            {loc.name}
                          </h3>
                        </div>

                        <div 
                          className="relative cursor-pointer group rounded-xl overflow-hidden mb-3 shadow-sm border-2 border-rose-50 hover:border-rose-300 transition-all duration-300"
                          onClick={() => {
                            if (imagesArray.length > 0) setGalleryImages(imagesArray);
                          }}
                        >
                          <img 
                            src={coverImage} 
                            alt="Memory" 
                            className="w-full h-48 object-cover object-center group-hover:scale-110 transition-transform duration-500"
                          />
                          
                          {hasMultipleImages && (
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-rose-500 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold shadow-sm border border-rose-100">
                              <Images className="w-2.5 h-2.5" /> {imagesArray.length}
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 p-2 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative px-2">
                          <p className="text-gray-600 text-sm leading-relaxed italic">
                            "{loc.note}"
                          </p>
                          <div className="mt-3 flex justify-center">
                            <span className="w-8 h-0.5 bg-rose-100 rounded-full"></span>
                          </div>
                        </div>
                      </motion.div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </motion.div>
        </div>
      </section>

      <ImageGallery 
        images={galleryImages} 
        onClose={() => setGalleryImages(null)} 
      />
    </>
  );
};

export default Map;
