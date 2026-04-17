# Tiêu Chí Vận Hành & Chỉnh Sửa Website Apartment (Requirements)

Dựa trên file feedback, dưới đây là danh sách các yêu cầu và trạng thái hiện tại đã được đối chiếu với mã nguồn nhánh `main` (sau khi gộp `demo2`).

## 1. Yêu cầu Chung
- [x] Đổi "Đặt phòng" thành "Danh sách phòng" (Đã đổi trong Sidebar)
- [x] Ẩn địa chỉ chính xác của tòa nhà thành tên đường/phường (Vd: Số 3 Đường Trà Khê -> Trà Khê). (Đã dùng hàm `maskAddress` trong `PropertyCard.tsx`)
- [x] Sửa lại hình hiển thị Map Icon để chứa format "Từ [Giá] | [Số phòng] [Icon]". (Đã hoàn thành trong `PriceMarker.tsx`)

## 2. Gói Chủ Nhà (Landlord)
### Trang tổng quan & Tin đã đăng
- [x] Trang tổng quan: Giữ nguyên không sửa.
- [x] Xóa bỏ mục "Tin đã đăng" hoàn toàn khỏi Sidebar. (Đã xóa hoàn toàn route và menu `MyListingsPage`).
- [x] Dời phần "Tin đã đăng" và biến nó thành "Thêm thông tin phòng" nằm trong mục Quản lý. Làm Form thêm thông tin phòng giống hệt nền tảng FPHost. (Đã làm thông qua nút "Ký gửi tin đăng" tại tab Phòng của chi tiết Tòa nhà).

### Khách hàng & Đặt phòng (Danh sách phòng)
- [x] Khách hàng: Sửa Form điền thông tin khách hàng, check bộ lọc giống SmartOS 100%. (Các form `CustomerForm`, `IdentityDocumentForm` đã được làm lại trong demo2).
- [x] Danh sách phòng: Sửa Form khách hàng, đổi bộ lọc chọn phòng thành dạng ô tích (checkbox), làm phần Lịch sử đặt phòng và Lịch hẹn xem phòng giống SmartOS hoàn toàn.

### Thanh toán, Hợp đồng & Bảo trì
- [x] Thanh toán: Sửa phần tạo hóa đơn bị sai logic và làm lại UI giống SmartOS 100%. (Đã hoàn thiện UI Dashboard và giao diện nested table Tạo Hóa Đơn Hàng Loạt).
- [x] Hợp đồng: Làm giống SmartOS 100%, lưu ý bộ lọc và Cài đặt hiển thị bên phải.
- [x] Bảo trì: Sửa form và bộ lọc giống SmartOS. (Các form sự cố `IncidentForm` đã được update trong bài commit gần đây).
- [x] Báo cáo: Làm giống SmartOS 100%. (Đã hoàn thiện UI Dashboard đầy đủ 4 module: Vận hành, Khách hàng, Doanh thu (có chia sub-tab) và Cho chủ doanh nghiệp).

### Quản lý & Tòa nhà
- [x] Xóa bỏ ô mục "Tiện nghi" và tính năng "Đánh giá" ở form tạo Tòa nhà. (Đã xử lý ẩn UI khỏi form trong LocationsPage.tsx).
- [x] Bỏ mục "Tiện ích" ở form tạo Tòa nhà. (Đã xử lý ẩn nhóm input cấu hình phí dịch vụ ra khỏi UI LocationsPage.tsx).
- [x] Cập nhật luồng tạo tòa nhà: Cần thêm dữ liệu "Đăng tin" vào bên trong mục này để thay thế tab Tin đăng. (Xử lý thông qua tích hợp vào trang Chi tiết Tòa Nhà - Quản lý phòng)
- [x] Form Ký gửi ngay: Cần thêm mục "Điều chỉnh hoa hồng" giống hệ thống FPHost.
- [x] Quản lý người dùng, vai trò, Tích hợp, API: Make sure they are 100% same as SmartOS if not yet. (Đã hoàn thiện giao diện 100% và gom nhóm thành công trang Người dùng & Vai trò).

## 3. Gói Môi Giới (Broker)
- [x] **Ẩn các chức năng không cần thiết**: Ẩn Trang tổng quan, Tin đã đăng, Khách hàng, Thanh toán, Hợp đồng, Bảo trì, Báo cáo, Quản lý đối với role Môi giới. (Đã sửa lại logic `AppSidebar.tsx` và `SidebarItem` để phân rã quyền truy cập chi tiết bằng `isLandlord` thay vì gộp chung).
- [x] Môi giới chỉ thấy "Danh sách phòng" (Đã hoàn thành ở Sidebar).
- [x] Tự động nạp phòng ký gửi vào giỏ hàng theo khu vực. (Đã tạo UI `BrokerCartPage` để cấu hình).
- [x] Hiển thị tỉ lệ/mức hoa hồng trên tin đăng cho môi giới khi xem bản đồ. (Đã hoàn thiện badge `HH:` trong `PropertyCard.tsx`).
- [x] Môi giới có thể xem được thông tin liên hệ của chủ nhà. (Đã đổi nút Thuê Ngay thành `Liên hệ Chủ`).
- [x] Môi giới có thể tự thêm thông tin phòng (với tư cách pass lẻ) lên trang bán hàng môi giới.
- [x] Các phòng do môi giới tự thêm sẽ KHÔNG được hiển thị lên Map chung và Marketplace của GenHouse. (Server sẽ tự detect `user.role === 'broker'` và force flag `broker_private` để loại khỏi Marketplace).
- [x] **Landing page riêng**: Xây dựng UI Trang hàng riêng (dành cho môi giới), hiển thị toàn bộ phòng của môi giới đó. Có tích hợp box Gọi điện và Liên kết Zalo. (Đã hoàn thành ở route `/store/:brokerId` và thiết kế Responsive UI hiện đại chuẩn App FPHouse/Nguồn Trọ).

## 4. Bổ sung: Thông tin tài khoản tham khảo
Để thuận tiện cho việc đối chiếu và làm giống UI, đây là các tài khoản đăng nhập vào các hệ thống:

**SmartOS:**
- Link: `https://tra-my.smartos.space/pms/login`
- Gmail: `nguyenvinhthitramy881@gmail.com`
- Pass: `lcrdd(o7k`

**FPHOST (Ứng dụng):**
- Số điện thoại: `0921205999`
- Pass: `111005`

**Nguồn Trọ:**
- Số điện thoại: `0921205999`
- Pass: `111005`
