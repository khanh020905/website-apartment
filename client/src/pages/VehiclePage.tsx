import { useState } from "react";
import { Car, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

const VehiclePage = () => {
  const [search, setSearch] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [status, setStatus] = useState("");

  const columns = [
    "Khách hàng",
    "Toà nhà",
    "Loại phương tiện",
    "Biển số",
    "Nhãn hiệu",
    "Màu sắc",
    "Trạng thái",
    "Thao tác"
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Phương tiện</h1>
        <button className="flex items-center gap-2 px-6 py-2 bg-[#fcd34d] text-black rounded-xl text-sm font-black transition-all hover:shadow-lg hover:shadow-yellow-500/20 cursor-pointer">
          <Plus className="w-5 h-5" />
          Thêm phương tiện
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Tìm kiếm theo phòng, khách hàng, biển số..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600/30 transition-all text-slate-700"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          
          <select 
            value={vehicleType} 
            onChange={(e) => setVehicleType(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 focus:outline-none focus:border-teal-600/30 min-w-[180px] cursor-pointer"
          >
            <option value="">Chọn loại phương tiện</option>
            <option value="xe_may">Xe máy</option>
            <option value="xe_dap">Xe đạp</option>
            <option value="xe_hoi">Xe hơi</option>
            <option value="xe_dien">Xe điện</option>
          </select>

          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 focus:outline-none focus:border-teal-600/30 min-w-[180px] cursor-pointer"
          >
            <option value="">Chọn trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${col === 'Thao tác' ? 'text-right' : ''}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="px-6 py-32 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-40">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
                      <Car className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-lg font-black text-slate-900 tracking-tight">Không có dữ liệu</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 border-t border-slate-50 flex items-center justify-end gap-4">
          <span className="text-sm font-bold text-slate-400">0-0/0</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <select className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 outline-none">
            <option>20/trang</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default VehiclePage;
