import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Range, getTrackBackground } from 'react-range';
import { 
  Search, MapPin, Home, Users, LayoutGrid, List,
  ChevronDown, ChevronRight, Check, X, Sliders, Bed, Bath, Square,
  Wind, Wifi, Shield, Car
} from 'lucide-react';
import { api } from '../lib/api';
import type { Listing, Amenity, PropertyType, FurnitureStatus } from '../../../shared/types';
import { PROPERTY_TYPE_LABELS, FURNITURE_LABELS } from '../../../shared/types';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'phong_tro', label: 'Phòng trọ' },
  { value: 'can_ho_mini', label: 'Căn hộ mini' },
  { value: 'chung_cu', label: 'Căn hộ chung cư' },
  { value: 'nha_nguyen_can', label: 'Nhà nguyên căn' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'area_asc', label: 'Diện tích nhỏ → lớn' },
  { value: 'area_desc', label: 'Diện tích lớn → nhỏ' },
];

const PRICE_RANGE = { MIN: 0, MAX: 50 }; // in millions
const AREA_RANGE = { MIN: 0, MAX: 200 }; // in m2

export default function SearchPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters
  const [keyword, setKeyword] = useState('');
  const [priceValues, setPriceValues] = useState([PRICE_RANGE.MIN, PRICE_RANGE.MAX]);
  const [areaValues, setAreaValues] = useState([AREA_RANGE.MIN, AREA_RANGE.MAX]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<PropertyType[]>([]);
  const [furniture, setFurniture] = useState<FurnitureStatus | ''>('');
  const [bedrooms, setBedrooms] = useState<string | null>(null);
  const [bathrooms, setBathrooms] = useState<string | null>(null);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  // Location Data (Vietnamese Administrative Divisions)
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    // Lead amenities
    api.get<{ amenities: Amenity[] }>('/api/search/amenities').then(({ data }) => {
      if (data) setAmenities(data.amenities);
    });

    // Load Provinces
    fetch('https://provinces.open-api.vn/api/p/').then(r => r.json()).then(setProvinces);
  }, []);

  useEffect(() => {
    if (province) {
      const code = provinces.find(p => p.name === province)?.code;
      if (code) {
        fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
          .then(r => r.json())
          .then(data => setDistricts(data.districts));
      }
    } else {
      setDistricts([]);
      setDistrict('');
    }
  }, [province, provinces]);

  useEffect(() => {
    if (district) {
      const code = districts.find(d => d.name === district)?.code;
      if (code) {
        fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
          .then(r => r.json())
          .then(data => setWards(data.wards));
      }
    } else {
      setWards([]);
      setWard('');
    }
  }, [district, districts]);

  const search = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    
    // Price in VND
    params.set('priceMin', String(priceValues[0] * 1000000));
    params.set('priceMax', String(priceValues[1] * 1000000));
    
    params.set('areaMin', String(areaValues[0]));
    params.set('areaMax', String(areaValues[1]));
    
    if (selectedPropertyTypes.length > 0) params.set('propertyTypes', selectedPropertyTypes.join(','));
    if (furniture) params.set('furniture', furniture);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (province) params.set('city', province);
    if (district) params.set('district', district);
    if (ward) params.set('ward', ward);
    if (selectedAmenities.length > 0) params.set('amenityIds', selectedAmenities.join(','));
    
    params.set('sortBy', sortBy);
    params.set('page', String(page));
    params.set('limit', '21'); // divisible by 3

    const { data } = await api.get<{ listings: Listing[]; total: number; totalPages: number }>(`/api/search?${params}`);
    if (data) {
      setListings(data.listings);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [keyword, priceValues, areaValues, selectedPropertyTypes, furniture, bedrooms, bathrooms, province, district, ward, sortBy, page, selectedAmenities]);

  useEffect(() => { 
    const timer = setTimeout(() => {
      search();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleAmenity = (id: number) => {
    setSelectedAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const togglePropertyType = (val: PropertyType) => {
    setSelectedPropertyTypes(prev => prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]);
  };

  const formatPrice = (mil: number) => {
    if (mil === 0) return '0';
    if (mil >= 50 && PRICE_RANGE.MAX === 50) return '50+ triệu';
    return `${mil} triệu`;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100/30 overflow-hidden">
      {/* Top Search Banner */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-600">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tiêu đề, địa chỉ, khu vực..." 
                value={keyword} 
                onChange={e => { setKeyword(e.target.value); setPage(1); }}
                className="w-full h-16 pl-14 pr-6 bg-slate-50 border-2 border-slate-100 rounded-[28px] font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-700/5 transition-all outline-none" 
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`h-16 px-8 rounded-[28px] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all cursor-pointer ${
                  showFilters 
                    ? 'bg-emerald-700 text-white shadow-xl shadow-emerald-900/30 rotate-0' 
                    : 'bg-white border-2 border-slate-100 text-slate-700 hover:border-emerald-300'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Bộ lọc nâng cao
              </button>
              
              <div className="p-1.5 bg-slate-100/50 border border-slate-200 rounded-[24px] hidden md:flex items-center gap-1">
                <button onClick={() => setViewMode('grid')} className={`p-3 rounded-[18px] transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-3 rounded-[18px] transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Filters Sidebar (Collapsible) */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside 
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full lg:w-[420px] bg-white border-r border-slate-200 overflow-y-auto z-10 p-8 space-y-10 scrollbar-hide"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Bộ lọc chi tiết</h3>
                <button onClick={() => setShowFilters(false)} className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Range */}
              <div key="price-range-group" className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 ml-1">Giá thuê (triệu/tháng)</label>
                  <span className="text-sm font-black text-emerald-600">{formatPrice(priceValues[0])} — {formatPrice(priceValues[1])}</span>
                </div>
                <div className="px-2 h-10 flex items-center relative z-20">
                  <Range
                    step={0.5}
                    min={PRICE_RANGE.MIN}
                    max={PRICE_RANGE.MAX}
                    values={priceValues}
                    onChange={values => setPriceValues(values)}
                    renderTrack={({ props, children }) => (
                      <div
                        onMouseDown={props.onMouseDown}
                        onTouchStart={props.onTouchStart}
                        style={props.style}
                        className="h-9 flex w-full"
                      >
                        <div
                          ref={props.ref}
                          className="h-2 w-full rounded-full self-center"
                          style={{
                            background: getTrackBackground({
                              values: priceValues,
                              colors: ['#f1f5f9', '#10b981', '#f1f5f9'],
                              min: PRICE_RANGE.MIN,
                              max: PRICE_RANGE.MAX,
                            }),
                          }}
                        >
                          {children}
                        </div>
                      </div>
                    )}
                    renderThumb={({ props }) => (
                      <div
                        {...props}
                        style={{ ...props.style }}
                        className="w-6 h-6 bg-white border-4 border-emerald-600 rounded-full shadow-lg cursor-pointer outline-none active:scale-110 hover:scale-105"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Area Range */}
              <div key="area-range-group" className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 ml-1">Diện tích (m²)</label>
                  <span className="text-sm font-black text-slate-700">{areaValues[0]} — {areaValues[1] === AREA_RANGE.MAX ? '200+' : areaValues[1]} m²</span>
                </div>
                <div className="px-2 h-10 flex items-center relative z-20">
                  <Range
                    step={5}
                    min={AREA_RANGE.MIN}
                    max={AREA_RANGE.MAX}
                    values={areaValues}
                    onChange={values => setAreaValues(values)}
                    renderTrack={({ props, children }) => (
                      <div
                        onMouseDown={props.onMouseDown}
                        onTouchStart={props.onTouchStart}
                        style={props.style}
                        className="h-9 flex w-full"
                      >
                        <div
                          ref={props.ref}
                          className="h-2 w-full rounded-full self-center"
                          style={{
                            background: getTrackBackground({
                              values: areaValues,
                              colors: ['#f1f5f9', '#4f46e5', '#f1f5f9'],
                              min: AREA_RANGE.MIN,
                              max: AREA_RANGE.MAX,
                            }),
                          }}
                        >
                          {children}
                        </div>
                      </div>
                    )}
                    renderThumb={({ props }) => (
                      <div
                        {...props}
                        style={{ ...props.style }}
                        className="w-6 h-6 bg-white border-4 border-indigo-600 rounded-full shadow-lg cursor-pointer outline-none active:scale-110 hover:scale-105"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Location Cascade */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 ml-1">Khu vực / Vị trí</label>
                <div className="space-y-3">
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                    <select 
                      value={province} 
                      onChange={e => { setProvince(e.target.value); setDistrict(''); setWard(''); }}
                      className="w-full h-14 pl-12 pr-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm appearance-none outline-none focus:bg-white focus:border-emerald-600 transition-all"
                    >
                      <option value="">Chọn Tỉnh / Thành phố</option>
                      {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <select 
                      disabled={!province}
                      value={district} 
                      onChange={e => { setDistrict(e.target.value); setWard(''); }}
                      className="w-full h-14 pl-12 pr-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm appearance-none outline-none focus:bg-white focus:border-emerald-600 transition-all disabled:opacity-50"
                    >
                      <option value="">Chọn Quận / Huyện</option>
                      {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <select 
                      disabled={!district}
                      value={ward} 
                      onChange={e => setWard(e.target.value)}
                      className="w-full h-14 pl-12 pr-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm appearance-none outline-none focus:bg-white focus:border-emerald-600 transition-all disabled:opacity-50"
                    >
                      <option value="">Chọn Phường / Xã</option>
                      {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 ml-1">Số phòng ngủ</label>
                  <div className="flex gap-2">
                    {['0', '1', '2', '3', '4+'].map(n => (
                      <button 
                        key={n} 
                        onClick={() => setBedrooms(n === '0' ? null : n === '4+' ? '4' : n)} 
                        className={`flex-1 min-w-[48px] h-12 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          (n === '0' && bedrooms === null) || (n === '4+' && bedrooms === '4') || (bedrooms === n && n !== '0' && n !== '4+')
                            ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20' 
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 ml-1">Số phòng vệ sinh</label>
                  <div className="flex gap-2">
                    {['1', '2', '3+'].map(n => (
                      <button 
                        key={n} 
                        onClick={() => setBathrooms(n === '3+' ? '3' : n)} 
                        className={`flex-1 min-w-[48px] h-12 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          (n === '3+' && bathrooms === '3') || (bathrooms === n && n !== '3+')
                            ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20' 
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Property Types (Multi Checkbox) */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 ml-1">Loại hình căn hộ</label>
                <div className="grid grid-cols-1 gap-2">
                  {PROPERTY_TYPES.map(pt => (
                    <button
                      key={pt.value}
                      onClick={() => togglePropertyType(pt.value)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedPropertyTypes.includes(pt.value) 
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-lg shadow-emerald-900/5' 
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedPropertyTypes.includes(pt.value) ? 'bg-emerald-600 border-emerald-600' : 'border-slate-200 bg-white'
                      }`}>
                        {selectedPropertyTypes.includes(pt.value) && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-sm font-bold tracking-tight">{pt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Furniture (Radio) */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 ml-1">Tình trạng nội thất</label>
                <div className="flex flex-wrap gap-2">
                  {(['none', 'basic', 'full'] as FurnitureStatus[]).map(f => (
                    <button 
                      key={f} 
                      onClick={() => setFurniture(f === furniture ? '' : f)} 
                      className={`px-6 py-3 rounded-2xl flex items-center gap-2 border-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                        furniture === f ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {f === 'none' && <X className="w-3.5 h-3.5" />}
                      {f === 'basic' && <Home className="w-3.5 h-3.5" />}
                      {f === 'full' && <Sofa className="w-3.5 h-3.5" />}
                      {FURNITURE_LABELS[f]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities (Multi select) */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 ml-1">Tiện nghi có sẵn</label>
                <div className="flex flex-wrap gap-2">
                  {amenities.map(am => (
                    <button 
                      key={am.id} 
                      onClick={() => toggleAmenity(am.id)} 
                      className={`px-4 py-2.5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                        selectedAmenities.includes(am.id) 
                          ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-md' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <span className="opacity-60">
                        {am.icon === 'wifi' ? <Wifi className="w-3 h-3" /> : am.icon === 'snowflake' ? <Wind className="w-3 h-3" /> : am.icon === 'bed' ? <Bed className="w-3 h-3" /> : am.icon === 'parking' ? <Car className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      </span>
                      {am.name_vi}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <button 
                onClick={() => {
                  setPriceValues([PRICE_RANGE.MIN, PRICE_RANGE.MAX]);
                  setAreaValues([AREA_RANGE.MIN, AREA_RANGE.MAX]);
                  setSelectedPropertyTypes([]);
                  setFurniture('');
                  setBedrooms(null);
                  setBathrooms(null);
                  setProvince('');
                  setSelectedAmenities([]);
                }}
                className="w-full py-4 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Nhập lại bộ lọc (Reset)
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Results Main Content */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 scroll-smooth">
          {/* Header & Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                {total} kết quả tìm được
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cập nhật theo thời gian thực</p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
              {SORT_OPTIONS.map(s => (
                <button 
                  key={s.value} 
                  onClick={() => setSortBy(s.value)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer border-2 ${
                    sortBy === s.value ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Display */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Đang tìm kiếm căn hộ...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="py-32 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-white rounded-[40px] shadow-xl shadow-black/5 flex items-center justify-center mx-auto mb-8">
                <Search className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Không tìm thấy yêu cầu</h3>
              <p className="max-w-xs mx-auto text-slate-400 font-medium leading-relaxed">
                Thử thay đổi bộ lọc, khoảng giá hoặc từ khóa tìm kiếm để tìm thấy kết quả phù hợp hơn.
              </p>
            </div>
          ) : (
            <ListingGrid 
              listings={listings} 
              viewMode={viewMode}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-10">
              <button 
                disabled={page <= 1} 
                onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-sm disabled:opacity-40 hover:border-emerald-600 transition-all cursor-pointer group"
              >
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 rotate-180" />
              </button>
              
              <div className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Trang</span>
                <span className="text-base font-black text-slate-900">{page}</span>
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">/</span>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{totalPages}</span>
              </div>

              <button 
                disabled={page >= totalPages} 
                onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-sm disabled:opacity-40 hover:border-emerald-600 transition-all cursor-pointer group"
              >
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Simple Sofa icon if not in lucide
function Sofa({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
      <path d="M4 18v2" />
      <path d="M20 20v-2" />
    </svg>
  );
}

// Optimized Grid Component
const ListingGrid = memo(({ listings, viewMode }: { listings: Listing[], viewMode: 'grid' | 'list' }) => {
  return (
    <div className={`grid gap-4 sm:gap-6 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
        : 'grid-cols-1'
    }`}>
      {listings.map((listing, i) => (
        <ListingCard key={listing.id} listing={listing} viewMode={viewMode} index={i} />
      ))}
    </div>
  );
});

// Memoized Single Card
const ListingCard = memo(({ listing, viewMode, index }: { listing: Listing, viewMode: 'grid' | 'list', index: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
      className="group"
    >
      <Link 
        to={`/listings/${listing.id}`} 
        className={`block bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ${
          viewMode === 'list' ? 'flex flex-col sm:flex-row h-auto sm:h-64' : ''
        }`}
      >
        <div className={`relative overflow-hidden ${
          viewMode === 'list' ? 'sm:w-[40%] flex-shrink-0' : 'aspect-[1.4/1]'
        }`}>
          <img 
            src={listing.images?.[0]?.url || listing.images?.[0] as unknown as string || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'}
            alt={listing.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          
          <div className="absolute top-4 left-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl">
              {(listing.price / 1000000).toFixed(1)} triệu/th
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {listing.property_type === 'can_ho_mini' && (
              <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg">
                <Home className="w-4 h-4" />
              </div>
            )}
            <button className="bg-white text-rose-500 p-2 rounded-xl shadow-lg hover:bg-rose-50 transition-colors">
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {PROPERTY_TYPE_LABELS[listing.property_type]}
            </p>
            <h3 className="text-lg font-black text-slate-800 leading-tight mb-3 line-clamp-2 transition-colors group-hover:text-emerald-700">
              {listing.title}
            </h3>
            <div className="flex items-start gap-1.5 text-slate-400 font-bold text-xs mb-6">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{listing.district}, {listing.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500 border-t border-slate-50 pt-4 mt-auto">
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300">
                <Bed className="w-3 h-3" /> PN
              </span>
              <span className="text-sm font-black text-slate-700">{listing.bedrooms}</span>
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300">
                <Bath className="w-3 h-3" /> WC
              </span>
              <span className="text-sm font-black text-slate-700">{listing.bathrooms}</span>
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300">
                <Square className="w-3 h-3" /> Diện tích
              </span>
              <span className="text-sm font-black text-slate-700">{listing.area}m²</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
