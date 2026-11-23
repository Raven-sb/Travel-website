/*
  Supabase config — điền 2 giá trị dưới đây sau khi tạo project Supabase.
  Lấy ở: Supabase Dashboard → Project Settings → API
    - url     = Project URL           (https://xxxxx.supabase.co)
    - anonKey = anon public key       (chuỗi eyJ... rất dài)

  Để trống cả hai (như hiện tại) = chạy bằng Node.js backend cục bộ.
  Xem hướng dẫn đầy đủ tại supabase/README.md
*/
window.V4T_SUPABASE = {
  url: "https://qyoffpzcurecgnmgdzqn.supabase.co",
  anonKey: "sb_publishable_eAY5FAXGy4pbYW3NuKf_Pg_RFoohpa2"
};

// Thông tin nhận tiền khi khách chọn "Chuyển khoản".
// TODO: thay bằng tài khoản thật của bạn trước khi đưa web vào production.
window.V4T_BANK = {
  bankName: "Ngân hàng Vietcombank",
  accountNumber: "0000000000",
  accountHolder: "CONG TY TNHH VIETNAM4TRIP",
  branch: "Chi nhánh TP. Hồ Chí Minh",
  note: "Vui lòng chuyển khoản trong vòng 24h và giữ lại biên lai. Booking sẽ được xác nhận sau khi chúng tôi nhận được tiền.",
  noteEn: "Please transfer within 24 hours and keep the receipt. Your booking will be confirmed once payment is received."
};
