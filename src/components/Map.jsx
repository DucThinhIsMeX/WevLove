import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getLocations } from '../data/mockData';
import ImageGallery from './ImageGallery';
import { Images } from 'lucide-react';

// Custom Heart Icon using divIcon and SVG
const heartSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;

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
      <section className="py-20 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-violet-900 mb-4">Our Memory Map</h2>
            <p className="text-rose-500">Những nơi ta đã cùng nhau đi qua</p>
          </div>

          <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl shadow-rose-100/50 border-4 border-white">
            <MapContainer center={center} zoom={6} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              {locations.map((loc) => {
                // Handle backwards compatibility for data that only has 'img'
                const imagesArray = loc.images || (loc.img ? [loc.img] : []);
                const coverImage = imagesArray.length > 0 ? imagesArray[0] : '';
                const hasMultipleImages = imagesArray.length > 1;

                return (
                  <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon}>
                    <Popup className="custom-popup">
                      <div className="text-center p-1 w-52">
                        <div 
                          className="relative cursor-pointer group rounded-lg overflow-hidden mb-3 shadow-md border-2 border-transparent hover:border-rose-400 transition-colors"
                          onClick={() => {
                            if (imagesArray.length > 0) setGalleryImages(imagesArray);
                          }}
                        >
                          <img 
                            src={coverImage} 
                            alt={loc.name} 
                            className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Multiple images indicator */}
                          {hasMultipleImages && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 font-medium shadow-sm">
                              <Images className="w-3 h-3" /> +{imagesArray.length - 1}
                            </div>
                          )}

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                            <span className="text-white opacity-0 group-hover:opacity-100 font-semibold text-sm drop-shadow-md bg-black/40 px-3 py-1 rounded-full">Xem ảnh</span>
                          </div>
                        </div>
                        
                        <h4 className="font-bold text-violet-900 text-base mb-1">{loc.name}</h4>
                        <p className="text-gray-600 text-xs line-clamp-3">{loc.note}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </section>

      {/* Fullscreen Image Gallery */}
      <ImageGallery 
        images={galleryImages} 
        onClose={() => setGalleryImages(null)} 
      />
    </>
  );
};

export default Map;
