# VNT - Hệ thống Đánh giá Trực tuyến (Frontend)
## Tổng Quan Dự Án (Project Overview)

Đây là tài liệu tổng hợp và đánh giá dự án frontend `vnt-fe`, một ứng dụng thi trắc nghiệm và đánh giá trực tuyến dành cho học sinh/sinh viên.

### 1. Kiến trúc và Công nghệ (Tech Stack & Architecture)
Dự án được xây dựng trên hệ sinh thái React hiện đại nhất, theo cấu trúc thư mục rõ ràng và có tính mở rộng cao:
- **Core Framework:** **Next.js 16** (sử dụng App Router) kết hợp cùng **React 19**.
- **Ngôn ngữ:** TypeScript, đảm bảo type-safety cho toàn bộ ứng dụng thông qua các interface và Zod schemas.
- **Quản lý State:** 
  - *Client State:* **Zustand** (hiện tại chủ yếu dùng cho `auth.store.ts` để lưu trữ user và trạng thái đăng nhập).
  - *Server State:* **TanStack React Query v5** giúp quản lý caching, fetching, và đồng bộ dữ liệu từ API hiệu quả.
- **UI/UX:**
  - Styling: **Tailwind CSS v4** kết hợp với `clsx` và `tailwind-merge` để xử lý class linh hoạt.
  - Component Library: **shadcn/ui** (dựa trên Radix UI primitives) mang lại giao diện nhất quán, dễ tùy biến.
  - Animation: **Framer Motion** (dùng nhiều trong các form chuyển đổi ở trang đăng nhập/đăng ký).
  - Data Visualization: **Recharts** được dùng trong các Dashboard để vẽ biểu đồ (Donut Chart, Radar Chart, Bar Chart).
- **Form & Validation:** **React Hook Form** + **Zod** schema validation.
- **Networking:** **Axios** instance được cấu hình sẵn với Request/Response Interceptors (tự động xử lý redirect về `/` khi dính lỗi 401 Unauthorized).

### 2. Cấu Trúc Thư Mục (Folder Structure)
Cấu trúc thư mục tuân theo mô hình Feature-based kết hợp với Next.js App Router:
- `src/app/`: Định nghĩa các routes chính.
  - `(public)/`: Các trang không bắt buộc đăng nhập (Login/Register/Forgot Password). Form chuyển đổi mượt mà bằng Framer Motion.
  - `(protected)/`: Nhóm các trang yêu cầu đăng nhập như `dashboard`, `exam`, `exams`, `reports`, `result`, `settings`, `student`. Layout của nhóm này sẽ kiểm tra quyền qua `useAuth`, hiển thị `Loading` khi fetch user, redirect nếu chưa đăng nhập.
- `src/components/`: Component dùng chung.
  - `common/`: Navigation, Loading, ConfirmDialog, RoleGuard (bảo vệ UI theo quyền).
  - `dashboard/`: Component chuyên cho giao diện Admin/Student Dashboard.
  - `ui/`: Các thành phần nguyên thủy từ shadcn/ui.
  - `exam/`: Các component hỗ trợ trang làm bài thi (OptionList, Nút điều hướng, Header).
- `src/features/`: Đóng gói logic theo từng miền chức năng (VD: `auth`, `exam`). Chứa `*.service.ts` để gọi API và các form component riêng.
- `src/hooks/`: Custom hooks như `useAuth`, `useAuthorization` xử lý phân quyền.
- `src/stores/`: Zustand stores.
- `src/types/`: TypeScript interfaces/types (`user.ts`, `exam.ts`, `dashboard.ts`).
- `src/lib/`: Setup các thư viện (axios instance, auth maps, queryClient).
- `src/data/`: Chứa các dữ liệu giả (mock data) hiện tại đang phục vụ cho UI Dashboard chưa nối API thật.

### 3. Phân Tích Các Tính Năng Chính (Core Features)

