import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../lib/api';
import type { Listing, Amenity } from '../../../shared/types';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const SATELLITE_URL = 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}';

interface ListingWithProfile extends Listing {
  profiles?: { full_name: string; phone: string; avatar_url: string | null };
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingWithProfile | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<{ listing: ListingWithProfile }>(`/api/listings/${id}`),
      api.get<{ amenities: Amenity[] }>('/api/search/amenities'),
    ]).then(([listingRes, amenityRes]) => {
      if (listingRes.data) setListing(listingRes.data.listing);
      if (amenityRes.data) setAmenities(amenityRes.data.amenities);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" /></div>;
  if (!listing) return <div className="flex-1 flex items-center justify-center"><p className="text-slate-500">Không tìm thấy tin đăng</p></div>;

  const images = listing.images?.length > 0
    ? listing.images.map((img: { url: string } | string) => typeof img === 'string' ? img : img.url)
    : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop'];

  const listingAmenities = amenities.filter(a => listing.amenity_ids?.includes(a.id));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth">
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-teal-700 transition-colors">Trang chủ</Link>
          <span className="opacity-30">/</span>
          <Link to="/search" className="hover:text-teal-700 transition-colors">Tìm kiếm</Link>
          <span className="opacity-30">/</span>
          <span className="text-slate-900 font-bold line-clamp-1">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column — main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image gallery */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="relative h-64 md:h-[420px] group">
                <img src={images[activeImage]} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-black">
                    {activeImage + 1} / {images.length} ẢNH
                  </div>
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide bg-slate-50/50 border-t border-slate-100">
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`w-20 h-16 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer border-4 transition-all ${
                        i === activeImage ? 'border-teal-600 scale-105 shadow-lg shadow-teal-900/10' : 'border-transparent opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Title & details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-full">Tin đăng mới</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">Phòng cho thuê</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{listing.title}</h1>
                  <p className="flex items-start gap-2 text-sm text-slate-400 font-bold italic">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {listing.address}{listing.ward && `, ${listing.ward}`}{listing.district && `, ${listing.district}`}{listing.city && `, ${listing.city}`}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-3xl font-black text-teal-700">{(listing.price / 1000000).toFixed(1)} <span className="text-sm">Trđ/th</span></div>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Đã bao gồm phí quản lý</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-3xl mb-8 border border-slate-100">
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 opacity-50">Diện tích</p>
                  <p className="font-extrabold text-slate-800">{listing.area || '--'} m²</p>
                </div>
                <div className="text-center md:text-left border-l border-slate-200/50 pl-0 md:pl-4">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 opacity-50">Phòng ngủ</p>
                  <p className="font-extrabold text-slate-800">{listing.bedrooms} PN</p>
                </div>
                <div className="text-center md:text-left border-l border-slate-200/50 pl-0 md:pl-4">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 opacity-50">Vệ sinh</p>
                  <p className="font-extrabold text-slate-800">{listing.bathrooms} WC</p>
                </div>
                <div className="text-center md:text-left border-l border-slate-200/50 pl-0 md:pl-4">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 opacity-50">Ngày đăng</p>
                  <p className="font-extrabold text-slate-800">{new Date(listing.created_at + '').toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {listing.description && (
                <div className="mb-10">
                  <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-teal-600 rounded-full" />
                    Mô tả chi tiết
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{listing.description}</p>
                </div>
              )}

              {listingAmenities.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-teal-600 rounded-full" />
                    Tiện nghi căn hộ
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listingAmenities.map(am => (
                      <div key={am.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <span className="text-lg opacity-60">{am.icon === 'wifi' ? '📶' : am.icon === 'snowflake' ? '❄️' : am.icon === 'car' ? '🚗' : '✨'}</span>
                        <span className="text-xs font-bold text-slate-700">{am.name_vi}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map location */}
              {listing.lat && listing.lng && (
                <div className="mb-4">
                  <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-teal-600 rounded-full" />
                    Vị trí trên bản đồ
                  </h3>
                  <div className="h-72 rounded-[32px] overflow-hidden border-4 border-white shadow-xl">
                    <MapContainer center={[listing.lat, listing.lng]} zoom={16} className="w-full h-full z-0" scrollWheelZoom={false}>
                      <TileLayer url={SATELLITE_URL} />
                      <Marker position={[listing.lat, listing.lng]} />
                    </MapContainer>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold italic mt-4 text-center">Tọa độ chính xác: {listing.lat.toFixed(4)}, {listing.lng.toFixed(4)}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column — contact */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-24">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                Thông tin người đăng
              </h3>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-teal-900/20">
                  {listing.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-lg leading-none mb-1">{listing.profiles?.full_name || 'Người dùng HomeSpot'}</p>
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">Chủ tin đăng tin</p>
                </div>
              </div>

              <div className="space-y-3">
                <a href={`tel:${listing.contact_phone}`}
                  className="w-full h-14 flex items-center justify-center gap-3 bg-teal-700 text-white rounded-2xl font-black text-sm hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/10 active:scale-95">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  GỌI: {listing.contact_phone}
                </a>
                <a href={`https://zalo.me/${listing.contact_phone}`} target="_blank" rel="noopener noreferrer"
                  className="w-full h-14 flex items-center justify-center gap-3 bg-[#0068ff] text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/10 active:scale-95">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-blue-600 font-black">Zalo</span>
                  </div>
                  NHẮN TIN QUA ZALO
                </a>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  <span>Mã tin:</span>
                  <span className="text-slate-500">#{listing.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  <span>Lượt xem:</span>
                  <span className="text-slate-500">{listing.view_count || 0} lượt</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

