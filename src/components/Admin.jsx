import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMemories, getLocations, addMemory, updateMemory, deleteMemory, addLocation, updateLocation, deleteLocation, uploadImage } from '../data/mockData';
import { Home, Edit2, Trash2, CheckCircle2, AlertCircle, X, Heart, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ImageUpload from './ImageUpload';

const Admin = () => {
  const [memories, setMemories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });
  const [isUploading, setIsUploading] = useState(false);

  // Vietnam Administrative Data
  const [vnData, setVnData] = useState([]);
  const [selectedProv, setSelectedProv] = useState("");
  const [selectedDist, setSelectedDist] = useState("");

  const [memoryForm, setMemoryForm] = useState({ id: null, title: '', date: '', description: '', icon: 'Heart', imageUrl: '', imageFile: null });
  const [locationForm, setLocationForm] = useState({ id: null, name: '', lat: 10.8231, lng: 106.6297, note: '', images: [], imageFiles: [] });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ show: true, message, onConfirm });
  };

  const loadData = async () => {
    const mems = await getMemories();
    const locs = await getLocations();
    setMemories(mems);
    setLocations(locs);
  };

  useEffect(() => {
    loadData();
    fetch('https://provinces.open-api.vn/api/?depth=2')
      .then(res => res.json())
      .then(data => setVnData(data))
      .catch(err => console.error("Failed to load VN Data", err));
  }, []);

  const resizeImage = (file, maxWidth = 1200) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const resizedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
            resolve({ url: URL.createObjectURL(resizedFile), file: resizedFile });
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Helper to fetch coordinates automatically (silent, no loading screen)
  const fetchCoordinates = async (query) => {
    if (!query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Việt Nam')}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLocationForm(prev => ({...prev, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon)}));
        showToast('Đã tự động xác định vị trí', 'success');
      } else {
        showToast('Không tìm thấy tọa độ tự động', 'error');
      }
    } catch (err) {
      console.error('Lỗi tìm kiếm tọa độ', err);
    }
  };

  // ---- MEMORY HANDLERS ----
  const handleMemoryImagesChange = async (files) => {
    const file = files[0];
    if (file) {
      setIsUploading(true);
      try {
        const { url, file: resizedFile } = await resizeImage(file);
        setMemoryForm(prev => ({ ...prev, imageUrl: url, imageFile: resizedFile }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const submitMemory = async () => {
    try {
      setIsUploading(true);
      let finalImageUrl = memoryForm.imageUrl;
      if (memoryForm.imageFile) {
        finalImageUrl = await uploadImage(memoryForm.imageFile);
      }
      const payload = { ...memoryForm, imageUrl: finalImageUrl };
      delete payload.imageFile;

      if (memoryForm.id) {
        await updateMemory(payload);
        showToast('Cập nhật kỷ niệm thành công! 💖');
      } else {
        await addMemory(payload);
        showToast('Thêm kỷ niệm thành công! ✨');
      }
      
      await loadData();
      setMemoryForm({ id: null, title: '', date: '', description: '', icon: 'Heart', imageUrl: '', imageFile: null });
    } catch (error) {
      showToast('Có lỗi xảy ra rồi Tũn ơi: ' + error.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMemorySubmit = (e) => {
    e.preventDefault();
    if (!memoryForm.title || (!memoryForm.imageUrl && !memoryForm.imageFile)) return showToast('Vui lòng nhập tiêu đề và chọn ảnh!', 'error');
    
    if (memoryForm.id) {
      showConfirm('Bạn có chắc chắn muốn lưu thay đổi này không?', submitMemory);
    } else {
      submitMemory();
    }
  };

  const handleEditMemory = (mem) => {
    setMemoryForm({ ...mem, imageFile: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMemory = (id) => {
    showConfirm('Tũn yêu có chắc muốn XÓA kỷ niệm này không? Huhu 🥺', async () => {
      try {
        await deleteMemory(id);
        await loadData();
        showToast('Đã xóa kỷ niệm rồi nè!', 'success');
      } catch (err) {
        showToast('Lỗi khi xóa rồi Tũn ơi: ' + err.message, 'error');
      }
    });
  };

  // ---- LOCATION HANDLERS ----
  const handleLocationImagesChange = async (files) => {
    if (!files.length) return;
    
    setIsUploading(true);
    try {
      const processedFiles = await Promise.all(files.map(f => resizeImage(f)));
      setLocationForm(prev => ({
        ...prev,
        images: [...prev.images, ...processedFiles.map(pf => pf.url)],
        imageFiles: [...(prev.imageFiles || []), ...processedFiles.map(pf => pf.file)]
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const removeLocationImage = (indexToRemove) => {
    setLocationForm(prev => {
      const isNewBlob = prev.images[indexToRemove].startsWith('blob:');
      
      // If it's a new blob, we also need to remove it from imageFiles
      let newImageFiles = prev.imageFiles || [];
      if (isNewBlob) {
        // Find which file index it corresponds to
        const blobUrlToRemove = prev.images[indexToRemove];
        // This logic is a bit tricky if multiple blobs are added.
        // Let's simplify: imageFiles should align with the 'blob:' entries in images.
        const blobIndex = prev.images.slice(0, indexToRemove).filter(img => img.startsWith('blob:')).length;
        newImageFiles = (prev.imageFiles || []).filter((_, idx) => idx !== blobIndex);
      }

      return {
        ...prev,
        images: prev.images.filter((_, idx) => idx !== indexToRemove),
        imageFiles: newImageFiles
      };
    });
  };

  const submitLocation = async () => {
    setIsUploading(true);
    try {
      const finalImages = [];
      const filesToUpload = locationForm.imageFiles || [];
      let fileUploadIndex = 0;

      for (const imgUrl of locationForm.images) {
        if (imgUrl.startsWith('blob:')) {
          if (fileUploadIndex < filesToUpload.length) {
            const uploadedUrl = await uploadImage(filesToUpload[fileUploadIndex]);
            finalImages.push(uploadedUrl);
            fileUploadIndex++;
          }
        } else {
          finalImages.push(imgUrl);
        }
      }

      const payload = { ...locationForm, images: finalImages };
      delete payload.imageFiles;

      if (locationForm.id) {
        await updateLocation(payload);
        showToast('Cập nhật địa điểm thành công! 💖');
      } else {
        await addLocation(payload);
        showToast('Thêm địa điểm thành công! ✨');
      }
      
      await loadData();
      setLocationForm({ id: null, name: '', lat: 10.8231, lng: 106.6297, note: '', images: [], imageFiles: [] });
      setSelectedProv("");
      setSelectedDist("");
    } catch (error) {
      showToast('Có lỗi xảy ra rồi Tũn ơi: ' + error.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (!locationForm.name || locationForm.images.length === 0) return showToast('Vui lòng nhập tên và chọn ít nhất 1 ảnh!', 'error');
    
    if (locationForm.id) {
      showConfirm('Bạn có chắc chắn muốn lưu thay đổi này không?', submitLocation);
    } else {
      submitLocation();
    }
  };

  const handleEditLocation = (loc) => {
    setLocationForm({ ...loc, imageFiles: [] });
    setSelectedProv("");
    setSelectedDist("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLocation = (id) => {
    showConfirm('Tũn yêu có chắc muốn XÓA địa điểm này không? Huhu 🥺', async () => {
      try {
        await deleteLocation(id);
        await loadData();
        showToast('Đã xóa địa điểm rồi nè!', 'success');
      } catch(err) {
        showToast('Lỗi khi xóa rồi Tũn ơi: ' + err.message, 'error');
      }
    });
  };

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl font-bold ${
              toast.type === 'success' 
                ? 'bg-rose-50 text-rose-500 border-2 border-rose-200' 
                : 'bg-white text-rose-600 border-2 border-rose-500 shadow-rose-200'
            }`}
          >
            {toast.type === 'success' ? <Heart className="w-6 h-6 fill-rose-500" /> : <AlertCircle className="w-6 h-6" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmDialog.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-rose-900/20 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-4 border-rose-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Heart className="w-24 h-24 rotate-12" />
              </div>
              
              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div className="bg-rose-100 p-4 rounded-full">
                  <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-800">Tũn ơi!</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{confirmDialog.message}</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })} 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-2xl font-bold transition-all"
                >
                  Thôi mà
                </button>
                <button 
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog({ show: false, message: '', onConfirm: null });
                  }} 
                  className="flex-1 px-6 py-3 bg-rose-500 text-white hover:bg-rose-600 rounded-2xl font-bold transition-all shadow-lg shadow-rose-200 active:scale-95"
                >
                  Đồng ý ạ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      {/* Loading Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="relative">
              <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
              <Heart className="w-6 h-6 text-rose-300 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="mt-4 font-bold text-rose-500 animate-pulse">Đang xử lý ảnh cho Tũn nè...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-violet-900">Quản trị nội dung</h1>
          <Link to="/" className="flex items-center gap-2 text-rose-500 hover:text-rose-600 bg-white px-4 py-2 rounded-full shadow transition-all hover:shadow-md">
            <Home className="w-4 h-4" /> Về trang chủ
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ---- TIMELINE SECTION ---- */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-rose-500 border-b pb-2">
                {memoryForm.id ? 'Sửa Kỷ niệm' : 'Thêm Kỷ niệm (Timeline)'}
              </h2>
              <form onSubmit={handleMemorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                  <input type="text" value={memoryForm.title} onChange={e => setMemoryForm({...memoryForm, title: e.target.value})} className="mt-1 w-full p-2 border rounded-lg focus:ring-rose-300 focus:border-rose-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày</label>
                  <input type="text" placeholder="VD: 14/02/2024" value={memoryForm.date} onChange={e => setMemoryForm({...memoryForm, date: e.target.value})} className="mt-1 w-full p-2 border rounded-lg focus:ring-rose-300 focus:border-rose-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea value={memoryForm.description} onChange={e => setMemoryForm({...memoryForm, description: e.target.value})} className="mt-1 w-full p-2 border rounded-lg focus:ring-rose-300 focus:border-rose-300" rows="3" required></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Icon</label>
                  <select value={memoryForm.icon} onChange={e => setMemoryForm({...memoryForm, icon: e.target.value})} className="mt-1 w-full p-2 border rounded-lg focus:ring-rose-300 focus:border-rose-300">
                    <option value="Heart">Trái tim (Heart)</option>
                    <option value="Plane">Máy bay (Plane)</option>
                    <option value="Star">Ngôi sao (Star)</option>
                    <option value="Gift">Hộp quà (Gift)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh kỷ niệm</label>
                  <ImageUpload 
                    images={memoryForm.imageUrl ? [memoryForm.imageUrl] : []}
                    onChange={handleMemoryImagesChange}
                    onRemove={() => setMemoryForm({...memoryForm, imageUrl: '', imageFile: null})}
                    label="Chọn ảnh kỷ niệm"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 font-medium shadow-md shadow-rose-200">
                    {memoryForm.id ? 'Lưu thay đổi' : 'Thêm Kỷ Niệm'}
                  </button>
                  {memoryForm.id && (
                    <button type="button" onClick={() => setMemoryForm({ id: null, title: '', date: '', description: '', icon: 'Heart', imageUrl: '', imageFile: null })} className="bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200">
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Danh sách Kỷ niệm</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {memories.map(mem => (
                  <div key={mem.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={mem.imageUrl} className="w-12 h-12 rounded object-cover shadow-sm" alt="" />
                      <div>
                        <p className="font-bold text-sm text-gray-800 line-clamp-1">{mem.title}</p>
                        <p className="text-xs text-gray-500">{mem.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleEditMemory(mem)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteMemory(mem.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---- MAP SECTION ---- */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-violet-600 border-b pb-2">
                {locationForm.id ? 'Sửa Địa điểm' : 'Thêm Địa điểm (Map)'}
              </h2>
              <form onSubmit={handleLocationSubmit} className="space-y-4">


                <div className="bg-violet-50/50 p-4 rounded-xl border border-violet-100 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                    <p className="text-sm font-bold text-violet-900">Xác định Vị trí trên Bản đồ</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tỉnh/Thành phố</label>
                      <select 
                        value={selectedProv}
                        onChange={e => {
                          setSelectedProv(e.target.value);
                          setSelectedDist("");
                          setLocationForm(prev => ({...prev, name: e.target.value}));
                          fetchCoordinates(e.target.value); // silent fetch
                        }} 
                        className="w-full p-2.5 border border-white rounded-lg bg-white shadow-sm focus:ring-violet-300 focus:border-violet-300 text-sm outline-none" 
                      >
                        <option value="" disabled>-- Chọn --</option>
                        {vnData.map((p) => (
                          <option key={p.code} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Quận/Huyện</label>
                      <select 
                        value={selectedDist}
                        onChange={e => {
                          setSelectedDist(e.target.value);
                          setLocationForm(prev => ({...prev, name: `${e.target.value}, ${selectedProv}`}));
                          fetchCoordinates(`${e.target.value}, ${selectedProv}`); // silent fetch
                        }} 
                        disabled={!selectedProv}
                        className="w-full p-2.5 border border-white rounded-lg bg-white shadow-sm focus:ring-violet-300 focus:border-violet-300 text-sm outline-none disabled:bg-gray-50 disabled:opacity-50" 
                      >
                        <option value="" disabled>-- Chọn --</option>
                        {selectedProv && vnData.find(p => p.name === selectedProv)?.districts.map(d => (
                          <option key={d.code} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ghi chú kỷ niệm</label>
                  <textarea value={locationForm.note} onChange={e => setLocationForm({...locationForm, note: e.target.value})} className="mt-1 w-full p-2 border rounded-lg focus:ring-violet-300 focus:border-violet-300" rows="2" required placeholder="VD: Nơi lưu giữ nụ hôn đầu tiên..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh (Có thể chọn nhiều)</label>
                  <ImageUpload 
                    multiple
                    images={locationForm.images}
                    onChange={handleLocationImagesChange}
                    onRemove={removeLocationImage}
                    label="Tải ảnh lên"
                  />
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="submit" className="flex-1 bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 font-medium shadow-md shadow-violet-200">
                    {locationForm.id ? 'Lưu thay đổi' : 'Thêm Địa Điểm'}
                  </button>
                  {locationForm.id && (
                    <button type="button" onClick={() => {
                      setLocationForm({ id: null, name: '', lat: 10.8231, lng: 106.6297, note: '', images: [], imageFiles: [] });
                      setSelectedProv("");
                      setSelectedDist("");
                    }} className="bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200">
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Danh sách Địa điểm</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {locations.map(loc => {
                  const coverImage = loc.images && loc.images.length > 0 ? loc.images[0] : '';
                  return (
                    <div key={loc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {coverImage && <img src={coverImage} className="w-12 h-12 rounded object-cover shadow-sm" alt="" />}
                        <div>
                          <p className="font-bold text-sm text-gray-800 line-clamp-1">{loc.name}</p>
                          <p className="text-xs text-gray-500">{loc.images?.length || 0} ảnh</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleEditLocation(loc)} className="p-2 text-violet-500 hover:bg-violet-100 rounded-full transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;
