import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  RefreshCw,
  FileCheck2,
  FileX2,
  Search,
  Download,
  FileCode,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";

interface Contract {
  id: string;
  contract_number: string;
  contract_name: string;
  room_number: string;
  building_name: string;
  tenant_name: string;
  start_date: string;
  end_date: string;
  status: "active" | "extended" | "settled" | "pending";
  booking_code: string;
  attachments_count: number;
  created_at: string;
}

interface ContractStats {
  total: number;
  active: number;
  extended: number;
  settled: number;
}

const STATUS_LABELS: Record<Contract["status"], string> = {
  active: "Đang hiệu lực",
  extended: "Đã gia hạn",
  settled: "Đã thanh lý",
  pending: "Chờ xác nhận",
};

const STATUS_COLORS: Record<Contract["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  extended: "bg-blue-100 text-blue-700",
  settled: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-700",
};

const formatDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};

const tabs = [
  { label: "Hợp đồng", path: "/contracts", icon: FileText },
  { label: "Mẫu hợp đồng", path: "/contract-templates", icon: FileCode },
];

export default function ContractsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBuildingId } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats>({ total: 0, active: 0, extended: 0, settled: 0 });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const activeTab = location.pathname;

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append("search", search);
    if (filterStatus) params.append("status", filterStatus);
    if (fromDate) params.append("from_date", fromDate);
    if (toDate) params.append("to_date", toDate);
    if (selectedBuildingId) params.append("building_id", selectedBuildingId);

    const { data } = await api.get<{
      contracts: Contract[];
      total: number;
      totalPages: number;
      stats: ContractStats;
    }>(`/api/contracts?${params}`);

    if (data) {
      setContracts(data.contracts ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setStats(data.stats ?? { total: 0, active: 0, extended: 0, settled: 0 });
    }
    setLoading(false);
  }, [page, limit, search, filterStatus, fromDate, toDate, selectedBuildingId]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, fromDate, toDate, selectedBuildingId]);

  const statCards = [
    {
      label: "Tổng hợp đồng",
      value: stats.total,
      icon: FileText,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/25",
    },
    {
      label: "Đang hiệu lực",
      value: stats.active,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/25",
    },
    {
      label: "Đã gia hạn",
      value: stats.extended,
      icon: RefreshCw,
      gradient: "from-blue-500 to-cyan-600",
      shadow: "shadow-blue-500/25",
    },
    {
      label: "Đã thanh lý",
      value: stats.settled,
      icon: FileCheck2,
      gradient: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/25",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-linear-to-br from-slate-50 to-slate-100/50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Hợp đồng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hợp đồng thuê phòng</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tạo hợp đồng</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} p-5 rounded-2xl shadow-lg ${stat.shadow} hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-white mb-0.5">{stat.value}</p>
                <p className="text-xs font-medium text-white/80">{stat.label}</p>
              </div>
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute -right-3 -bottom-3 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          </motion.div>
        ))}
      </div>

      {/* Tabs + Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        {/* Tab nav */}
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
                placeholder="Tìm kiếm số hợp đồng, tên khách..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="Từ ngày"
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none min-w-[160px]"
              >
                <option value="">Chọn giai đoạn</option>
                <option value="active">Đang hiệu lực</option>
                <option value="extended">Đã gia hạn</option>
                <option value="settled">Đã thanh lý</option>
                <option value="pending">Chờ xác nhận</option>
              </select>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>
              {(search || filterStatus || fromDate || toDate) && (
                <button
                  onClick={() => { setSearch(""); setFilterStatus(""); setFromDate(""); setToDate(""); }}
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
                {["Số hợp đồng", "Tên hợp đồng", "Phòng", "Khách ở", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái", "Mã đặt phòng", ""].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                      <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                        <FileX2 className="w-10 h-10 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-700">Không có dữ liệu</p>
                        <p className="text-sm text-slate-500 mt-1">Chưa có hợp đồng nào</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                contracts.map((c, idx) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-amber-50/30 transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-sm font-semibold text-slate-700">{c.contract_number || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 max-w-[160px] truncate">{c.contract_name || "—"}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{c.room_number}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{c.tenant_name || "—"}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(c.start_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(c.end_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[c.status]}`}>
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-sm text-slate-500">{c.booking_code || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-colors text-xs font-medium">
                          Chi tiết
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
            {total === 0 ? "0-0/0" : `${(page - 1) * limit + 1}-${Math.min(page * limit, total)}/${total}`} hợp đồng
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
              return (
                <button key={pn} onClick={() => setPage(pn)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === pn ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-white"}`}>{pn}</button>
              );
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
              <div className="flex-1 p-5">
                <p className="text-sm text-slate-500">Sắp có thêm bộ lọc...</p>
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
