import { useState } from "react";
import { Plus, Search, MapPin, Phone, Building2, MoreHorizontal, Settings, Image as ImageIcon } from "lucide-react";
import Modal from "../components/modals/Modal";

interface Location {
  id: string;
  name: string;
  address: string;
  services: string[];
  phone: string;
  floors: number;
  rooms: number;
  status: "active" | "inactive";
}

export default function LocationsPage() {
  const [locations] = useState<Location[]>([
    {
      id: "LOC-001",
      name: "Toà nhà Central",
      address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      services: ["Sleep box", "Studio"],
      phone: "0901234567",
      floors: 5,
      rooms: 45,
      status: "active"
    },
    {
      id: "LOC-002",
      name: "Sunrise Apartment",
      address: "456 Lê Văn Sỹ, Quận 3, TP.HCM",
      services: ["1PN", "2PN"],
      phone: "0987654321",
      floors: 10,
      rooms: 120,
      status: "active"
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

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
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium"
            />
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
             <select 
               value={filterService} 
               onChange={(e) => setFilterService(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium"
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
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium"
             >
               <option value="">Tất cả trạng thái</option>
               <option value="active">Đang hoạt động</option>
               <option value="inactive">Đã đóng cửa</option>
             </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
             <button 
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-colors hover:bg-amber-500 shadow-sm whitespace-nowrap cursor-pointer"
             >
               <Plus className="w-4 h-4 font-bold" /> Thêm toà nhà
             </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-5 lg:p-6 bg-[#f8f9fa]">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]">
          <div className="overflow-x-auto flex-1">
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
                 {locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-amber-50/20 transition-colors group">
                       <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-slate-400" />
                             </div>
                             <div>
                                <span className="block text-[13px] font-bold text-slate-900">{loc.name}</span>
                                <span className="text-[11px] font-medium text-slate-500 uppercase">{loc.id}</span>
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
                             {loc.services.map((s, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">{s}</span>
                             ))}
                          </div>
                       </td>
                       <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
                             <Phone className="w-3.5 h-3.5 text-slate-400" />
                             {loc.phone}
                          </div>
                       </td>
                       <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col text-[12px] font-medium text-slate-600">
                             <span>{loc.floors} tầng</span>
                             <span>{loc.rooms} phòng</span>
                          </div>
                       </td>
                       <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${loc.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                             {loc.status === 'active' ? 'Đang hoạt động' : 'Đã đóng cửa'}
                          </span>
                       </td>
                       <td className="px-5 py-4 text-right">
                          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-500 transition-all">
                             <MoreHorizontal className="w-5 h-5" />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Location Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm toà nhà mới" size="lg">
         <form onSubmit={handleCreate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
               {/* Image Upload */}
               <div className="md:col-span-2">
                  <span className="block text-[13px] font-bold text-slate-700 mb-1.5">Ảnh đại diện</span>
                  <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                     <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                     <span className="text-[12px] font-medium text-slate-500">Nhấn để tải ảnh lên</span>
                  </div>
               </div>

               <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tên toà nhà <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Nhập tên toà nhà" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400" required />
               </div>
               
               <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Nhập số điện thoại hotline" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400" required />
               </div>

               <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Địa chỉ <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Nhập địa chỉ chi tiết" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400" required />
               </div>

               <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Số tầng <span className="text-red-500">*</span></label>
                  <input type="number" min={1} placeholder="Ví dụ: 5" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400" required />
               </div>
               
               <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tổng số phòng <span className="text-red-500">*</span></label>
                  <input type="number" min={1} placeholder="Ví dụ: 50" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400" required />
               </div>
               
               <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Website / Link liên kết</label>
                  <input type="url" placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400" />
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
               <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  Hủy
               </button>
               <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-amber-400 text-slate-900 hover:bg-amber-500 rounded-lg shadow-sm transition-colors">
                  Lưu toà nhà
               </button>
            </div>
         </form>
      </Modal>

    </div>
  );
}
