import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Listing, Amenity } from '../../../shared/types';

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
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link to="/search" className="hover:text-teal-700">Tìm kiếm</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium line-clamp-1">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image gallery */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl overflow-hidden border border-slate-200">
              <div className="relative h-80">
                <img src={images[activeImage]} alt={listing.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-xs font-semibold rounded-full backdrop-blur">
                  {activeImage + 1}/{images.length}
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${
                        i === activeImage ? 'border-teal-600' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Title & details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-slate-200">
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{listing.title}</h1>
              <p className="text-sm text-slate-500 mb-4">{listing.address}{listing.ward && `, ${listing.ward}`}{listing.district && `, ${listing.district}`}{listing.city && `, ${listing.city}`}</p>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 bg-teal-100 text-teal-800 rounded-xl font-bold text-lg">{(listing.price / 1000000).toFixed(1)} triệu/tháng</span>
                {listing.area && <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold">{listing.area} m²</span>}
                <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold">{listing.bedrooms} phòng ngủ</span>
                <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold">{listing.bathrooms} phòng vệ sinh</span>
              </div>

              {listing.description && (
                <div className="mb-6">
                  <h3 className="font-bold text-slate-800 mb-2">Mô tả</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}

              {listingAmenities.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">Tiện nghi</h3>
                  <div className="flex flex-wrap gap-2">
                    {listingAmenities.map(am => (
                      <span key={am.id} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold border border-teal-200">
                        {am.icon} {am.name_vi}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column — contact */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 sticky top-6">
              <h3 className="font-bold text-slate-800 mb-4">Thông tin liên hệ</h3>
              {listing.profiles && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg">
                    {listing.profiles.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{listing.profiles.full_name}</p>
                    <p className="text-xs text-slate-500">Chủ nhà</p>
                  </div>
                </div>
              )}
              <a href={`tel:${listing.contact_phone}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-700 text-white rounded-xl font-bold text-sm hover:bg-teal-800 transition-colors mb-3">
                📞 {listing.contact_phone}
              </a>
              <a href={`https://zalo.me/${listing.contact_phone}`} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors">
                💬 Nhắn Zalo
              </a>

              <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-400">
                <p>Mã tin: {listing.id.slice(0, 8)}</p>
                <p>Lượt xem: {listing.view_count}</p>
                <p>Đăng: {new Date(listing.created_at + '').toLocaleDateString('vi-VN')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

