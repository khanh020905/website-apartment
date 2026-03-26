import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import PropertyCard from './PropertyCard';
import type { Listing, PropertyType } from '../../../shared/types';

interface SidebarProps {
  listings: Listing[];
  onFilterChange: (filtered: Listing[]) => void;
  selectedListingId?: string | null;
  onSelectListing?: (listingId: string) => void;
}

const Sidebar = ({ listings, onFilterChange, selectedListingId = null, onSelectListing }: SidebarProps) => {
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState<'all' | PropertyType>('all');
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(30);

  const minPct = (budgetMin / 30) * 100;
  const maxPct = (budgetMax / 30) * 100;

  const filteredListings = useMemo(() => {
    const filtered = listings.filter((l) => {
      const fullAddress = [l.address, l.ward, l.district, l.city].filter(Boolean).join(' ');
      const matchSearch =
        search === '' ||
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        fullAddress.toLowerCase().includes(search.toLowerCase());
      const matchPropertyType = propertyType === 'all' || l.property_type === propertyType;
      const priceInMillion = Number(l.price) / 1_000_000;
      const matchBudget = priceInMillion >= budgetMin && priceInMillion <= budgetMax;
      return matchSearch && matchPropertyType && matchBudget;
    });
    onFilterChange(filtered);
    return filtered;
  }, [search, propertyType, budgetMin, budgetMax, listings, onFilterChange]);

  const handleMinChange = (val: number) => {
    setBudgetMin(Math.min(val, budgetMax - 0.5));
  };

  const handleMaxChange = (val: number) => {
    setBudgetMax(Math.max(val, budgetMin + 0.5));
  };

  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-[430px] min-w-[430px] h-full bg-gradient-to-b from-white to-cyan-50/40 border-r border-cyan-100 flex flex-col overflow-hidden"
    >
      {/* Filters */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">

        {/* Địa điểm */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-800 mb-2">Địa điểm</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Bạn muốn đến đâu?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0f9b9b] focus:ring-2 focus:ring-[#0f9b9b]/10 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Loại hình */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-800 mb-2">Loại hình</label>
          <div className="flex flex-col gap-2.5">
            {[
              { value: 'all' as const, label: 'Tất cả' },
              { value: 'phong_tro' as const, label: 'Phòng trọ' },
              { value: 'can_ho_mini' as const, label: 'Căn hộ mini' },
              { value: 'chung_cu' as const, label: 'Chung cư' },
              { value: 'nha_nguyen_can' as const, label: 'Nhà nguyên căn' },
            ].map((opt) => (
              <label
                key={opt.value}
                onClick={() => setPropertyType(opt.value)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  propertyType === opt.value
                    ? 'border-[#0f9b9b]'
                    : 'border-slate-300 group-hover:border-slate-400'
                }`}>
                  {propertyType === opt.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                       className="w-2.5 h-2.5 rounded-full bg-[#0f9b9b]"
                    />
                  )}
                </div>
                <span className={`text-sm transition-colors ${
                  propertyType === opt.value ? 'text-[#0b7272] font-semibold' : 'text-slate-600'
                }`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Ngân sách — Dual Handle Slider */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Ngân sách của bạn (VND)</label>
          
          {/* Budget pills */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white bg-[#0b7272] px-3 py-1 rounded-full shadow-sm">
              {budgetMin % 1 === 0 ? budgetMin : budgetMin.toFixed(1)} Trđ
            </span>
            <span className="text-xs font-bold text-white bg-[#0b7272] px-3 py-1 rounded-full shadow-sm">
              {budgetMax % 1 === 0 ? budgetMax : budgetMax.toFixed(1)} Trđ
            </span>
          </div>

          {/* Dual range slider */}
          <div className="relative h-6 flex items-center">
            {/* Track background */}
            <div className="absolute left-0 right-0 h-[6px] bg-slate-200 rounded-full" />
            {/* Active track (green between handles) */}
            <div
              className="absolute h-[6px] bg-[#0f9b9b] rounded-full"
              style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
            />
            {/* Min handle */}
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={budgetMin}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              className="dual-slider absolute w-full pointer-events-none appearance-none bg-transparent z-10"
              style={{ zIndex: budgetMin > 28 ? 20 : 10 }}
            />
            {/* Max handle */}
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={budgetMax}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              className="dual-slider absolute w-full pointer-events-none appearance-none bg-transparent z-10"
            />
          </div>

          {/* Number inputs */}
          <div className="flex gap-3 mt-3">
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden focus-within:border-[#0f9b9b] transition-colors">
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="flex-1 px-3 py-2.5 text-sm text-slate-700 outline-none bg-transparent min-w-0"
                min={0}
                max={budgetMax}
              />
              <span className="text-xs text-slate-400 pr-3 font-medium">đ</span>
            </div>
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden focus-within:border-[#0f9b9b] transition-colors">
              <input
                type="number"
                value={budgetMax * 1_000_000}
                onChange={(e) => handleMaxChange(Number(e.target.value) / 1_000_000)}
                className="flex-1 px-3 py-2.5 text-sm text-slate-700 outline-none bg-transparent min-w-0"
                min={0}
              />
              <span className="text-xs text-slate-400 pr-3 font-medium">đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tin mới đăng */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Tin mới đăng</h3>
          <span className="text-xs text-[#0b7272] font-semibold bg-cyan-50 px-2.5 py-1 rounded-full">
            {filteredListings.length} kết quả
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {filteredListings.map((listing, i) => (
            <PropertyCard
              key={listing.id}
              listing={listing}
              index={i}
              isActive={selectedListingId === listing.id}
              onSelect={onSelectListing}
            />
          ))}
          {filteredListings.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400 font-medium">Không tìm thấy kết quả</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;

