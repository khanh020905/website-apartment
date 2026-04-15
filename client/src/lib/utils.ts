export function maskAddress(address: string): string {
  if (!address) return "";
  // Loại bỏ "Số " (không phân biệt hoa thường), tiếp theo là số nhà (chữ số và ký tự không phải khoảng trắng/dấu phẩy),
  // và tùy chọn loại bỏ từ "Đường " ngay sau đó.
  const regex = /^(\s*(?:số|Số|SỐ)\s+)?\d+[^\s,]*\s*(?:đường|Đường|ĐƯỜNG)?\s*/i;
  return address.replace(regex, "").trim();
}
