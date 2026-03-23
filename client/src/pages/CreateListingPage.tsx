import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { Amenity, PropertyType, FurnitureStatus } from '../../../shared/types';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'phong_tro', label: 'Phòng trọ' },
  { value: 'can_ho_mini', label: 'Căn hộ mini' },
  { value: 'chung_cu', label: 'Căn hộ chung cư' },
  { value: 'nha_nguyen_can', label: 'Nhà nguyên căn' },
];

const FURNITURE_OPTIONS: { value: FurnitureStatus; label: string }[] = [
  { value: 'full', label: 'Đầy đủ' },
  { value: 'basic', label: 'Cơ bản' },
  { value: 'none', label: 'Không nội thất' },
];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { canPost, role } = useAuth();
  const isBroker = role === 'broker';
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1=basic, 2=details, 3=images, 4=preview

  // Form state
  const [form, setForm] = useState({
    title: '',
    price: '',
    area: '',
    bedrooms: '1',
    bathrooms: '1',
    property_type: 'phong_tro' as PropertyType,
    furniture: 'none' as FurnitureStatus,
    description: '',
    contact_phone: '',
    contact_name: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    lat: 0,
    lng: 0,
    amenity_ids: [] as number[],
    available_date: '',
    // Broker CRM fields (SRS §2.1)
    target_audience: '',
    commission_rate: '',
    booking_note: '',
  });
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
  ]);

  // Fetch amenities
  useEffect(() => {
    api.get<{ amenities: Amenity[] }>('/api/search/amenities').then(({ data }) => {
      if (data) setAmenities(data.amenities);
    });
  }, []);

  const updateForm = useCallback((field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleAmenity = (id: number) => {
    setForm(prev => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(id)
        ? prev.amenity_ids.filter(a => a !== id)
        : [...prev.amenity_ids, id],
    }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title || !form.price || !form.contact_phone) {
      setError('Vui lòng điền đầy đủ: tiêu đề, giá thuê và số điện thoại');
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      price: Number(form.price) * 1000000, // Convert from triệu to đồng
      area: form.area ? Number(form.area) : null,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      images: imageUrls.map((url, i) => ({ url, order: i })),
    };

    const { data, error: apiError } = await api.post<{ listing: unknown; auto_approved?: boolean; message?: string }>('/api/listings', payload);
    setLoading(false);

    if (apiError) {
      setError(apiError);
    } else if (data) {
      setSuccess(data.message || 'Tin đăng đã được gửi!');
      setTimeout(() => navigate('/my-listings'), 2500);
    }
  };

  if (!canPost) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Không có quyền đăng tin</h2>
          <p className="text-slate-500">Bạn cần đăng ký tài khoản Chủ trọ hoặc Môi giới để đăng tin cho thuê.</p>
          <button onClick={() => navigate('/register')} className="mt-4 px-6 py-2 bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer">
            Đăng ký ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-3xl mx-auto p-6 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Đăng tin cho thuê</h1>
          <p className="text-slate-500 mt-1">Điền thông tin phòng để đăng tin lên HomeSpot</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {['Thông tin cơ bản', 'Chi tiết & Tiện nghi', 'Hình ảnh', 'Xem trước'].map((label, i) => (
            <button
              key={i}
              onClick={() => setStep(i + 1)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                step === i + 1
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/20'
                  : step > i + 1
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error/Success */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
              ✅ {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Basic info */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800">Thông tin cơ bản</h3>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Tiêu đề tin <span className="text-red-400">*</span></label>
                <input type="text" maxLength={100} value={form.title} onChange={e => updateForm('title', e.target.value)}
                  placeholder="VD: Phòng trọ mới xây, gần ĐH Bách Khoa" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10" />
                <p className="text-xs text-slate-400 mt-1">{form.title.length}/100 ký tự</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Giá thuê (triệu/tháng) <span className="text-red-400">*</span></label>
                  <input type="number" step="0.1" value={form.price} onChange={e => updateForm('price', e.target.value)}
                    placeholder="3.5" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Diện tích (m²)</label>
                  <input type="number" value={form.area} onChange={e => updateForm('area', e.target.value)}
                    placeholder="25" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Số phòng ngủ</label>
                  <div className="flex gap-2">
                    {['0', '1', '2', '3', '4'].map(n => (
                      <button key={n} type="button" onClick={() => updateForm('bedrooms', n)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                          form.bedrooms === n ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {n === '4' ? '4+' : n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Số phòng vệ sinh</label>
                  <div className="flex gap-2">
                    {['1', '2', '3'].map(n => (
                      <button key={n} type="button" onClick={() => updateForm('bathrooms', n)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                          form.bathrooms === n ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {n === '3' ? '3+' : n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Loại hình</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_TYPES.map(pt => (
                    <button key={pt.value} type="button" onClick={() => updateForm('property_type', pt.value)}
                      className={`py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                        form.property_type === pt.value ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Nội thất</label>
                <div className="flex gap-2">
                  {FURNITURE_OPTIONS.map(f => (
                    <button key={f.value} type="button" onClick={() => updateForm('furniture', f.value)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                        form.furniture === f.value ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-3 bg-emerald-700 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-800 transition-colors">
              Tiếp theo →
            </button>
          </motion.div>
        )}

        {/* Step 2: Details & Amenities */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800">Địa chỉ</h3>
              <input type="text" value={form.address} onChange={e => updateForm('address', e.target.value)}
                placeholder="Số nhà, đường..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10" />
              <div className="grid grid-cols-3 gap-3">
                <input type="text" value={form.city} onChange={e => updateForm('city', e.target.value)}
                  placeholder="Tỉnh/TP" className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10" />
                <input type="text" value={form.district} onChange={e => updateForm('district', e.target.value)}
                  placeholder="Quận/Huyện" className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10" />
                <input type="text" value={form.ward} onChange={e => updateForm('ward', e.target.value)}
                  placeholder="Phường/Xã" className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800">Liên hệ</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={form.contact_name} onChange={e => updateForm('contact_name', e.target.value)}
                  placeholder="Tên liên hệ" className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10" />
                <input type="tel" value={form.contact_phone} onChange={e => updateForm('contact_phone', e.target.value)}
                  placeholder="Số điện thoại *" required className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800">Tiện nghi</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenities.map(am => (
                  <button key={am.id} type="button" onClick={() => toggleAmenity(am.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                      form.amenity_ids.includes(am.id) ? 'bg-emerald-100 text-emerald-700 font-semibold border-2 border-emerald-300' : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:border-slate-200'
                    }`}>
                    <span className="text-base">{form.amenity_ids.includes(am.id) ? '✅' : '⬜'}</span>
                    {am.name_vi}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Mô tả chi tiết</label>
              <textarea rows={4} value={form.description} onChange={e => updateForm('description', e.target.value)}
                placeholder="Mô tả chi tiết về phòng, khu vực, ưu điểm..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10 resize-none" />
            </div>

            {/* Broker CRM Fields — SRS §2.1 */}
            {isBroker && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🤝</span>
                  <h3 className="font-bold text-blue-800">Thông tin môi giới</h3>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Đối tượng khách hàng</label>
                  <input type="text" value={form.target_audience} onChange={e => updateForm('target_audience', e.target.value)}
                    placeholder="VD: Sinh viên, gia đình trẻ, nhân viên văn phòng"
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1">Hoa hồng (%)</label>
                    <input type="number" step="0.5" value={form.commission_rate} onChange={e => updateForm('commission_rate', e.target.value)}
                      placeholder="5" className="w-full px-4 py-3 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1">Ghi chú đặt phòng</label>
                    <input type="text" value={form.booking_note} onChange={e => updateForm('booking_note', e.target.value)}
                      placeholder="VD: Cọc 1 tháng" className="w-full px-4 py-3 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-50 transition-colors">
                ← Quay lại
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-800 transition-colors">
                Tiếp theo →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800">Hình ảnh (3-15 ảnh)</h3>
              <p className="text-xs text-slate-400">Ảnh đầu tiên sẽ là ảnh đại diện. Kéo thả để sắp xếp.</p>
              <div className="grid grid-cols-3 gap-3">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group aspect-[4/3] rounded-xl overflow-hidden border-2 border-slate-200">
                    <img src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">Ảnh chính</span>}
                    <button onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold">×</button>
                  </div>
                ))}
                <button onClick={() => {
                  const url = prompt('Nhập URL hình ảnh:');
                  if (url) setImageUrls(prev => [...prev, url]);
                }} className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  <span className="text-xs font-semibold">Thêm ảnh</span>
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-50 transition-colors">
                ← Quay lại
              </button>
              <button onClick={() => setStep(4)} className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-800 transition-colors">
                Xem trước →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-lg">Xem trước tin đăng</h3>
              {imageUrls.length > 0 && (
                <img src={imageUrls[0]} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
              )}
              <h2 className="text-xl font-bold text-slate-900">{form.title || 'Chưa có tiêu đề'}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="text-emerald-700 font-bold text-lg">{form.price || '0'} triệu/tháng</span>
                {form.area && <span>• {form.area} m²</span>}
                <span>• {form.bedrooms} PN</span>
                <span>• {form.bathrooms} WC</span>
              </div>
              <p className="text-sm text-slate-500">{form.address}{form.ward && `, ${form.ward}`}{form.district && `, ${form.district}`}{form.city && `, ${form.city}`}</p>
              {form.description && <p className="text-sm text-slate-600 whitespace-pre-wrap">{form.description}</p>}
              <div className="flex flex-wrap gap-2">
                {form.amenity_ids.map(id => {
                  const am = amenities.find(a => a.id === id);
                  return am ? <span key={id} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">{am.name_vi}</span> : null;
                })}
              </div>
              {form.contact_phone && <p className="text-sm font-semibold text-slate-700">📞 {form.contact_phone}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-50 transition-colors">
                ← Chỉnh sửa
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-800 transition-colors disabled:opacity-60">
                {loading ? 'Đang gửi...' : '📤 Đăng tin'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
