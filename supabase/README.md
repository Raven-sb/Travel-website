# Vietnam4trip — Supabase Realtime (khách ↔ admin)

Website tĩnh + Supabase làm backend: đơn đặt tour, nội dung tour, tài khoản admin
và tin nhắn chat đều nằm trên Supabase. Khách và admin thấy thay đổi **ngay lập tức**
nhờ Supabase Realtime.

## 1. Tạo project (nếu chưa có)

https://supabase.com → **New project** → region **Southeast Asia (Singapore)**.

## 2. Chạy schema

**SQL Editor → New query** → dán toàn bộ `supabase/schema.sql` → **Run**.

File này tạo: `tours`, `tour_overrides`, `tour_content`, `bookings`, `admins`,
`messages`; bật RLS + Realtime; tạo các hàm `create_booking`, `grant_admin`,
`mark_thread_read`, `mark_customer_read`. Chạy lại nhiều lần cũng được.

## 3. Bật đăng nhập ẩn danh (bắt buộc để chat)

**Authentication → Providers → Allow anonymous sign-ins → Bật → Save.**

Khách không cần tạo tài khoản: khi mở khung chat, website tự tạo một phiên ẩn danh.
Mỗi khách chỉ đọc được tin nhắn của chính mình (RLS), admin đọc được tất cả.

## 4. Tạo tài khoản admin đầu tiên

1. **Authentication → Users → Add user** → email + mật khẩu → bật **Auto Confirm User**.
2. **SQL Editor** → chạy (thay email của bạn):

```sql
insert into public.admins (user_id, email, display_name)
select id, email, 'Chủ Vietnam4trip'
from auth.users
where email = 'email-cua-ban@example.com';
```

3. Mở `admin.html`, đăng nhập bằng email + mật khẩu đó.
4. Thêm nhân viên: tạo user ở bước 1, rồi vào **Tài khoản → Thêm tài khoản** trong admin.

## 5. Điền khóa kết nối

**Project Settings → API** → copy **Project URL** và **anon public key**, điền vào
`js/supabase-config.js`:

```js
window.V4T_SUPABASE = {
  url: "https://xxxxx.supabase.co",
  anonKey: "eyJhbGciOi..."
};
```

⚠️ Chỉ dùng **anon public key**. Không bao giờ put `service_role key` vào file này.
Dữ liệu được bảo vệ bởi RLS, anon key an toàn khi nằm trong trang public.

## 6. Chạy thử

Mở `index.html` (hoặc chạy `start.cmd` → http://localhost:8088) rồi kiểm tra:

| Hành động | Kết quả mong đợi |
|---|---|
| Đặt một tour | Đơn xuất hiện ngay trong `admin.html → Đơn đăng ký` (không cần reload) |
| Khách bấm nút chat, gửi tin | Tin xuất hiện ngay trong `admin.html → Tin nhắn`, có badge chưa đọc |
| Admin trả lời | Khách thấy câu trả lời ngay (Realtime; có polling dự phòng 8s) |
| Admin đổi giá / ẩn tour | Khách đang mở trang thấy thay đổi ngay |
| Admin → Tour → Nội dung | Sửa tiêu đề, ảnh, lịch trình (JSON) → khách thấy ngay |

Nếu chat báo lỗi "Không mở được phiên trò chuyện", kiểm tra lại bước 3.

## 7. Đưa lên GitHub Pages

1. Push code lên GitHub (remote đã trỏ tới `Raven-sb/Travel-website`).
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → `main` / `(root)`.
3. Website: `https://raven-sb.github.io/Travel-website/`.
4. Nhớ rằng `js/supabase-config.js` phải đã điền khóa trước khi deploy.

## 8. Lưu ý bảo mật & chi phí

- Gói free Supabase **tự tạm dừng sau ~7 ngày không truy cập** → vào dashboard bấm Restore.
- Khách có thể spam đơn/chat: cân nhắc thêm CAPTCHA hoặc giới hạn sau này.
- Thông tin thẻ tín dụng trong form chỉ để giao diện, **không gửi/lưu**. Chưa có cổng thanh toán thật.
- Sao lưu định kỳ: Table Editor → `bookings` / `messages` → Export CSV.
- Muốn quay lại backend Node: xóa trống 2 chuỗi trong `js/supabase-config.js`
  (cần cài Node ≥ 22.5 và chạy `start.cmd`).
