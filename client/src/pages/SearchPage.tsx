import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Listing, Amenity, PropertyType, FurnitureStatus } from '../../../shared/types';

const PROPERTY_TYPES: { value: PropertyType | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'phong_tro', label: 'Phòng trọ' },
  { value: 'can_ho_mini', label: 'Căn hộ mini' },
  { value: 'chung_cu', label: 'Chung cư' },
  { value: 'nha_nguyen_can', label: 'Nhà nguyên căn' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'area_asc', label: 'Diện tích nhỏ → lớn' },
  { value: 'area_desc', label: 'Diện tích lớn → nhỏ' },
];

export default function SearchPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [areaMin, setAreaMin] = useState('');
  const [areaMax, setAreaMax] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [furniture, setFurniture] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  useEffect(() => {
    api.get<{ amenities: Amenity[] }>('/api/search/amenities').then(({ data }) => {
      if (data) setAmenities(data.amenities);
    });
  }, []);

  const search = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (priceMin) params.set('priceMin', String(Number(priceMin) * 1000000));
    if (priceMax) params.set('priceMax', String(Number(priceMax) * 1000000));
    if (areaMin) params.set('areaMin', areaMin);
    if (areaMax) params.set('areaMax', areaMax);
    if (propertyType) params.set('propertyTypes', propertyType);
    if (furniture) params.set('furniture', furniture);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (city) params.set('city', city);
    if (district) params.set('district', district);
    if (selectedAmenities.length > 0) params.set('amenityIds', selectedAmenities.join(','));
    params.set('sortBy', sortBy);
    params.set('page', String(page));
    params.set('limit', '20');

    const { data } = await api.get<{ listings: Listing[]; total: number; totalPages: number }>(`/api/search?${params}`);
    if (data) {
      setListings(data.listings);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [keyword, priceMin, priceMax, areaMin, areaMax, propertyType, furniture, bedrooms, city, district, sortBy, page, selectedAmenities]);

  useEffect(() => { search(); }, [search]);

  const toggleAmenity = (id: number) => {
    setSelectedAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Tìm kiếm theo tên, địa chỉ..." value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10 shadow-sm" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3.5 rounded-2xl font-semibold text-sm cursor-pointer transition-all flex items-center gap-2 ${
                showFilters ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Bộ lọc
            </button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Giá tối thiểu (triệu)</label>
                <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Giá tối đa (triệu)</label>
                <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="20"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Diện tích min (m²)</label>
                <input type="number" value={areaMin} onChange={e => setAreaMin(e.target.value)} placeholder="10"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Diện tích max (m²)</label>
                <input type="number" value={areaMax} onChange={e => setAreaMax(e.target.value)} placeholder="100"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tỉnh/TP</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Hồ Chí Minh"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Quận/Huyện</label>
                <input type="text" value={district} onChange={e => setDistrict(e.target.value)} placeholder="Quận 1"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Phòng ngủ</label>
                <div className="flex gap-1">
                  {['', '0', '1', '2', '3', '4'].map(n => (
                    <button key={n} onClick={() => setBedrooms(n)} className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                      bedrooms === n ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {n === '' ? 'Tất cả' : n === '4' ? '4+' : n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nội thất</label>
                <div className="flex gap-1">
                  {[{ v: '', l: 'Tất cả' }, { v: 'full', l: 'Đầy đủ' }, { v: 'basic', l: 'Cơ bản' }, { v: 'none', l: 'Không' }].map(o => (
                    <button key={o.v} onClick={() => setFurniture(o.v)} className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                      furniture === o.v ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Property types */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Loại hình</label>
              <div className="flex gap-2 flex-wrap">
                {PROPERTY_TYPES.map(pt => (
                  <button key={pt.value} onClick={() => setPropertyType(pt.value)} className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    propertyType === pt.value ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Tiện nghi</label>
                <div className="flex gap-2 flex-wrap">
                  {amenities.map(am => (
                    <button key={am.id} onClick={() => toggleAmenity(am.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      selectedAmenities.includes(am.id) ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                      {am.name_vi}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Sort + Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">{total} kết quả</p>
          <div className="flex gap-2">
            {SORT_OPTIONS.map(s => (
              <button key={s.value} onClick={() => setSortBy(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  sortBy === s.value ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Đang tải...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy kết quả</h2>
            <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing, i) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/listings/${listing.id}`} className="block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
                    <div className="relative h-48 overflow-hidden">
                      <img src={listing.images?.[0]?.url || listing.images?.[0] as unknown as string || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop'}
                        alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-700/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                        {(listing.price / 1000000).toFixed(1)} triệu/th
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{listing.title}</h3>
                      <p className="text-xs text-slate-500 mb-2 line-clamp-1">{listing.address}{listing.district && `, ${listing.district}`}{listing.city && `, ${listing.city}`}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        {listing.area && <span className="px-2 py-0.5 bg-slate-100 rounded">{listing.area} m²</span>}
                        <span className="px-2 py-0.5 bg-slate-100 rounded">{listing.bedrooms} PN</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded">{listing.bathrooms} WC</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50">
                  ← Trước
                </button>
                <span className="text-sm text-slate-500">Trang {page}/{totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50">
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
