import { useEffect, useState } from "react";
import { 
  Search, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Calendar,
  Settings
} from "lucide-react";
import { api } from "../lib/api";
import { useBuilding } from "../contexts/BuildingContext";
import type { ContractWithRoom } from "../../../shared/types";

const BookingHistoryPage = () => {
  const { selectedBuildingId } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<ContractWithRoom[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data } = await api.get<{ contracts: ContractWithRoom[] }>("/api/contracts");
      if (data) setContracts(data.contracts);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const filteredHistory = contracts.filter(c => {
    const matchesSearch = c.tenant_name.toLowerCase().includes(search.toLowerCase()) || 
                         c.id.toLowerCase().includes(search.toLowerCase());
    const matchesBuilding = !selectedBuildingId || c.room?.building_id === selectedBuildingId;
    
    // Date filtering
    let matchesDate = true;
    if (startDate || endDate) {
      const contractDate = new Date(c.start_date).getTime();
      if (startDate && contractDate < new Date(startDate).getTime()) matchesDate = false;
      if (endDate && contractDate > new Date(endDate).getTime()) matchesDate = false;
    }

    return matchesSearch && matchesBuilding && matchesDate;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lịch sử đặt phòng</h1>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
        {/* Superior Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative w-full max-w-[280px]">
              <input
                type="text"
                placeholder="Tìm kiếm bằng mã đặt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-600/5 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Date Range - Actively Filtered */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl focus-within:ring-4 focus-within:ring-teal-600/5 focus-within:border-teal-600/30 transition-all">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Từ ngày</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-slate-700 w-32 focus:ring-0 cursor-pointer" 
                />
              </div>
              <span className="text-slate-400 font-bold">→</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Đến ngày</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-slate-700 w-32 focus:ring-0 cursor-pointer" 
                />
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            {/* Status Dropdown */}
            <select className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none w-44 focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 transition-all">
              <option value="">Trạng thái</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="active">Đang sử dụng</option>
              <option value="cancelled">Đã huỷ</option>
            </select>

            {/* Filter Toggle */}
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Settings className="w-4 h-4" />
              <span>Bộ lọc</span>
            </button>
          </div>

          {/* Export Excel */}
          <button className="p-2.5 text-emerald-600 hover:bg-emerald-50 border border-slate-100 rounded-xl transition-all shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </button>
        </div>

        {/* Precise Table Implementation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-y border-slate-100">
              <tr>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Mã đặt phòng</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Phòng</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Loại phòng</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Khách hàng đại diện</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Ngày bắt đầu</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Ngày kết thúc</th>
                <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-20 text-center">
                    <div className="w-10 h-10 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">Đang tải lịch sử...</p>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-20 text-center text-slate-400 font-bold text-sm">
                    Không tìm thấy lịch sử đặt phòng nào
                  </td>
                </tr>
              ) : (
                filteredHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="text-[13px] font-black text-blue-600 cursor-pointer hover:underline uppercase truncate block max-w-[120px]">
                        {row.id.split('-')[0]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[13px] font-black text-slate-700">{row.room?.room_number}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[13px] font-bold text-slate-600">Studio</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-black uppercase">
                          {row.tenant_name[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-slate-900 leading-tight">{row.tenant_name}</p>
                          <p className="text-[11px] font-bold text-slate-400">{row.tenant_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest leading-none ${
                        row.status === 'active' ? 'bg-amber-50 text-amber-600' : 
                        row.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                        row.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        row.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {row.status === 'active' ? 'Đang sử dụng' : 
                         row.status === 'confirmed' ? 'Đã xác nhận' :
                         row.status === 'completed' ? 'Đã hoàn thành' :
                         row.status === 'cancelled' ? 'Đã huỷ' : 'Đã kết thúc'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[13px] font-bold text-slate-600 tracking-tight">{formatDate(row.start_date)}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[13px] font-bold text-slate-600 tracking-tight">{formatDate(row.end_date || "")}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-end gap-6 pt-4">
          <span className="text-[13px] font-bold text-slate-400">{filteredHistory.length > 0 ? `1-${filteredHistory.length}/${filteredHistory.length}` : '0-0/0'}</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <select className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-[12px] font-bold text-slate-500 outline-none">
            <option>20/trang</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryPage;
