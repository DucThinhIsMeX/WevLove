import { supabase } from '../lib/supabase';

export const PROVINCES = [
  { name: 'An Giang', lat: 10.5, lng: 105.1667 },
  { name: 'Bà Rịa - Vũng Tàu', lat: 10.5, lng: 107.1667 },
  { name: 'Bạc Liêu', lat: 9.2941, lng: 105.7272 },
  { name: 'Bắc Giang', lat: 21.2731, lng: 106.1946 },
  { name: 'Bắc Kạn', lat: 22.147, lng: 105.8348 },
  { name: 'Bắc Ninh', lat: 21.1861, lng: 106.0763 },
  { name: 'Bến Tre', lat: 10.244, lng: 106.3753 },
  { name: 'Bình Dương', lat: 11.1667, lng: 106.6667 },
  { name: 'Bình Định', lat: 13.7505, lng: 109.2198 },
  { name: 'Bình Phước', lat: 11.75, lng: 106.9167 },
  { name: 'Bình Thuận', lat: 10.9333, lng: 108.1 },
  { name: 'Cà Mau', lat: 9.1769, lng: 105.15 },
  { name: 'Cao Bằng', lat: 22.6667, lng: 106.25 },
  { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469 },
  { name: 'Đà Nẵng', lat: 16.0471, lng: 108.2062 },
  { name: 'Đắk Lắk', lat: 12.8333, lng: 108.0 },
  { name: 'Đắk Nông', lat: 12.2167, lng: 107.6667 },
  { name: 'Điện Biên', lat: 21.385, lng: 103.015 },
  { name: 'Đồng Nai', lat: 10.9333, lng: 106.8167 },
  { name: 'Đồng Tháp', lat: 10.45, lng: 105.6333 },
  { name: 'Gia Lai', lat: 13.9833, lng: 108.0 },
  { name: 'Hà Giang', lat: 22.8167, lng: 104.9833 },
  { name: 'Hà Nam', lat: 20.5333, lng: 105.95 },
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  { name: 'Hà Tĩnh', lat: 18.3333, lng: 105.9 },
  { name: 'Hải Dương', lat: 20.9333, lng: 106.3167 },
  { name: 'Hải Phòng', lat: 20.8449, lng: 106.6881 },
  { name: 'Hậu Giang', lat: 9.8, lng: 105.6167 },
  { name: 'Hòa Bình', lat: 20.8167, lng: 105.3333 },
  { name: 'Hưng Yên', lat: 20.8333, lng: 106.05 },
  { name: 'Khánh Hòa', lat: 12.2388, lng: 109.1967 },
  { name: 'Kiên Giang', lat: 10.0, lng: 105.0 },
  { name: 'Kon Tum', lat: 14.35, lng: 108.0 },
  { name: 'Lai Châu', lat: 22.3833, lng: 103.25 },
  { name: 'Lạng Sơn', lat: 21.8333, lng: 106.75 },
  { name: 'Lào Cai', lat: 22.3333, lng: 103.8333 },
  { name: 'Lâm Đồng', lat: 11.9404, lng: 108.4583 },
  { name: 'Long An', lat: 10.6667, lng: 106.1667 },
  { name: 'Nam Định', lat: 20.4333, lng: 106.1667 },
  { name: 'Nghệ An', lat: 19.3333, lng: 104.8333 },
  { name: 'Ninh Bình', lat: 20.2539, lng: 105.975 },
  { name: 'Ninh Thuận', lat: 11.5833, lng: 108.9833 },
  { name: 'Phú Thọ', lat: 21.3333, lng: 105.25 },
  { name: 'Phú Yên', lat: 13.0833, lng: 109.3167 },
  { name: 'Quảng Bình', lat: 17.5, lng: 106.25 },
  { name: 'Quảng Nam', lat: 15.5833, lng: 108.0 },
  { name: 'Quảng Ngãi', lat: 15.1167, lng: 108.8 },
  { name: 'Quảng Ninh', lat: 21.0, lng: 107.3333 },
  { name: 'Quảng Trị', lat: 16.75, lng: 107.0 },
  { name: 'Sóc Trăng', lat: 9.6, lng: 105.9833 },
  { name: 'Sơn La', lat: 21.3333, lng: 103.9 },
  { name: 'Tây Ninh', lat: 11.3667, lng: 106.1 },
  { name: 'Thái Bình', lat: 20.45, lng: 106.3333 },
  { name: 'Thái Nguyên', lat: 21.6, lng: 105.8333 },
  { name: 'Thanh Hóa', lat: 20.0833, lng: 105.3 },
  { name: 'Thừa Thiên Huế', lat: 16.4637, lng: 107.5909 },
  { name: 'Tiền Giang', lat: 10.4167, lng: 106.25 },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297 },
  { name: 'Trà Vinh', lat: 9.8, lng: 106.2833 },
  { name: 'Tuyên Quang', lat: 22.1167, lng: 105.25 },
  { name: 'Vĩnh Long', lat: 10.25, lng: 105.9667 },
  { name: 'Vĩnh Phúc', lat: 21.3167, lng: 105.6 },
  { name: 'Yên Bái', lat: 21.7167, lng: 104.5333 },
];

export const initData = () => {
  // No longer needed for Supabase. Data is in cloud.
};

// ---- MEMORIES API ----
export const getMemories = async () => {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('date', { ascending: true });
    
  if (error) {
    console.error('Error fetching memories:', error);
    return [];
  }
  return data;
};

export const addMemory = async (memory) => {
  const { title, date, description, icon, imageUrl } = memory;
  const { data, error } = await supabase
    .from('memories')
    .insert([{ title, date, description, icon, imageUrl }])
    .select();
    
  if (error) throw error;
  return data[0];
};

export const updateMemory = async (memory) => {
  const { id, title, date, description, icon, imageUrl } = memory;
  const { data, error } = await supabase
    .from('memories')
    .update({ title, date, description, icon, imageUrl })
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
};

export const deleteMemory = async (id) => {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

// ---- LOCATIONS API ----
export const getLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
  return data;
};

export const addLocation = async (location) => {
  const { name, lat, lng, note, images } = location;
  const { data, error } = await supabase
    .from('locations')
    .insert([{ name, lat, lng, note, images }])
    .select();
    
  if (error) throw error;
  return data[0];
};

export const updateLocation = async (location) => {
  const { id, name, lat, lng, note, images } = location;
  const { data, error } = await supabase
    .from('locations')
    .update({ name, lat, lng, note, images })
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
};

export const deleteLocation = async (id) => {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

// ---- STORAGE API ----
export const uploadImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('weblove')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('weblove')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