#### a. Authentication & Authorization (Xác thực và Phân quyền)
- **Cơ chế Login/Register:** Gọi API `/auth/login` hoặc `/auth/register`. Token được API quản lý qua Cookie (do `axios` không gửi theo headers mặc định, và `refresh` token gọi đến `/auth/refresh`).
- **Dev Mode / Test:** Hook `useAuth.ts` hiện đang có cờ biến `SKIP_API_AUTH_CHECK = true` để bypass việc kiểm tra token qua API trong lúc phát triển giao diện.
- **Phân quyền (RBAC):** `ROLE_PERMISSIONS` phân biệt 3 role chính: `admin`, `student`, và `guest`.
  - Admin: Xem được tất cả thông tin, các bảng điểm, báo cáo, cấu hình.
  - Student: Chỉ truy cập màn hình làm bài, kết quả cá nhân.

#### b. Dashboard
- Trong `(protected)/dashboard/page.tsx`, hệ thống tự động nhận diện role của user để render ra màn `AdminDashboardLayout` hoặc `StudentDashboardLayout`.
- Hiển thị thống kê qua `Recharts`: Radar biểu đồ phân tích năng lực, Donut phân bố kết quả.

#### c. Exam (Làm Bài Thi)
- **Tạo phiên thi:** User bấm "Bắt đầu làm bài" => Gọi `examService.generate` => Lưu `examSession` vào `sessionStorage` => Redirect sang màn `exam/[id]/take`.
- **Màn hình làm bài:** Hoàn toàn quản lý bằng Client State (React hooks). Có chức năng đánh dấu (Flag), điều hướng câu hỏi trước/sau, hiển thị tiến độ (Progress bar).
- **Bộ đếm thời gian:** Sử dụng `setInterval` nội bộ. Hết giờ hoặc nộp bài sẽ tự động xóa `sessionStorage` và gửi kết quả.

### 4. Đánh Giá & Nhận Xét (Review & Best Practices)

**Điểm tốt (Pros):**
1. **Kiến trúc rất Clean và Tách biệt:** Việc sử dụng Feature-based structure giúp code dễ bảo trì hơn, module hoá logic API (services) và UI (components).
2. **Bộ công cụ tối tân:** Sử dụng Next.js 16 App Router, Tailwind 4, Zustand, và React Query v5 đúng chuẩn một ứng dụng Enterprise-grade hiện nay.
3. **Quản lý Form tốt:** Sự kết hợp giữa React Hook Form và Zod ở các form authentication rất bài bản.
4. **Phân quyền gọn gàng:** Sử dụng Higher-Order Component hoặc các hàm điều kiện Role trực quan để render Layout phù hợp trong thư mục `(protected)`.

**Điểm cần cải thiện / Lưu ý (Areas for Improvement):**
1. **Tạm thời lưu Exam Session ở Session Storage:** `sessionStorage.setItem('examSession')`. Nếu user load lại trang hoặc vô tình đóng tab tạm và mở lại khác tab (cùng browser), dữ liệu có thể mất vì SessionStorage chỉ gắn với tab. Cân nhắc đồng bộ trạng thái làm bài lên Backend theo từng thời gian thực (Save Draft) nhằm chống mất dữ liệu thi.
2. **Hardcode URL API:** `process.env.NEXT_PUBLIC_API_URL || 'http://220.231.94.117:8081/api/v1'`. Khi deploy thực tế, bắt buộc phải cung cấp file `.env` thống nhất để tránh trỏ nhầm backend dev/prod.
3. **Cờ `SKIP_API_AUTH_CHECK`:** Đây là cờ dev tạm thời, cần lưu ý xóa bỏ hoàn toàn hoặc quản lý nghiêm ngặt qua biến môi trường để tránh bị tắt nhầm xác thực trên Production.
4. **Mock Data Dashboard:** Dashboard hiện tại đang dùng rất nhiều mock data cứng (`src/data/dashboardMock`). Để biến thành Product hoàn chỉnh, các endpoint cần được nối với backend thông qua React Query.

### Tổng Kết
Dự án được khởi tạo và tổ chức bài bản, cấu trúc chuẩn mực với hệ sinh thái React hiện đại, cho phép scale (mở rộng) dễ dàng sau này. Nền tảng UI và State Management hoạt động trơn tru. Ở những bước tiếp theo, đội dev chỉ cần tập trung đấu nối API thật, bỏ qua cơ chế Bypass Auth và chuyển đổi Mock Data về dạng Live Data.
Kết thúc
