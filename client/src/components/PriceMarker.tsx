import L from "leaflet";
import type { Listing } from "../../../shared/types";

export const createPriceIcon = (listing: Listing) => {
	const priceInMillion = Number(listing.price) / 1_000_000;
	const priceText =
		priceInMillion % 1 === 0 ? `${priceInMillion} Trđ` : `${priceInMillion.toFixed(1)} Trđ`;

	return L.divIcon({
		className: "leaflet-div-icon",
		html: `
      <div 
        style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px 5px 8px;
          background: white;
          color: #1e293b;
          font-weight: 700;
          font-size: 13px;
          font-family: 'Inter', system-ui, sans-serif;
          border-radius: 9999px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.2s ease;
          line-height: 1;
        "
        onmouseover="this.style.transform='scale(1.1)'"
        onmouseout="this.style.transform='scale(1)'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 4v16"/>
          <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
          <path d="M2 17h20"/>
          <path d="M6 8v9"/>
        </svg>
        <span>${priceText}</span>
      </div>
    `,
		iconSize: [100, 36],
		iconAnchor: [50, 18],
	});
};
