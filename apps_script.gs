/**
 * Google Apps Script — Phiếu chia sẻ khi có ý định xin nghỉ (30Shine, 2026)
 * ---------------------------------------------------------------------------
 * CÁCH CÀI (làm 1 lần, khoảng 5 phút):
 *   1. Tạo Google Sheet mới: "Phieu Nguyen Vong Xin Nghi - Responses 2026"
 *   2. Trong sheet: Tiện ích (Extensions) → Apps Script → xóa code mặc định
 *      → dán toàn bộ file này → Ctrl+S, đặt tên project "Phieu Nguyen Vong Receiver"
 *   3. Chọn hàm `setupSheet` → Chạy (Run) → cấp quyền (Nâng cao → Đi tới dự án → Cho phép)
 *      → tab "Responses" được tạo với dòng tiêu đề
 *   4. Triển khai (Deploy) → Tùy chọn triển khai mới → Ứng dụng web
 *      - Thực thi với tư cách: Tôi
 *      - Ai có quyền truy cập: Bất kỳ ai
 *      → Triển khai → copy "URL ứng dụng web" (dạng https://script.google.com/macros/s/.../exec)
 *   5. Mở deploy/index.html → dán URL vào dòng `const GOOGLE_SCRIPT_URL = '';` → push lên GitHub
 *
 * KHI SỬA FILE NÀY: phải "Tùy chọn triển khai mới" lại và dán URL mới vào index.html.
 * Script là bound script (gắn với sheet) nên dùng getActiveSpreadsheet(), không cần SHEET_ID.
 */

const SHEET_NAME = 'Responses';

// Thứ tự cột trong sheet. Tên khớp với key trong collectFormData() của index.html.
const HEADERS = [
  'submission_id', 'timestamp', 'ngay_gui', 'prefill',
  // Thông tin
  'A0_ho_ten', 'A1_ma_nv', 'A2_salon', 'A3_vi_tri',
  // Câu 1–8
  'Q1_ly_do', 'Q1_khac',
  'Q2_ke_them',
  'Q3_dieu_giu_lai',
  'Q4_kha_nang_o_lai',
  'Q5_diem_den',
  'Q6_thu_nhap_cam_nhan',
  'Q7a_sm_hoi_tham', 'Q7b_sm_giai_thich', 'Q7c_xep_ca_cong_bang', 'Q7_ke_them',
  'Q8_nen_giu', 'Q8_nen_doi',
  // Câu 9–14
  'Q9_ngay_thong_bao',
  'Q10_ngay_lam_cuoi',
  'Q11_quay_lai', 'Q11_dieu_kien',
  'Q12_gioi_thieu',
  'Q13_goi_rieng',
  'Q14_lien_he_sau', 'Q14_zalo',
  // Cột tính sẵn cho dashboard
  'so_ngay_bao_truoc',   // = Q10 − Q9 (ngày). Trống nếu thiếu 1 trong 2
  'cach_nghi',           // Nghỉ ngang (≤0) · Báo gấp (1–6) · Đúng quy định (≥7)
  'user_agent'
];

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() > 0) {
    throw new Error('Tab "' + SHEET_NAME + '" đã có dữ liệu. Xóa hết dữ liệu (kể cả dòng 1) rồi chạy lại nếu muốn tạo lại tiêu đề.');
  }
  sheet.appendRow(HEADERS);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold').setBackground('#133880').setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) { setupSheet(); sheet = ss.getSheetByName(SHEET_NAME); }

    const derived = tinhCachNghi_(data.Q9_ngay_thong_bao, data.Q10_ngay_lam_cuoi);
    const row = HEADERS.map(function (h) {
      if (h === 'submission_id') return Utilities.getUuid();
      if (h === 'timestamp') return data.timestamp || new Date().toISOString();
      if (h === 'so_ngay_bao_truoc') return derived.soNgay;
      if (h === 'cach_nghi') return derived.cachNghi;
      const v = data[h];
      return (v === undefined || v === null) ? '' : v;
    });
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Mở URL bằng trình duyệt để kiểm tra script còn sống
function doGet() {
  return ContentService.createTextOutput('Phieu Nguyen Vong Receiver: OK');
}

// Số ngày báo trước = ngày làm cuối − ngày thông báo. Quy ước theo từ điển chỉ số F3.
function tinhCachNghi_(ngayThongBao, ngayLamCuoi) {
  if (!ngayThongBao || !ngayLamCuoi) return { soNgay: '', cachNghi: '' };
  const a = new Date(ngayThongBao), b = new Date(ngayLamCuoi);
  if (isNaN(a) || isNaN(b)) return { soNgay: '', cachNghi: '' };
  const days = Math.round((b - a) / 86400000);
  const cach = days <= 0 ? 'Nghỉ ngang' : (days <= 6 ? 'Báo gấp' : 'Đúng quy định');
  return { soNgay: days, cachNghi: cach };
}

// Chạy hàm này trong editor để gửi 1 dòng thử, không cần deploy
function testPost() {
  const sample = {
    timestamp: new Date().toISOString(), ngay_gui: '30/09/2026', prefill: 'test',
    A0_ho_ten: 'TEST Nguyễn Văn A', A1_ma_nv: '30S00000', A2_salon: '10 TP', A3_vi_tri: 'Stylist',
    Q1_ly_do: 'Thu nhập không như mình mong; Ca làm, giờ giấc, ngày nghỉ khó sắp xếp', Q1_khac: '',
    Q2_ke_them: 'Từ tháng 7 khách bị chia sang bạn mới', Q3_dieu_giu_lai: 'Xếp ca cố định thứ Bảy',
    Q4_kha_nang_o_lai: 'Có thể, còn tùy cách giải quyết', Q5_diem_den: 'Sang một salon hoặc tiệm khác',
    Q6_thu_nhap_cam_nhan: 'Thấp hơn một chút',
    Q7a_sm_hoi_tham: 'Lúc có lúc không', Q7b_sm_giai_thich: 'Không', Q7c_xep_ca_cong_bang: 'Có', Q7_ke_them: '',
    Q8_nen_giu: 'Đào tạo', Q8_nen_doi: 'Cách chia khách',
    Q9_ngay_thong_bao: '2026-09-25', Q10_ngay_lam_cuoi: '2026-10-05',
    Q11_quay_lai: 'Có, nếu...', Q11_dieu_kien: 'Về salon gần nhà', Q12_gioi_thieu: 'Tùy chỗ, tùy người',
    Q13_goi_rieng: 'Không', Q14_lien_he_sau: 'Được', Q14_zalo: '0900000000', user_agent: 'test'
  };
  const res = doPost({ postData: { contents: JSON.stringify(sample) } });
  Logger.log(res.getContent());
}
