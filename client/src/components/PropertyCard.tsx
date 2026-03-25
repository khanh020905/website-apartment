import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Listing } from '../../../shared/types';

interface PropertyCardProps {
  listing: Listing;
  index: number;
}

const PropertyCard = ({ listing, index }: PropertyCardProps) => {
  const imageUrl = listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop';
  const displayAddress = [listing.address, listing.ward, listing.district, listing.city].filter(Boolean).join(', ');
  const createdAt = listing.created_at ? new Date(listing.created_at) : null;
  const postedTime = createdAt
    ? createdAt.toLocaleDateString('vi-VN')
    : 'Mới đăng';

  return (
    <Link to={`/listings/${listing.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04, ease: 'easeOut' }}
        className="bg-white border border-slate-200 rounded-xl p-3 flex gap-4 cursor-pointer group hover:shadow-lg hover:shadow-slate-200/60 hover:border-blue-200 transition-all duration-300"
      >
        {/* Thumbnail with "Xem chi tiết" button overlay */}
        <div className="w-[130px] h-[120px] rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 relative">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <button className="absolute bottom-2 left-2 px-4 py-1.5 bg-emerald-700 text-white text-xs rounded-md font-bold hover:bg-emerald-800 transition-colors cursor-pointer shadow-md">
            Xem chi tiết
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
          <div>
            <h3 className="text-[#2d3a8c] font-bold text-[15px] leading-tight line-clamp-1 group-hover:text-[#1e2a6e] transition-colors">
              {listing.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
              {displayAddress}
            </p>
          </div>
          <div className="flex items-end justify-between mt-1">
            <span className="text-lg font-extrabold text-slate-900">
              {(Number(listing.price) / 1_000_000).toFixed(1)}{' '}
              <span className="text-base font-bold">Trđ</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            {postedTime}
          </span>
        </div>
      </motion.div>
    </Link>
  );
};

export default PropertyCard;
