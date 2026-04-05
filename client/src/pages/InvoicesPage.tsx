import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  Search,
  Calendar,
} from "lucide-react";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";

interface Invoice {
  id: string;
  code: string;
  room_number: string;
  building_name: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  due_date: string;
  extra_charge: number;
  discount: number;
  total: number;
  customer_name: string;
  has_vat: boolean;
  creator: string;
  created_at: string;
}

interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}

const STATUS_LABELS: Record<Invoice["status"], string> = {
  paid: "Đã thanh toán",
  pending: "Chờ thanh toán",
  overdue: "Quá hạn",
  cancelled: "Đã huỷ",
};

const STATUS_COLORS: Record<Invoice["status"], string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  overdue: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};

export default function InvoicesPage() {
  const { selectedBuildingId } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({ total: 0, paid: 0, pending: 0, overdue: 0 });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append("search", search);
    if (filterStatus) params.append("status", filterStatus);
    if (selectedBuildingId) params.append("building_id", selectedBuildingId);

    const { data } = await api.get<{
      invoices: Invoice[];
      total: number;
      totalPages: number;
      stats: InvoiceStats;
    }>(`/api/invoices?${params}`);

    if (data) {
      setInvoices(data.invoices ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setStats(data.stats ?? { total: 0, paid: 0, pending: 0, overdue: 0 });
    }
    setLoading(false);
  }, [page, limit, search, filterStatus, selectedBuildingId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, selectedBuildingId]);

  const statCards = [
    {
      label: "Tổng số hóa đơn",
      value: stats.total,
      icon: Receipt,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/25",
    },
    {
      label: "Đã thanh toán",
      value: stats.paid,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/25",
    },
    {
      label: "Chờ thanh toán",
      value: stats.pending,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/25",
    },
    {
      label: "Quá hạn",
      value: stats.overdue,
      icon: AlertCircle,
      gradient: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/25",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-linear-to-br from-slate-50 to-slate-100/50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Hóa đơn</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hóa đơn và thanh toán</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tạo hóa đơn</span>
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

      {/* Table section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        {/* Filters */}
        <div className="p-4 lg:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm hóa đơn, phòng, khách hàng..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 min-w-[160px] cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="overdue">Quá hạn</option>
                <option value="cancelled">Đã huỷ</option>
              </select>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>
              {(search || filterStatus) && (
                <button
                  onClick={() => { setSearch(""); setFilterStatus(""); }}
                  className="flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
                {[
                  "Mã hóa đơn", "Phòng", "Trạng thái", "Hạn thanh toán",
                  "Phụ thu", "Giảm trừ", "Tổng cộng", "Khách hàng", "HT hoá đơn VAT", "Người tạo", ""
                ].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                      <p className="text-sm font-medium text-slate-500">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                        <FileText className="w-10 h-10 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-700">Không có dữ liệu</p>
                        <p className="text-sm text-slate-500 mt-1">Chưa có hóa đơn nào</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv, idx) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-amber-50/30 transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-sm font-semibold text-slate-700">{inv.code}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-slate-700">{inv.room_number}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[inv.status]}`}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(inv.due_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">
                      {inv.extra_charge > 0 ? formatCurrency(inv.extra_charge) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">
                      {inv.discount > 0 ? formatCurrency(inv.discount) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold text-slate-800">{formatCurrency(inv.total)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{inv.customer_name || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium ${inv.has_vat ? "text-emerald-600" : "text-slate-400"}`}>
                        {inv.has_vat ? "Có VAT" : "Không"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{inv.creator || "—"}</td>
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-slate-600">
            {total === 0 ? "0-0/0" : `${(page - 1) * limit + 1}-${Math.min(page * limit, total)}/${total}`} hóa đơn
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pn: number;
              if (totalPages <= 5) pn = i + 1;
              else if (page <= 3) pn = i + 1;
              else if (page >= totalPages - 2) pn = totalPages - 4 + i;
              else pn = page - 2 + i;
              return (
                <button
                  key={pn}
                  onClick={() => setPage(pn)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === pn ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-white"}`}
                >
                  {pn}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filter drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[101] flex flex-col"
            >
              <div className="p-5 flex items-center justify-between border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Bộ lọc nâng cao</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-5 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Ngày hóa đơn (từ)</label>
                  <input type="date" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Ngày hóa đơn (đến)</label>
                  <input type="date" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 flex gap-3">
                <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                  Đặt lại
                </button>
                <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 text-sm font-bold rounded-xl hover:shadow-lg transition-all">
                  Áp dụng
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
