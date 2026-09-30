# Phiếu chia sẻ khi có ý định xin nghỉ — 30Shine 2026

Form một trang cho nhân sự salon điền trên điện thoại ngay khi trao đổi ý định nghỉ với quản lý. 14 câu, khoảng 4 phút. Nội dung câu hỏi và cách dùng dữ liệu: xem `05_Phieu_NguyenVong_KhiXinNghi_v2_20260930.md` trong thư mục `HCNS/Dasboard Nhan su`.

## Cấu trúc

- `index.html` — form duy nhất (HTML, CSS, JS trong một file)
- `apps_script.gs` — backend Google Apps Script, ghi vào tab `Responses` của Google Sheet
- `logo-30shine-xanh.png` — logo
- `.github/workflows/deploy.yml` — tự deploy lên GitHub Pages khi push nhánh `main`

## Điền sẵn từ đường link

Gửi link kèm tham số để hệ thống (Lark) điền sẵn thông tin, người điền chỉ kiểm tra:

```
https://<user>.github.io/<repo>/?ma=30S12345&ten=Nguyen%20Van%20A&salon=10%20TP&vitri=Stylist
```

Giá trị `vitri` là một trong: `Stylist`, `Skinner`, `Supporter`, `Quản lý salon`, `Khác`. Cột `prefill` trong sheet ghi `url` nếu link có tham số, `manual` nếu tự điền.

## Cột tính sẵn trong sheet

- `so_ngay_bao_truoc` = ngày làm cuối (câu 10) − ngày thông báo (câu 9)
- `cach_nghi`: Nghỉ ngang (≤0) · Báo gấp (1–6) · Đúng quy định (≥7) · Chưa nói với quản lý

## Triển khai và sửa đổi

Xem `../HUONG_DAN.md`.
