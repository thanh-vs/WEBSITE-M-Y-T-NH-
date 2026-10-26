
# TechCore E-Commerce

Dự án website thương mại điện tử chuyên kinh doanh thiết bị công nghệ, laptop gaming và phụ kiện máy tính.

## Tính năng chính
- Xem danh sách và chi tiết sản phẩm công nghệ
- Giỏ hàng và đặt hàng trực tuyến
- Phân quyền người dùng: Khách hàng, Nhân viên, Quản trị viên (Admin)
- Trang quản trị (Admin Dashboard): Quản lý danh mục, sản phẩm, đơn hàng, khách hàng, mã giảm giá, nhân viên, đề xuất nhập hàng và báo cáo thống kê
- Hỗ trợ tải ảnh sản phẩm trực tiếp từ thiết bị

## Công nghệ sử dụng
- Frontend: React, Tailwind CSS, Lucide Icons
- Backend: Node.js, Express
- Cơ sở dữ liệu: MongoDB

## Hướng dẫn cài đặt & chạy dự án

1. Cài đặt các gói phụ thuộc:
```bash
npm install
```

2. Cấu hình biến môi trường trong file `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/techcore
JWT_SECRET=techcore_secret_key
```

3. Khởi chạy ứng dụng ở chế độ dev:
```bash
npm run dev
```

4. Mở trình duyệt và truy cập: `http://localhost:3000`

