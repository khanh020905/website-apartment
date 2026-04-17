import L from "leaflet";
import type { Listing } from "../../../shared/types";

export const createPriceIcon = (listing: Listing) => {
	const priceInMillion = Number(listing.price) / 1_000_000;
	const priceText =
		priceInMillion % 1 === 0 ? `${priceInMillion}Tr` : `${priceInMillion.toFixed(1)}Tr`;

	const vacantRooms = listing.bedrooms || 1; // Sử dụng bedrooms làm số lượng phòng trống hoặc mặc định là 1

	return L.divIcon({
		className: "",
		html: `
      <div 
        style="
          display: inline-flex;
          align-items: center;
          background: white;
          color: #1e3a5f;
          font-weight: 800;
          font-size: 15px;
          font-family: 'Inter', system-ui, sans-serif;
          border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        "
        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
      >
        <div style="padding: 6px 10px 6px 14px; border-right: 1px solid #f1f5f9;">
          Từ ${priceText}
        </div>
        <div style="padding: 6px 12px 6px 10px; display: flex; align-items: center; gap: 6px;">
          <span>${vacantRooms}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
      </div>
    `,
		iconSize: [120, 38], 
		iconAnchor: [60, 19],
	});
};
