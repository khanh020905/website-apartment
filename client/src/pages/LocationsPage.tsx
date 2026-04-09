import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Phone, Building2, MoreHorizontal, Settings, Image as ImageIcon, Edit2, Trash2 } from "lucide-react";
import Modal from "../components/modals/Modal";
import { api } from "../lib/api";

interface Room {
  id: string;
}

interface Building {
  id: string;
  name: string;
  address: string;
  services: string[];
  phone: string;
  floors: number;
  rooms: Room[];
  status: "active" | "inactive";
  website?: string;
  images?: string[];
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const res = await api.get<{ buildings: Building[] }>("/api/buildings");
      setLocations(res.data?.buildings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      phone: form.get("phone") as string,
      address: form.get("address") as string,
      floors: parseInt(form.get("floors") as string, 10),
      website: form.get("website") as string,
      status: form.get("status") as string || 'active',
      images: (form.get("images") as string || "").split(",").map(s => s.trim()).filter(Boolean),
      // services can be a comma separated list
      services: (form.get("services") as string || "").split(",").map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editingBuilding) {
        await api.put(`/api/buildings/${editingBuilding.id}`, data);
      } else {
        await api.post("/api/buildings", data);
      }
      setIsModalOpen(false);
      setEditingBuilding(null);
      fetchLocations();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Đã xảy ra lỗi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá toà nhà này?")) return;
    try {
      await api.delete(`/api/buildings/${id}`);
      fetchLocations();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Đã xảy ra lỗi. Toà nhà có thể vẫn còn phòng.");
    }
    setOpenDropdownId(null);
  };

  const openCreateModal = () => {
    setEditingBuilding(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Building) => {
    setEditingBuilding(b);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const filteredLocations = locations.filter(loc => {
    if (search && !loc.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && loc.status !== filterStatus) return false;
    if (filterService && (!loc.services || !loc.services.some(s => s.toLowerCase().includes(filterService.toLowerCase())))) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Cơ sở / Toà nhà</h1>
        </div>
        
        {/* Toolbar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[320px] flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm tên toà nhà..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all font-medium"
            />
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
             <select 
               value={filterService} 
               onChange={(e) => setFilterService(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium"
             >
               <option value="">Chọn dịch vụ</option>
               <option value="sleep_box">Sleep box</option>
               <option value="studio">Studio</option>
               <option value="1pn">Căn hộ 1PN</option>
             </select>
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
             <select 
               value={filterStatus} 
               onChange={(e) => setFilterStatus(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand-primary hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium"
             >
               <option value="">Tất cả trạng thái</option>
               <option value="active">Đang hoạt động</option>
               <option value="inactive">Đã đóng cửa</option>
             </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
             <button 
               onClick={openCreateModal}
               className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg text-[13px] font-bold transition-colors hover:bg-brand-dark shadow-sm whitespace-nowrap cursor-pointer"
             >
               <Plus className="w-4 h-4 font-bold" /> Thêm toà nhà
             </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-5 lg:p-6 bg-[#f8f9fa]">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]">
          <div className="overflow-x-auto flex-1 pb-20">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Đang tải dữ liệu...</div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Không tìm thấy cơ sở nào.</div>
            ) : (
            <table className="w-full h-full text-left">
              <thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  {["Tên toà nhà", "Địa chỉ", "Dịch vụ", "Liên hệ", "Quy mô", "Trạng thái"].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 w-10 text-center">
                    <Settings className="w-4 h-4 text-slate-400 inline-block" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredLocations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-brand-bg/20 transition-colors group relative">
                       <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                {loc.images && loc.images.length > 0 ? (
                                   <img src={loc.images[0]} alt="" className="w-full h-full object-cover rounded" />
                                ) : (
                                   <Building2 className="w-5 h-5 text-slate-400" />
                                )}
                             </div>
                             <div>
                                <span className="block text-[13px] font-bold text-slate-900">{loc.name}</span>
                                <span className="text-[11px] font-medium text-slate-500 uppercase">{loc.id.split("-")[0].substring(0,6)}...</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-5 py-4">
                          <div className="flex flex-col gap-1 text-[13px] text-slate-600 max-w-[250px]">
                             <div className="flex gap-2">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate">{loc.address}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                             {loc.services && loc.services.length > 0 ? loc.services.map((s, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">{s}</span>
                             )) : <span className="text-[12px] text-slate-400">Không có</span>}
                          </div>
                       </td>
                       <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
                             <Phone className="w-3.5 h-3.5 text-slate-400" />
                             {loc.phone || 'Chưa có SĐT'}
                          </div>
                       </td>
                       <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col text-[12px] font-medium text-slate-600">
                             <span>{loc.floors} tầng</span>
                             <span>{loc.rooms?.length || 0} phòng</span>
                          </div>
                       </td>
                       <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${loc.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                             {loc.status === 'active' ? 'Đang hoạt động' : 'Đã đóng cửa'}
                          </span>
                       </td>
                       <td className="px-5 py-4 text-right relative">
                          <button 
                            onClick={() => setOpenDropdownId(openDropdownId === loc.id ? null : loc.id)}
                            className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-500 transition-all cursor-pointer"
                          >
                             <MoreHorizontal className="w-5 h-5" />
                          </button>
                          
                          {openDropdownId === loc.id && (
                            <div className="absolute right-8 top-10 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-left">
                               <button 
                                 onClick={() => openEditModal(loc)} 
                                 className="w-full px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                               >
                                 <Edit2 className="w-3.5 h-3.5" /> Sửa thông tin
                               </button>
                               <button 
                                 onClick={() => handleDelete(loc.id)} 
                                 className="w-full px-4 py-2 text-[13px] font-medium text-rose-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                               >
                                 <Trash2 className="w-3.5 h-3.5" /> Xóa toà nhà
                               </button>
                            </div>
                          )}
                       </td>
                    </tr>
                 ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Location Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingBuilding(null); }} title={editingBuilding ? "Sửa thông tin toà nhà" : "Thêm toà nhà mới"} size="lg">
         <form onSubmit={handleCreateOrUpdate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
               {/* Image URL Input */}
               <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Ảnh đại diện (Link hình ảnh, phân cách bằng dấu phẩy)</label>
                  <div className="flex flex-col gap-3">
                     <input 
                        type="text" 
                        name="images" 
                        defaultValue={editingBuilding?.images?.join(", ") || ""} 
                        placeholder="Ví dụ: https://example.com/image1.jpg, https://example.com/image2.jpg" 
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" 
                     />
                     <div className="w-full h-32 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                        {editingBuilding?.images && editingBuilding.images.length > 0 ? (
                           <div className="flex gap-2 p-2 overflow-x-auto">
                              {editingBuilding.images.map((img, i) => (
                                 <img key={i} src={img} className="h-24 w-32 object-cover rounded-lg shadow-sm" alt="" />
                              ))}
                           </div>
                        ) : (
                           <div className="flex flex-col items-center">
                              <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                              <span className="text-[11px] font-medium text-slate-400">Chưa có hình ảnh để hiển thị</span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tên toà nhà <span className="text-red-500">*</span></label>
                  <input type="text" name="name" defaultValue={editingBuilding?.name || ""} placeholder="Nhập tên toà nhà" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" required />
               </div>
               
               <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                  <input type="text" name="phone" defaultValue={editingBuilding?.phone || ""} placeholder="Nhập số điện thoại hotline" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" required />
               </div>

               <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Địa chỉ <span className="text-red-500">*</span></label>
                  <input type="text" name="address" defaultValue={editingBuilding?.address || ""} placeholder="Nhập địa chỉ chi tiết" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" required />
               </div>

               <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Số tầng <span className="text-red-500">*</span></label>
                  <input type="number" name="floors" defaultValue={editingBuilding?.floors || ""} min={1} placeholder="Ví dụ: 5" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" required />
               </div>
               
               <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Trạng thái</label>
                  <select name="status" defaultValue={editingBuilding?.status || "active"} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary">
                     <option value="active">Đang hoạt động</option>
                     <option value="inactive">Đã đóng cửa</option>
                  </select>
               </div>
               
               <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Dịch vụ (phân cách bằng dấu phẩy)</label>
                  <input type="text" name="services" defaultValue={editingBuilding?.services?.join(", ") || ""} placeholder="VD: Sleep box, Studio, 1PN" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" />
               </div>

               <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Website / Link liên kết</label>
                  <input type="url" name="website" defaultValue={editingBuilding?.website || ""} placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-primary" />
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
               <button type="button" onClick={() => { setIsModalOpen(false); setEditingBuilding(null); }} className="cursor-pointer px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  Hủy
               </button>
               <button type="submit" className="cursor-pointer px-6 py-2.5 text-sm font-bold bg-brand-primary text-white hover:bg-brand-dark rounded-lg shadow-sm transition-colors">
                  Lưu toà nhà
               </button>
            </div>
         </form>
      </Modal>

    </div>
  );
}
