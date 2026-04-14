/**
 * Hides the exact house number from an address string.
 * Example: "Số 3 Đường Trà Khê 3" -> "Trà Khê 3"
 * Example: "123 Đường Khuê Mỹ Đông 7" -> "Khuê Mỹ Đông 7"
 */
export const maskAddress = (address: string) => {
    if (!address) return "";
    
    // Split by comma first to handle the first part (house number + street)
    const parts = address.split(",");
    const firstPart = parts[0];
    
    // Masking logic for the first part:
    // Removes optional "Số", then the house number (digits + optional letters),
    // and then the optional word "Đường".
    const maskedFirstPart = firstPart.replace(/^(\s*(?:số|Số|SỐ)\s+)?\d+[^\s,]*\s*(?:đường|Đường|ĐƯỜNG)?\s*/i, "").trim();
    
    // Reconstruct the address if there are multiple parts
    if (parts.length > 1) {
        return [maskedFirstPart, ...parts.slice(1)].filter(Boolean).join(", ");
    }
    
    return maskedFirstPart;
};
