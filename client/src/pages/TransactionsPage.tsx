import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  CheckSquare,
  Settings2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { useBuilding } from "../contexts/BuildingContext";
import { useLocation, useNavigate } from "react-router-dom";

interface Transaction {
  id: string;
  code: string;
  date: string;
  location: string;
  room: string;
  customer: string;
  booking_id: string;
  type: string;
  category: string;
  pay_type: string;
  amount: number;
  flow: "income" | "expense";
  status: "confirmed" | "pending" | "cancelled";
  note: string;
  created_by: string;
}

interface ProofPayment {
  id: string;
  invoice: string;
  room: string;
  customer: string;
  date_requested: string;
  status: "pending" | "approved" | "rejected";
  attachment_url: string;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const formatDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN");
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1", code: "GD-001", date: "2025-01-15", location: "Toà nhà A",
    room: "101", customer: "Nguyễn Văn A", booking_id: "BK-001",
    type: "Tiền thuê", category: "Doanh thu", pay_type: "Chuyển khoản",
    amount: 4500000, flow: "income", status: "confirmed", note: "", created_by: "Admin",
  },
  {
    id: "2", code: "GD-002", date: "2025-01-16", location: "Toà nhà A",
    room: "102", customer: "Trần Thị B", booking_id: "BK-002",
    type: "Điện nước", category: "Tiện ích", pay_type: "Tiền mặt",
    amount: 320000, flow: "income", status: "pending", note: "", created_by: "Admin",
  },
  {
    id: "3", code: "GD-003", date: "2025-01-17", location: "Toà nhà B",
    room: "201", customer: "", booking_id: "",
    type: "Sửa chữa", category: "Chi phí vận hành", pay_type: "Chuyển khoản",
    amount: 1200000, flow: "expense", status: "confirmed", note: "Sửa điện tầng 2", created_by: "Admin",
  },
];

const MOCK_PROOFS: ProofPayment[] = [
  {
    id: "1", invoice: "INV-001", room: "101", customer: "Nguyễn Văn A",
    date_requested: "2025-01-15", status: "pending", attachment_url: "",
  },
  {
    id: "2", invoice: "INV-002", room: "102", customer: "Trần Thị B",
    date_requested: "2025-01-16", status: "approved", attachment_url: "",
  },
];

const tabs = [
  { key: "transactions", label: "Giao dịch", icon: ArrowLeftRight, path: "/transactions" },
  { key: "proof", label: "Xác nhận thanh toán", icon: CheckSquare, path: "/proof-of-payment" },
  { key: "config", label: "Thiết lập giao dịch", icon: Settings2, path: "/transaction-config" },
];

const TX_STATUS: Record<Transaction["status"], { label: string; color: string }> = {
  confirmed: { label: "Đã xác nhận", color: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Chờ xử lý", color: "bg-amber-100 text-amber-700" },
  cancelled: { label: "Đã huỷ", color: "bg-rose-100 text-rose-700" },
};

const PROOF_STATUS: Record<ProofPayment["status"], { label: string; color: string }> = {
  pending: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Đã duyệt", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Từ chối", color: "bg-rose-100 text-rose-700" },
};

