import { useState } from "react";
import { 
  Search, 
  Settings2,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingHistoryPage() {
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [status, setStatus] = useState<string[]>([]);
  const [payStatus, setPayStatus] = useState<string[]>([]);
  const [packages, setPackages] = useState<string[]>([]);
  const [taxOnly, setTaxOnly] = useState(false);

  const toggleArray = (arr: string[], val: string, setFn: (v: string[]) => void) => {
    if (arr.includes(val)) setFn(arr.filter((x) => x !== val));
    else setFn([...arr, val]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Lịch sử đặt phòng</h1>
        </div>
        
        {/* Toolbar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[280px] flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm bằng mã đặt phòng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all hover:border-slate-300"
            />
          </div>

          <div className="relative w-full sm:w-auto flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden hover:border-slate-300 transition-colors">
            <input 
              type="text"
              placeholder="Từ ngày"
              className="w-24 px-3 py-2 text-sm text-slate-600 outline-none placeholder:text-slate-400"
              readOnly
            />
            <span className="text-slate-300">→</span>
            <input 
              type="text"
              placeholder="Đến ngày"
              className="w-24 px-3 py-2 text-sm text-slate-600 outline-none placeholder:text-slate-400"
              readOnly
            />
            <div className="px-3 border-l border-slate-100 flex items-center justify-center h-full hover:bg-slate-50 cursor-pointer">
               <Calendar className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="w-full sm:w-40 flex-shrink-0">
             <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all cursor-pointer hover:border-slate-300 appearance-none">
               <option value="">Trạng thái</option>
               <option value="confirmed">Đã xác nhận</option>
               <option value="active">Đang sử dụng</option>
               <option value="completed">Đã hoàn thành</option>
               <option value="cancelled">Đã huỷ</option>
             </select>
          </div>

          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer ml-auto"
          >
            <Settings2 className="w-4 h-4" />
            Bộ lọc
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-[#f8f9fa] p-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8f9fa] border-b border-slate-200">
                <tr>
                  {["Mã đặt phòng", "Phòng", "Loại phòng", "Gói", "Khách hàng đại diện", "Trạng thái", ""].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-[12px] font-bold text-slate-600 tracking-wide whitespace-nowrap">
                      {h} {h && <span className="inline-block ml-1 opacity-50">↕</span>}
                    </th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {/* Empty State */}
                <tr>
                  <td colSpan={8} className="px-6 py-28 text-center bg-white">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                        <svg className="w-12 h-12 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5c-.83 0-1.5-.67-1.5-1.5S9.17 11.5 10 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 11.5 14 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                        </svg>
                      </div>
                      <p className="text-base font-bold text-slate-700">Không có dữ liệu</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="mt-auto px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-4 text-sm text-slate-600">
             <span>0-0/0</span>
             <div className="flex items-center gap-1">
               <button className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400" disabled>
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <button className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 text-slate-400" disabled>
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
             <select className="px-2 py-1 outline-none border border-slate-200 rounded cursor-pointer text-slate-600 bg-white hover:border-slate-300">
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
                <h2 className="text-lg font-bold text-slate-900">Lọc</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Dịch vụ */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Dịch vụ</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                    <span className="text-sm text-slate-600">Duplex</span>
                  </label>
                </div>

                {/* Trạng thái */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Trạng thái</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["Đã xác nhận", "Đã hoàn thành", "Đang sử dụng", "Đã huỷ"].map(item => (
                      <label key={item} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={status.includes(item)}
                          onChange={() => toggleArray(status, item, setStatus)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" 
                        />
                        <span className="text-sm text-slate-600">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Trạng thái thanh toán */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Trạng thái thanh toán</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["Đang nợ", "Một phần", "Chờ thanh toán", "Thu tiền kỳ tới"].map(item => (
                      <label key={item} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={payStatus.includes(item)}
                          onChange={() => toggleArray(payStatus, item, setPayStatus)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" 
                        />
                        <span className="text-sm text-slate-600">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gói */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Gói</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["Ngày", "Tháng"].map(item => (
                      <label key={item} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={packages.includes(item)}
                          onChange={() => toggleArray(packages, item, setPackages)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" 
                        />
                        <span className="text-sm text-slate-600">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Thời gian lưu trú */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Thời gian lưu trú</h3>
                  <div className="flex items-center border border-slate-200 rounded-lg px-3 hover:border-slate-300 transition-colors">
                    <input type="text" placeholder="Từ ngày" className="w-full py-2.5 text-sm outline-none text-slate-600" />
                    <span className="text-slate-300 px-2">→</span>
                    <input type="text" placeholder="Đến ngày" className="w-full py-2.5 text-sm outline-none text-slate-600" />
                    <Calendar className="w-4 h-4 text-slate-400 ml-2" />
                  </div>
                </div>

                {/* Ngày tạo */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Ngày tạo</h3>
                  <div className="flex items-center border border-slate-200 rounded-lg px-3 hover:border-slate-300 transition-colors">
                    <input type="text" placeholder="Từ ngày" className="w-full py-2.5 text-sm outline-none text-slate-600" />
                    <span className="text-slate-300 px-2">→</span>
                    <input type="text" placeholder="Đến ngày" className="w-full py-2.5 text-sm outline-none text-slate-600" />
                    <Calendar className="w-4 h-4 text-slate-400 ml-2" />
                  </div>
                </div>

                {/* Người tạo */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Người tạo</h3>
                  <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white outline-none hover:border-slate-300 cursor-pointer">
                    <option value="">Chọn người tạo</option>
                  </select>
                </div>

                {/* Thuế toggle */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-slate-800">Chỉ hiển thị đặt phòng áp dụng thuế</span>
                  <button 
                    onClick={() => setTaxOnly(!taxOnly)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${taxOnly ? 'bg-amber-400' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${taxOnly ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              {/* Slider Footer */}
              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={() => {
                    setStatus([]); setPayStatus([]); setPackages([]); setTaxOnly(false);
                  }}
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
    </div>
  );
}

