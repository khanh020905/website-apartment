import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { Listing, ListingStatus } from '../../../shared/types';

interface ListingWithProfile extends Listing {
  profiles?: { full_name: string; phone: string; email: string };
}

interface Stats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  totalBuildings: number;
  totalRooms: number;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_verified: boolean;
  subscription_tier: string;
  created_at: string;
}

export default function AdminVerificationPage() {
  const [tab, setTab] = useState<'pending' | 'all' | 'stats' | 'users'>('pending');
  const [pending, setPending] = useState<ListingWithProfile[]>([]);
  const [allListings, setAllListings] = useState<ListingWithProfile[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [pendingRes, statsRes] = await Promise.all([
      api.get<{ listings: ListingWithProfile[] }>('/api/admin/listings/pending'),
      api.get<{ stats: Stats }>('/api/admin/stats'),
    ]);
    if (pendingRes.data) setPending(pendingRes.data.listings);
    if (statsRes.data) setStats(statsRes.data.stats);
    setLoading(false);
  };

  const loadAllListings = async () => {
    const { data } = await api.get<{ listings: ListingWithProfile[] }>('/api/admin/listings/all');
    if (data) setAllListings(data.listings);
  };

  const handleReview = async (listingId: string, action: 'approved' | 'rejected') => {
    await api.post(`/api/admin/listings/${listingId}/review`, {
      action,
      notes: reviewNotes[listingId] || '',
    });
    setReviewingId(null);
    loadData();
  };

  const loadUsers = async () => {
    const { data } = await api.get<{ users: UserProfile[] }>('/api/admin/users');
    if (data) setUsers(data.users);
  };

  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    await api.put(`/api/admin/users/${userId}/verify`, { is_verified: isVerified });
    loadUsers();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Quản trị</h1>
          <p className="text-slate-500 mb-6">Duyệt tin đăng và quản lý hệ thống</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'pending', label: `Chờ duyệt (${pending.length})`, onClick: () => setTab('pending') },
            { key: 'all', label: 'Tất cả tin', onClick: () => { setTab('all'); loadAllListings(); } },
            { key: 'users', label: 'Người dùng', onClick: () => { setTab('users'); loadUsers(); } },
            { key: 'stats', label: 'Thống kê', onClick: () => setTab('stats') },
          ].map(t => (
            <button key={t.key} onClick={t.onClick}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                tab === t.key ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/20' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === 'stats' && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-4">
            {[
              { label: 'Tổng người dùng', value: stats.totalUsers, icon: '👥', color: 'bg-blue-50 border-blue-200' },
              { label: 'Tổng tin đăng', value: stats.totalListings, icon: '📋', color: 'bg-emerald-50 border-emerald-200' },
              { label: 'Chờ duyệt', value: stats.pendingListings, icon: '⏳', color: 'bg-yellow-50 border-yellow-200' },
              { label: 'Đã duyệt', value: stats.approvedListings, icon: '✅', color: 'bg-green-50 border-green-200' },
              { label: 'Tổng tòa nhà', value: stats.totalBuildings, icon: '🏢', color: 'bg-purple-50 border-purple-200' },
              { label: 'Tổng phòng', value: stats.totalRooms, icon: '🚪', color: 'bg-pink-50 border-pink-200' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl p-5 border-2 ${s.color}`}>
                <span className="text-2xl">{s.icon}</span>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Pending tab */}
        {tab === 'pending' && (
          <div>
            {loading ? (
              <p className="text-center text-slate-400 py-10">Đang tải...</p>
            ) : pending.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-slate-700">Không có tin nào cần duyệt</h2>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((listing, i) => (
                  <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="flex">
                      <div className="w-56 h-44 flex-shrink-0">
                        <img src={listing.images?.[0]?.url || listing.images?.[0] as unknown as string || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop'}
                          alt={listing.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg">{listing.title}</h3>
                            <p className="text-sm text-slate-500">{listing.address}</p>
                          </div>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Chờ duyệt</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="font-bold text-emerald-700">{(listing.price / 1000000).toFixed(1)} triệu/th</span>
                          {listing.area && <span>{listing.area} m²</span>}
                          <span>{listing.bedrooms} PN</span>
                        </div>
                        {listing.profiles && (
                          <p className="text-xs text-slate-400 mt-2">Đăng bởi: {listing.profiles.full_name} — {listing.profiles.phone}</p>
                        )}

                        <AnimatePresence>
                          {reviewingId === listing.id ? (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3">
                              <textarea rows={2} placeholder="Ghi chú (tùy chọn)..."
                                value={reviewNotes[listing.id] || ''}
                                onChange={e => setReviewNotes(prev => ({ ...prev, [listing.id]: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 resize-none mb-2" />
                              <div className="flex gap-2">
                                <button onClick={() => handleReview(listing.id, 'approved')}
                                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-emerald-700">✅ Duyệt</button>
                                <button onClick={() => handleReview(listing.id, 'rejected')}
                                  className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-red-600">❌ Từ chối</button>
                                <button onClick={() => setReviewingId(null)}
                                  className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-semibold cursor-pointer">Hủy</button>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="mt-3">
                              <button onClick={() => setReviewingId(listing.id)}
                                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold cursor-pointer hover:bg-emerald-200 transition-colors">
                                📋 Xem xét
                              </button>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All listings tab */}
        {tab === 'all' && (
          <div className="space-y-3">
            {allListings.length === 0 ? <p className="text-center text-slate-400 py-10">Đang tải...</p> : allListings.map(l => {
              const statusStyle: Record<ListingStatus, string> = {
                draft: 'bg-slate-100 text-slate-600',
                pending: 'bg-yellow-100 text-yellow-700',
                approved: 'bg-emerald-100 text-emerald-700',
                rejected: 'bg-red-100 text-red-700',
              };
              return (
                <div key={l.id} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4">
                  <img src={l.images?.[0]?.url || l.images?.[0] as unknown as string || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&h=70&fit=crop'}
                    alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{l.title}</p>
                    <p className="text-xs text-slate-500">{l.profiles?.full_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle[l.status]}`}>{l.status}</span>
                  <span className="text-xs text-slate-400">{new Date(l.created_at + '').toLocaleDateString('vi-VN')}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Users tab — SRS §2.2 Account Verification */}
        {tab === 'users' && (
          <div className="space-y-3">
            {users.length === 0 ? <p className="text-center text-slate-400 py-10">Đang tải...</p> : users.map(u => {
              const roleStyle: Record<string, string> = {
                user: 'bg-slate-100 text-slate-600',
                landlord: 'bg-emerald-100 text-emerald-700',
                broker: 'bg-blue-100 text-blue-700',
                admin: 'bg-purple-100 text-purple-700',
              };
              return (
                <div key={u.id} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                    {(u.full_name?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800">{u.full_name}</p>
                    <p className="text-xs text-slate-500">{u.email} • {u.phone || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleStyle[u.role] || 'bg-slate-100'}`}>{u.role}</span>
                  {(u.role === 'landlord' || u.role === 'broker') && (
                    <button
                      onClick={() => handleVerifyUser(u.id, !u.is_verified)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        u.is_verified
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {u.is_verified ? '✅ Đã xác minh' : 'Xác minh'}
                    </button>
                  )}
                  <span className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
