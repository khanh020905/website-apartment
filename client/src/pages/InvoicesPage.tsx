import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Settings2,
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
  Settings,
} from "lucide-react";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";
import Modal from "../components/modals/Modal";
import InvoiceForm from "../components/modals/InvoiceForm";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleCreateInvoice = (data: any) => {
    console.log("Creating invoice:", data);
    setIsModalOpen(false);
  };

  const statCards = [
    {
      label: "Tổng số hóa đơn",
      value: stats.total,
      icon: Receipt,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      label: "Đã thanh toán",
      value: stats.paid,
      icon: CheckCircle2,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Chờ thanh toán",
      value: stats.pending,
      icon: Clock,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Quá hạn",
      value: stats.overdue,
      icon: AlertCircle,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Hóa đơn</h1>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất dữ liệu</span>
          </button>
        </div>
        
        {/* Toolbar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[320px] flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm mã hóa đơn, phòng, tên khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-700 whitespace-nowrap">Kỳ hóa đơn:</span>
            <input 
               type="month"
               className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer font-medium text-[13px]"
            />
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
             <select 
               value={filterStatus} 
               onChange={(e) => setFilterStatus(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 hover:border-slate-300 transition-all cursor-pointer appearance-none font-medium text-[13px]"
             >
               <option value="">Trạng thái hóa đơn</option>
               <option value="draft">Bản nháp</option>
               <option value="pending">Chờ xác nhận</option>
               <option value="overdue">Quá hạn</option>
               <option value="cancelled">Đã huỷ</option>
               <option value="paid">Đã thanh toán</option>
               <option value="partial">Một phần</option>
             </select>
          </div>

          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
            Bộ lọc
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-colors hover:bg-amber-500 shadow-sm ml-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 font-bold" /> Hóa đơn
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
        
        {/* Stats Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg} transition-transform group-hover:scale-110`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-slate-500">{stat.label}</p>
                <p className="text-[20px] font-bold text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table Area */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-[400px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full h-full text-left">
              <thead className="bg-[#f8f9fa] border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3.5 w-10">
                    <input type="checkbox" className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4" />
                  </th>
                  {[
                    "Mã hóa đơn", "Phòng", "Trạng thái", "Hạn thanh toán",
                    "Phụ thu", "Giảm trừ", "Tổng cộng", "Tệp đính kèm", "Khách hàng", "HT hóa đơn VAT", "Người tạo"
                  ].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap">
                      {h} <span className="inline-block ml-1 opacity-50">↕</span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 w-10 text-center">
                    <Settings className="w-4 h-4 text-slate-400 inline-block" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-20 text-center bg-white cursor-default">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500">Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-28 text-center bg-white cursor-default">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                          <svg className="w-12 h-12 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5c-.83 0-1.5-.67-1.5-1.5S9.17 11.5 10 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 11.5 14 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                          </svg>
                        </div>
                        <p className="text-[15px] font-bold text-slate-700">Không có dữ liệu hóa đơn</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, idx) => (
                    <tr key={inv.id} className="hover:bg-amber-50/20 transition-colors group cursor-pointer">
                      <td className="px-5 py-3.5">
                        <input type="checkbox" className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer" />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[13px] font-bold text-blue-600 truncate">{inv.code}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] font-bold text-slate-700">{inv.room_number}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${STATUS_COLORS[inv.status]}`}>
                          {STATUS_LABELS[inv.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(inv.due_date)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-slate-600">
                        {inv.extra_charge > 0 ? formatCurrency(inv.extra_charge) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-slate-600">
                        {inv.discount > 0 ? formatCurrency(inv.discount) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] font-bold text-slate-900">{formatCurrency(inv.total)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-500">
                         —
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">{inv.customer_name || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[12px] font-bold ${inv.has_vat ? "text-emerald-600" : "text-slate-400"}`}>
                          {inv.has_vat ? "Có VAT" : "Không"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">{inv.creator || "—"}</td>
                      <td className="px-5 py-3.5 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-blue-600 hover:underline text-[12px] font-semibold">Chi tiết</button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-600 shrink-0">
             <span>{total === 0 ? "0-0/0" : `${(page - 1) * limit + 1}-${Math.min(page * limit, total)}/${total}`} kết quả</span>
             <div className="flex items-center gap-1">
               <button 
                 onClick={() => setPage((p) => Math.max(1, p - 1))}
                 disabled={page === 1}
                 className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"
               >
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                 disabled={page === totalPages || totalPages === 0}
                 className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400 transition-colors"
               >
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
             <select className="px-2 py-1 outline-none border border-slate-200 rounded cursor-pointer text-slate-600 bg-white hover:border-slate-300 appearance-none font-medium text-[13px]">
               <option>20 / trang</option>
               <option>50 / trang</option>
             </select>
          </div>
        </div>
      </div>

      {/* Advanced Filter Sidebar */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-[400px] h-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <h2 className="text-lg font-bold text-slate-900">Bộ lọc nâng cao</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                 {/* Kỳ hóa đơn */}
                 <div>
                   <h3 className="text-[13px] font-bold text-slate-900 mb-3">Kỳ hóa đơn</h3>
                   <input type="month" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-amber-400" />
                 </div>

                 <hr className="border-slate-100" />

                 {/* Trạng thái */}
                 <div>
                   <h3 className="text-[13px] font-bold text-slate-900 mb-3">Trạng thái</h3>
                   <div className="grid grid-cols-2 gap-3">
                     {["Bản nháp", "Chờ xác nhận", "Quá hạn", "Đã huỷ", "Đã thanh toán", "Một phần"].map(st => (
                        <label key={st} className="flex items-center gap-2 cursor-pointer">
                           <input type="checkbox" className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer" />
                           <span className="text-[13px] font-medium text-slate-700">{st}</span>
                        </label>
                     ))}
                   </div>
                 </div>

                 <hr className="border-slate-100" />

                 {/* Ngày phát hành */}
                 <div>
                   <h3 className="text-[13px] font-bold text-slate-900 mb-3">Ngày phát hành</h3>
                   <div className="flex items-center gap-2">
                     <input type="date" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-amber-400" />
                     <span className="text-slate-400">-</span>
                     <input type="date" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-amber-400" />
                   </div>
                 </div>

                 {/* Hạn thanh toán */}
                 <div>
                   <h3 className="text-[13px] font-bold text-slate-900 mb-3">Hạn thanh toán</h3>
                   <div className="flex items-center gap-2">
                     <input type="date" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-amber-400" />
                     <span className="text-slate-400">-</span>
                     <input type="date" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-amber-400" />
                   </div>
                 </div>

                 <hr className="border-slate-100" />

                 {/* Tổng cộng */}
                 <div>
                   <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[13px] font-bold text-slate-900">Tổng cộng</h3>
                      <span className="text-[12px] font-bold text-blue-600">0đ - 100.000.000đ</span>
                   </div>
                   <input type="range" min="0" max="100000000" className="w-full accent-amber-500" />
                 </div>

                 <hr className="border-slate-100" />

                 {/* Người tạo */}
                 <div>
                   <h3 className="text-[13px] font-bold text-slate-900 mb-3">Người tạo</h3>
                   <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-amber-400 appearance-none">
                      <option value="">Tất cả nhân viên</option>
                      <option value="1">Admin</option>
                      <option value="2">Nguyễn Văn A</option>
                   </select>
                 </div>
              </div>

              {/* Slider Footer */}
              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={() => { setSearch(""); setFilterStatus(""); }}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  Đặt lại
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo hoá đơn mới"
        size="lg"
      >
        <InvoiceForm
          onSubmit={handleCreateInvoice}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
