# Dự án MiniERP - Hệ thống Quản lý Bán hàng & Tạp hóa

Chào mừng bạn đến với dự án **MiniERP**. Đây là hệ thống quản lý bán hàng toàn diện với ứng dụng Web cho Quản lý (Dashboard) và Thu ngân (POS).

Dự án bao gồm 2 phần chính:
1. **Backend:** `.NET Core 8 Web API` (Thư mục: `MiniERP.API`)
2. **Frontend:** `Next.js 14` (Thư mục: `mini-erp-frontend`)

---

## 🛠 Yêu cầu hệ thống (Prerequisites)
Trước khi chạy dự án, hãy đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:
- **Node.js** (Khuyến nghị bản v18.x hoặc mới nhất) - [Tải tại đây](https://nodejs.org/)
- **.NET 8.0 SDK** - [Tải tại đây](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server** (Bản Developer hoặc Express)
- **SQL Server Management Studio (SSMS)** hoặc công cụ quản lý CSDL tương tự.

---

## 🚀 Hướng dẫn chạy Backend (.NET API)

Backend của dự án được đặt trong thư mục `MiniERP.API`.

**Bước 1: Cấu hình chuỗi kết nối cơ sở dữ liệu**
Mở tệp `MiniERP.API/appsettings.json` và kiểm tra lại `DefaultConnection`. 
Ví dụ mặc định của máy bạn đang là:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOURCOMPUTER\\SQLEXPRESS;Database=MiniERP_DB;Trusted_Connection=True;MultipleActiveResultSets=true;Encrypt=False"
}
```
*(Nếu bạn mang sang máy khác, hãy đổi `Server=` thành tên máy chủ SQL của bạn).*

**Bước 2: Cập nhật CSDL (Update Database)**
Mở Terminal / PowerShell / CMD tại thư mục `MiniERP.API` và chạy lệnh:
```bash
dotnet ef database update
```
*(Lệnh này sẽ tự động tạo Database `MiniERP_DB` và các bảng dữ liệu dựa trên file Migration).*

**Bước 3: Chạy Server Backend**
Tiếp tục trong Terminal tại thư mục `MiniERP.API`, chạy lệnh:
```bash
dotnet run
```
Hoặc nếu muốn hệ thống tự cập nhật khi sửa code (Hot Reload):
```bash
dotnet watch run
```
Backend sẽ khởi chạy tại: `http://localhost:7280` (Cổng có thể khác tùy máy). Bạn có thể truy cập `http://localhost:7280/swagger` để xem tài liệu API.

---

## 💻 Hướng dẫn chạy Frontend (Next.js)

Frontend của dự án được đặt trong thư mục `mini-erp-frontend`.

**Bước 1: Cài đặt thư viện phụ thuộc (Dependencies)**
Mở một cửa sổ Terminal / PowerShell mới tại thư mục `mini-erp-frontend` và chạy lệnh:
```bash
npm install
```

**Bước 2: Cấu hình đường dẫn API**
Đảm bảo bạn đã có file `.env` hoặc cấu hình URL Backend đúng với cổng mà C# đang chạy. Mặc định trong code thường gọi thẳng đến `http://localhost:7280`.

**Bước 3: Khởi chạy Giao diện**
Vẫn trong Terminal thư mục `mini-erp-frontend`, chạy lệnh:
```bash
npm run dev
```
Hệ thống Frontend sẽ được khởi chạy tại: [http://localhost:3000](http://localhost:3000)

---

## 🔗 Liên kết truy cập nhanh sau khi chạy thành công

- **Màn hình Đăng nhập:** `http://localhost:3000/login`
- **Màn hình Quản trị (Dashboard):** `http://localhost:3000/dashboard`
- **Màn hình Bán hàng (POS):** `http://localhost:3000/dashboard/pos`
- **Tài liệu API (Swagger):** `http://localhost:7280/swagger`

*Chúc bạn trải nghiệm và báo cáo đồ án thành công tốt đẹp!*
