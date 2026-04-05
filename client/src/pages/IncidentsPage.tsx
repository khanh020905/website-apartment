import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Plus,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Tag,
  Search,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";

interface Incident {
  id: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  location: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  reported_by: string;
  assignee: string;
  created_at: string;
}

const PRIORITY_LABELS: Record<Incident["priority"], string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  critical: "Khẩn cấp",
};

const PRIORITY_COLORS: Record<Incident["priority"], string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
};

const STATUS_LABELS: Record<Incident["status"], string> = {
  open: "Mới",
  in_progress: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
};

const STATUS_COLORS: Record<Incident["status"], string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-500",
};

const tabs = [
  { label: "Sự cố", path: "/incidents", icon: AlertTriangle },
  { label: "Loại sự cố", path: "/incident-types", icon: Tag },
];

export default function IncidentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBuildingId } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const activeTab = location.pathname;

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append("search", search);
    if (filterPriority) params.append("priority", filterPriority);
    if (filterStatus) params.append("status", filterStatus);
    if (selectedBuildingId) params.append("building_id", selectedBuildingId);

    const { data } = await api.get<{
      incidents: Incident[];
      total: number;
      totalPages: number;
    }>(`/api/incidents?${params}`);

    if (data) {
      setIncidents(data.incidents ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    }
    setLoading(false);
  }, [page, limit, search, filterPriority, filterStatus, selectedBuildingId]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    setPage(1);
  }, [search, filterPriority, filterStatus, selectedBuildingId]);

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-linear-to-br from-slate-50 to-slate-100/50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Bảo trì</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý sự cố và bảo trì tòa nhà</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02]">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tạo sự cố</span>
        </button>
      </div>

      {/* Table section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex items-center gap-1 p-3 border-b border-slate-100 bg-slate-50/50">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.path
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm sự cố, vị trí..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none min-w-[130px]"
              >
                <option value="">Ưu tiên</option>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="critical">Khẩn cấp</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none min-w-[140px]"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="open">Mới</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
              </select>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>
              {(search || filterPriority || filterStatus) && (
                <button
                  onClick={() => { setSearch(""); setFilterPriority(""); setFilterStatus(""); }}
                  className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr>
                {["Loại sự cố", "Ưu tiên", "Vị trí sự cố", "Trạng thái", "Báo cáo bởi", "Người đảm nhận", ""].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                      <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                        <Wrench className="w-10 h-10 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-700">Không có dữ liệu</p>
                        <p className="text-sm text-slate-500 mt-1">Chưa có sự cố nào được báo cáo</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                incidents.map((inc, idx) => (
                  <motion.tr
                    key={inc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-amber-50/30 transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-50 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{inc.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_COLORS[inc.priority]}`}>
                        {PRIORITY_LABELS[inc.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{inc.location || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[inc.status]}`}>
                        {STATUS_LABELS[inc.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                          {inc.reported_by?.[0]?.toUpperCase() || <User className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-sm text-slate-600">{inc.reported_by || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {inc.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-brand-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-brand-primary">
                            {inc.assignee[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-600">{inc.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Chưa phân công</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-colors text-xs font-medium">
                          Xử lý
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            {total === 0 ? "0-0/0" : `${(page - 1) * limit + 1}-${Math.min(page * limit, total)}/${total}`} sự cố
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pn: number;
              if (totalPages <= 5) pn = i + 1;
              else if (page <= 3) pn = i + 1;
              else if (page >= totalPages - 2) pn = totalPages - 4 + i;
              else pn = page - 2 + i;
              return <button key={pn} onClick={() => setPage(pn)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === pn ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-white"}`}>{pn}</button>;
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filter drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[101] flex flex-col">
              <div className="p-5 flex items-center justify-between border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Bộ lọc nâng cao</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Loại sự cố</label>
                  <input type="text" placeholder="Nhập loại sự cố..." className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 flex gap-3">
                <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">Đặt lại</button>
                <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 text-sm font-bold rounded-xl hover:shadow-lg transition-all">Áp dụng</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
