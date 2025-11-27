# KickOff Hub – Frontend

Giao diện người dùng cho đồ án **KickOff Hub**, một nền tảng phân tích bóng đá giúp xem dữ liệu giải đấu/cầu thủ, chia sẻ bài viết và tương tác với cộng đồng. Dự án xây dựng trên React 19 + Vite, sử dụng Zustand cho state và Tailwind CSS để thiết kế hệ thống UI nhất quán.

## Tính năng chính

- **Trang dữ liệu**: tổng quan quốc gia, giải đấu, đội bóng, cầu thủ cùng điều hướng rõ ràng.
- **Diễn đàn**: xem bài viết, like, báo cáo, bình luận; người dùng đăng nhập có thể tạo bài mới với tag và trạng thái draft/public.
- **Xác thực**: đăng nhập/đăng ký với JWT, lưu phiên bằng Zustand persist và axios interceptor.
- **Giao diện hiện đại**: thiết kế responsive, sidebar/hồ sơ người dùng, skeleton states và lời nhắc chi tiết.

## Công nghệ

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (Rolldown build)
- [React Router v7](https://reactrouter.com/) cho routing đa layout
- [Zustand](https://github.com/pmndrs/zustand) quản lý trạng thái auth
- [Axios](https://axios-http.com/) + interceptor để đính kèm Bearer token
- [Tailwind CSS](https://tailwindcss.com/) và motion effects với [Framer Motion](https://www.framer.com/motion/)

## Cấu trúc thư mục

```
src/
├── components/        # Layouts, navbar, sidebar, footer
├── pages/             # Screen-level components (Home, Forum, PostCreate, ...)
├── routes/            # AppRoutes, ProtectedRoute, path constants
├── store/             # Zustand stores (auth)
├── utils/             # apiClient, helper functions
└── index.css          # Tailwind directives + global styles
```

## Chuẩn bị môi trường

1. **Yêu cầu**: Node.js 18+, npm 9+.
2. **Biến môi trường** (tùy chọn):
	- `VITE_API_BASE_URL`: URL backend (mặc định proxy `/api` đến `http://localhost:3000`).
3. **Cài đặt phụ thuộc**:

```powershell
npm install
```

## Scripts

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Chạy Vite dev server tại `http://localhost:5173` (đã cấu hình proxy `/api`). |
| `npm run build` | Build production vào thư mục `dist/`. |
| `npm run preview` | Xem thử build sản phẩm. |
| `npm run lint` | Kiểm tra ESLint theo cấu hình dự án. |

## Luồng phát triển đề xuất

1. Start backend (`kickOffHub_api`) bằng `npm run dev` để API hoạt động.
2. Start frontend với `npm run dev`.
3. Đăng nhập/đăng ký → truy cập forum → tạo bài viết mới → kiểm tra luồng API.
4. Khi hoàn tất tính năng, chạy `npm run build` để đảm bảo không lỗi compile.

## Tài liệu và API

- Backend Swagger: [https://kickoffhub-api.onrender.com/api/docs/](https://kickoffhub-api.onrender.com/api/docs/)
- Mỗi trang frontend mapping tới endpoint cụ thể (Forum ↔ `/api/posts`, Players ↔ `/api/players`, ...). Tham khảo mã nguồn tại `src/pages/*` để hiểu payloads chi tiết.

## Đóng góp / mở rộng

- Sử dụng `src/services` (nếu bổ sung) để gom logic gọi API.
- Giữ component thuần trình bày; đẩy xử lý dữ liệu sang hooks/custom services.
- Khi thêm page mới, đăng ký route tại `src/routes/AppRoutes.jsx` và thêm path trong `src/routes/paths.js`.

Chúc bạn học tốt và trình bày đồ án suôn sẻ! Nếu cần hướng dẫn chi tiết hơn về luồng dữ liệu hoặc kiến trúc, hãy xem phần tài liệu nội bộ trong repo backend và ghi chú đã chuẩn bị.
