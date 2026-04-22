import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMemories, getLocations, addMemory, updateMemory, deleteMemory, addLocation, updateLocation, deleteLocation, uploadImage } from '../data/mockData';
import { Home, Edit2, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Admin = () => {
  const [memories, setMemories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });

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
  const handleMemoryImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { url, file: resizedFile } = await resizeImage(file);
      setMemoryForm({ ...memoryForm, imageUrl: url, imageFile: resizedFile });
    }
  };

  const submitMemory = async () => {
    setLoading(true);
    try {
      let finalImageUrl = memoryForm.imageUrl;
      if (memoryForm.imageFile) {
        finalImageUrl = await uploadImage(memoryForm.imageFile);
      }
      const payload = { ...memoryForm, imageUrl: finalImageUrl };
      delete payload.imageFile;

      if (memoryForm.id) {
        await updateMemory(payload);
        showToast('Cập nhật kỷ niệm thành công!');
      } else {
        await addMemory(payload);
        showToast('Thêm kỷ niệm thành công!');
      }
      
      await loadData();
      setMemoryForm({ id: null, title: '', date: '', description: '', icon: 'Heart', imageUrl: '', imageFile: null });
    } catch (error) {
      showToast('Có lỗi xảy ra: ' + error.message, 'error');
    } finally {
      setLoading(false);
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
    showConfirm('Bạn có chắc chắn muốn XÓA kỷ niệm này không? Việc này không thể hoàn tác.', async () => {
      setLoading(true);
      try {
        await deleteMemory(id);
        await loadData();
        showToast('Đã xóa kỷ niệm', 'success');
      } catch (err) {
        showToast('Lỗi khi xóa: ' + err.message, 'error');
      }
      setLoading(false);
    });
  };

  // ---- LOCATION HANDLERS ----
  const handleMultipleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const processedFiles = await Promise.all(files.map(f => resizeImage(f)));
    setLocationForm(prev => ({
      ...prev,
      images: [...prev.images, ...processedFiles.map(pf => pf.url)],
      imageFiles: [...(prev.imageFiles || []), ...processedFiles.map(pf => pf.file)]
    }));
  };

  const removeLocationImage = (indexToRemove) => {
    setLocationForm(prev => {
      return {
        ...prev,
        images: prev.images.filter((_, idx) => idx !== indexToRemove),
        imageFiles: prev.imageFiles || []
      };
    });
  };

  const submitLocation = async () => {
    setLoading(true);
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
        showToast('Cập nhật địa điểm thành công!');
      } else {
        await addLocation(payload);
        showToast('Thêm địa điểm thành công!');
      }
      
      await loadData();
      setLocationForm({ id: null, name: '', lat: 10.8231, lng: 106.6297, note: '', images: [], imageFiles: [] });
      setSelectedProv("");
      setSelectedDist("");
    } catch (error) {
      showToast('Có lỗi xảy ra: ' + error.message, 'error');
    } finally {
      setLoading(false);
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
    showConfirm('Bạn có chắc chắn muốn XÓA địa điểm này không?', async () => {
      setLoading(true);
      try {
        await deleteLocation(id);
        await loadData();
        showToast('Đã xóa địa điểm', 'success');
      } catch(err) {
        showToast('Lỗi khi xóa: ' + err.message, 'error');
      }
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl font-medium ${toast.type === 'success' ? 'bg-white text-emerald-600 border-l-4 border-emerald-500' : 'bg-white text-rose-600 border-l-4 border-rose-500'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
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
            className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 text-rose-500 mb-4">
                <div className="bg-rose-100 p-3 rounded-full"><AlertCircle className="w-6 h-6" /></div>
                <h3 className="text-xl font-bold text-gray-900">Xác nhận</h3>
              </div>
              <p className="text-gray-600 mb-8">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })} 
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog({ show: false, message: '', onConfirm: null });
                  }} 
                  className="flex-1 px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 rounded-lg font-medium transition-colors shadow-lg shadow-rose-200"
                >
                  Đồng ý
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <div className="text-rose-500 font-bold text-xl flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            Đang xử lý dữ liệu...
          </div>
        </div>
      )}

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
                  <label className="block text-sm font-medium text-gray-700">Upload Ảnh mới (bỏ qua nếu giữ ảnh cũ)</label>
                  <input type="file" accept="image/*" onChange={handleMemoryImageSelect} className="mt-1 w-full" required={!memoryForm.imageUrl} />
                  {memoryForm.imageUrl && <img src={memoryForm.imageUrl} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg" />}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên địa điểm (Hiển thị)</label>
                  <input 
                    type="text" 
                    placeholder="VD: Quán Cafe X, Biển Nha Trang..."
                    value={locationForm.name} 
                    onChange={e => setLocationForm({...locationForm, name: e.target.value})} 
                    className="mt-1 w-full p-2 border rounded-lg focus:ring-violet-300 focus:border-violet-300" 
                    required 
                  />
                </div>

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
                  <label className="block text-sm font-medium text-gray-700">Thêm Hình ảnh (Có thể chọn nhiều)</label>
                  <input type="file" accept="image/*" multiple onChange={handleMultipleImageSelect} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 transition-colors" />
                  
                  {/* Gallery Preview */}
                  {locationForm.images && locationForm.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {locationForm.images.map((imgSrc, idx) => (
                        <div key={idx} className="relative group aspect-square">
                          <img src={imgSrc} alt="preview" className="w-full h-full object-cover rounded-xl shadow-sm" />
                          <button 
                            type="button" 
                            onClick={() => removeLocationImage(idx)}
                            className="absolute -top-2 -right-2 bg-white text-rose-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-all hover:bg-rose-50 hover:scale-110"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
