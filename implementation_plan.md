# WebLove - Quà Tặng Người Yêu (The Love Timeline & Memory Map)

Dự án này là một trang web kỷ niệm tình yêu được thiết kế với giao diện chuẩn chỉnh, thẩm mỹ cao, và hiệu ứng mượt mà. 

## User Review Required

> [!IMPORTANT]
> **Supabase Setup**: Để trang web có backend chuẩn chỉnh như bạn đề xuất, bạn cần tạo một project trên [Supabase](https://supabase.com/).
> Sau đó cung cấp cho mình **Project URL** và **API Key (anon/public)**. 
> Trong quá trình chờ bạn thiết lập Supabase, mình có thể code trước giao diện (UI) sử dụng **Mock Data** để bạn xem trước nghiệm thu, sau đó sẽ kết nối với Supabase sau. Bạn đồng ý với phương án dùng Mock Data trước chứ?

> [!IMPORTANT]
> **Tạo Project**: Mình sẽ chạy lệnh `npx -y create-vite@latest my-love-site --template react` trong thư mục hiện tại để khởi tạo source code. Bạn có muốn đổi tên thư mục `my-love-site` thành tên khác không? (Nếu không, mình sẽ tiến hành tạo dự án với tên này hoặc tạo trực tiếp trong thư mục `WevLove`).

## Phân Tích Công Nghệ (Tech Stack)

- **Frontend**: React (Vite) + Tailwind CSS
- **Animation**: Framer Motion (hiệu ứng cuộn, typewriter)
- **Bản Đồ**: `leaflet` + `react-leaflet` (dùng bản đồ OpenStreetMap miễn phí)
- **Icon**: `lucide-react` (bộ icon đẹp, nhẹ)
- **Database / Backend**: Supabase (PostgreSQL) + Supabase Storage cho hình ảnh.
- **Routing**: `react-router-dom` (nếu cần chia trang) hoặc cuộn mượt (smooth scroll) trên single-page.

## Proposed Changes

### 1. Khởi tạo Dự Án (Initialization)
- Chạy `npx create-vite` để setup React template.
- Cài đặt Tailwind CSS (`tailwindcss`, `postcss`, `autoprefixer`).
- Cài đặt các thư viện: `framer-motion`, `react-leaflet`, `leaflet`, `lucide-react`, `@supabase/supabase-js`, `clsx`, `tailwind-merge` (để code UI chuẩn chỉnh).

### 2. Xây dựng Giao diện (UI/UX)
- **Màu sắc (Theme)**: Pastel nhạt (Trắng kem, Hồng nhạt) kết hợp nhấn Rose Gold. Hỗ trợ Dark Mode.
- **Hero Section**: Câu quote tình cảm, tên 2 bạn với hiệu ứng gõ chữ (Typewriter effect) từ Framer Motion.
- **The Love Timeline**: 
  - Giao diện trục dọc.
  - Sử dụng Framer Motion và Intersection Observer để tạo hiệu ứng "bay" vào mượt mà khi cuộn tới.
- **Our Memory Map**:
  - Dùng `react-leaflet` hiển thị bản đồ.
  - Custom icon marker (Trái tim đỏ).
  - Popup hiển thị ảnh và dòng chữ kỷ niệm.

### 3. Tích hợp Supabase (Backend)
- Xây dựng file `src/lib/supabase.js` để kết nối client.
- Tạo các hàm gọi API (fetchMemories, fetchLocations).
- (Tạm thời sẽ dùng Mock Data để dựng UI trước nếu chưa có thông tin Supabase).

## Verification Plan

### Automated/Manual Testing
- Khởi chạy dev server (`npm run dev`) để kiểm tra trực quan giao diện.
- Kiểm tra tính responsive trên thiết bị di động (vì người yêu có khả năng xem trên điện thoại).
- Kiểm tra các hiệu ứng animation có chạy mượt mà không bị giật lag không.
- Test tương tác với Bản đồ (zoom, pan, click marker).