export default function TransactionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBuildingId: _ } = useBuilding();
  const [search, setSearch] = useState("");
  const [flowFilter, setFlowFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const activeTab = tabs.find((t) => t.path === location.pathname)?.key ?? "transactions";

  const transactions = MOCK_TRANSACTIONS.filter((t) => {
    if (search && !t.code.includes(search) && !t.customer.includes(search) && !t.room.includes(search)) return false;
    if (flowFilter && t.flow !== flowFilter) return false;
    return true;
  });

  const income = transactions.filter((t) => t.flow === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.flow === "expense").reduce((s, t) => s + t.amount, 0);
  const profit = income - expense;

  const statCards = [
    { label: "Lợi nhuận", value: profit, icon: Wallet, gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/25" },
    { label: "Tổng thu", value: income, icon: TrendingUp, gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/25" },
    { label: "Tổng chi", value: expense, icon: TrendingDown, gradient: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/25" },
    { label: "Số giao dịch", value: transactions.length, icon: ArrowLeftRight, gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/25", isCount: true },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Thanh toán</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý giao dịch thu chi</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Nhập Excel</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02]">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tạo giao dịch</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      {activeTab === "transactions" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
              className={`relative overflow-hidden bg-gradient-to-br ${s.gradient} p-5 rounded-2xl shadow-lg ${s.shadow} hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-black text-white mb-0.5">
                    {"isCount" in s ? s.value : formatCurrency(s.value as number)}
                  </p>
                  <p className="text-xs font-medium text-white/80">{s.label}</p>
                </div>
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <s.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="absolute -right-3 -bottom-3 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Tabs + Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        {/* Tab Nav */}
        <div className="flex items-center gap-1 p-3 border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <>
            {/* Filters */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm mã GD, phòng, khách hàng..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={flowFilter}
                    onChange={(e) => setFlowFilter(e.target.value)}
                    className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none min-w-[140px]"
                  >
                    <option value="">Tất cả loại</option>
                    <option value="income">Thu</option>
                    <option value="expense">Chi</option>
                  </select>
                  <button className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Bộ lọc</span>
                  </button>
                  {(search || flowFilter) && (
                    <button onClick={() => { setSearch(""); setFlowFilter(""); }} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
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
                    {["Mã GD", "Ngày", "Toà nhà", "Phòng", "Khách hàng", "Loại GD", "Hình thức", "Số tiền", "Trạng thái", "Ghi chú", ""].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-20 text-center text-slate-500">Không có dữ liệu</td>
                    </tr>
                  ) : (
                    transactions.map((t, idx) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-amber-50/30 transition-colors group"
                      >
                        <td className="px-4 py-3.5"><span className="font-mono text-sm font-semibold text-slate-700">{t.code}</span></td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{formatDate(t.date)}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{t.location}</td>
                        <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{t.room || "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{t.customer || "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{t.type}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{t.pay_type}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-sm font-bold ${t.flow === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                            {t.flow === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${TX_STATUS[t.status].color}`}>
                            {TX_STATUS[t.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-500 max-w-[120px] truncate">{t.note || "—"}</td>
                        <td className="px-4 py-3.5">
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-sm text-slate-600">{transactions.length} giao dịch</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg text-sm font-medium bg-amber-500 text-white">{page}</button>
                <button onClick={() => setPage((p) => p + 1)} disabled className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Proof of Payment Tab */}
        {activeTab === "proof" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  {["Hoá đơn", "Phòng", "Khách hàng", "Ngày yêu cầu", "Trạng thái", "Đính kèm", ""].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_PROOFS.map((p, idx) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-amber-50/30 transition-colors group"
                  >
                    <td className="px-4 py-3.5"><span className="font-mono text-sm font-semibold text-slate-700">{p.invoice}</span></td>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{p.room}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{p.customer}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{formatDate(p.date_requested)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${PROOF_STATUS[p.status].color}`}>
                        {PROOF_STATUS[p.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                        <Eye className="w-3.5 h-3.5" /> Xem
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.status === "pending" && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                          </button>
                          <button className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors">
                            <XCircle className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === "config" && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Loại giao dịch</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 rounded-xl text-sm font-bold">
                <Plus className="w-4 h-4" /> Thêm loại
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Tiền thuê phòng", flow: "income", active: true },
                { name: "Tiện ích (điện, nước)", flow: "income", active: true },
                { name: "Dịch vụ bổ sung", flow: "income", active: true },
                { name: "Tiền cọc", flow: "income", active: true },
                { name: "Chi phí sửa chữa", flow: "expense", active: true },
                { name: "Chi phí vận hành", flow: "expense", active: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${item.flow === "income" ? "bg-emerald-500" : "bg-rose-500"}`} />
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.flow === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {item.flow === "income" ? "Thu" : "Chi"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-600 font-medium">Đang bật</span>
                    <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-700">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
