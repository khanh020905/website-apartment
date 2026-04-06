import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../components/modals/Modal';
import TransactionForm from '../components/modals/TransactionForm';

/* ── Sidebar navigation items ─────────────────────────── */
const sidebarItems = [
  { icon: 'dashboard', label: 'Trang tổng quan', id: 'dashboard' },
  { icon: 'people', label: 'Khách hàng', id: 'customers' },
  { icon: 'room', label: 'Đặt phòng', id: 'rooms' },
  { icon: 'payment', label: 'Thanh toán', id: 'payments' },
  { icon: 'contract', label: 'Hợp đồng', id: 'contracts' },
  { icon: 'maintenance', label: 'Bảo trì', id: 'maintenance' },
  { icon: 'report', label: 'Báo cáo', id: 'reports' },
  { icon: 'settings', label: 'Quản lý', id: 'settings' },
];

/* ── Icon components ──────────────────────────────────── */
const icons: Record<string, React.ReactNode> = {
  dashboard: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" /></svg>,
  people: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  room: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" /></svg>,
  payment: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  contract: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  maintenance: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.658.002A.5.5 0 015 14.67V9.33a.5.5 0 01.762-.426l5.658 3.34a.5.5 0 010 .852zM14.25 7.5h-.096c-1.088 0-2.04.711-2.353 1.75l-1.052 3.5c-.313 1.039-1.265 1.75-2.353 1.75H8.25m13.148-5.134a.5.5 0 01.502.86l-5.647 3.289a.5.5 0 01-.502-.86l5.647-3.289z" /></svg>,
  report: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  settings: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  help: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>,
};

/* ── Mock data ──────────────────────────────────────── */
const overdueInvoices = [
  { id: 'INV0052', room: 'P102', building: 'Trương Quyền', tenant: 'Huỳnh Minh Huy', phone: '038590785', date: '03/02/2024', amount: 4044000, avatar: 'https://i.pravatar.cc/40?img=11' },
  { id: 'INV0060', room: 'P104', building: 'Trương Quyền', tenant: 'Nguyễn Hồng H...', phone: '038669534', date: '03/02/2024', amount: 3992000, avatar: 'https://i.pravatar.cc/40?img=12' },
  { id: 'INV0062', room: 'P201', building: 'Trương Quyền', tenant: 'Nguyễn Hà Hoà...', phone: '038541789', date: '05/02/2024', amount: 3852000, avatar: 'https://i.pravatar.cc/40?img=14' },
  { id: 'INV0012', room: 'P101', building: 'Trường Chinh', tenant: 'Hà Hoài Anh', phone: '035269656', date: '12/03/2026', amount: 3880000, avatar: 'https://i.pravatar.cc/40?img=16' },
];

const occupancyData = [
  { day: '01/03', val: 3 }, { day: '03/03', val: 4 }, { day: '05/03', val: 3 },
  { day: '07/03', val: 5 }, { day: '09/03', val: 4 }, { day: '11/03', val: 8 },
  { day: '13/03', val: 6 }, { day: '15/03', val: 5 }, { day: '17/03', val: 4 },
  { day: '19/03', val: 3 }, { day: '21/03', val: 4 }, { day: '23/03', val: 3 },
  { day: '25/03', val: 5 }, { day: '27/03', val: 4 }, { day: '29/03', val: 3 },
  { day: '31/03', val: 4 },
];

/* ── Stat Card ────────────────────────────────────────── */
function StatCard({ icon, iconBg, value, subtitle, badge }: {
  icon: React.ReactNode; iconBg: string; value: string; subtitle: string; badge?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          {badge && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{badge}</span>
          )}
        </div>
        <p className="text-sm text-slate-500 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

/* ── Simple SVG Line Chart ────────────────────────────── */
function OccupancyChart() {
  const maxVal = Math.max(...occupancyData.map(d => d.val));
  const chartH = 200;
  const chartW = 700;
  const padding = 40;
  const graphW = chartW - padding * 2;
  const graphH = chartH - 40;

  const points = occupancyData.map((d, i) => {
    const x = padding + (i / (occupancyData.length - 1)) * graphW;
    const y = chartH - 20 - (d.val / maxVal) * graphH;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Tỷ lệ lấp đầy theo thời gian</h3>
          <span className="text-xs text-emerald-600">(trung bình 10%)</span>
        </div>
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white">
          <option>Tháng này</option>
          <option>Tháng trước</option>
          <option>3 tháng</option>
        </select>
      </div>

      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[200px]">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = chartH - 20 - (pct / 100) * graphH;
          return (
            <g key={pct}>
              <line x1={padding} y1={y} x2={chartW - padding} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <text x={padding - 8} y={y + 4} textAnchor="end" className="text-[10px]" fill="#94a3b8">{pct}%</text>
            </g>
          );
        })}

        {/* Line */}
        <polyline fill="none" stroke="#f59e0b" strokeWidth={2} points={points} strokeLinejoin="round" />

        {/* Dots */}
        {occupancyData.map((d, i) => {
          const x = padding + (i / (occupancyData.length - 1)) * graphW;
          const y = chartH - 20 - (d.val / maxVal) * graphH;
          return <circle key={i} cx={x} cy={y} r={3.5} fill="#f59e0b" stroke="white" strokeWidth={2} />;
        })}

        {/* X labels */}
        {occupancyData.map((d, i) => {
          const x = padding + (i / (occupancyData.length - 1)) * graphW;
          return (
            <text key={i} x={x} y={chartH - 4} textAnchor="middle" className="text-[9px]" fill="#94a3b8">
              {d.day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Empty State ──────────────────────────────────────── */
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h4 className="text-base font-bold text-slate-700 mb-1">{title}</h4>
      <p className="text-sm text-slate-400 text-center max-w-[280px]">{description}</p>
    </div>
  );
}

/* ── Main Dashboard Component ─────────────────────────── */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateTransaction = (data: any) => {
    console.log("Creating transaction from dashboard:", data);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`${sidebarCollapsed ? 'w-[68px]' : 'w-[220px]'} bg-white border-r border-slate-100 flex flex-col h-full transition-all duration-300 flex-shrink-0`}
      >
        <div className="flex items-center justify-end px-3 pt-4 pb-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex-shrink-0">{icons[item.icon]}</span>
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-2 pb-4 pt-2 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer">
            <span className="flex-shrink-0">{icons.help}</span>
            {!sidebarCollapsed && <span>Hỗ trợ</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
          <select className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 min-w-[160px] cursor-pointer">
            <option>Mọi toà nhà</option>
            <option>Toà A</option>
            <option>Toà B</option>
          </select>

          <div className="flex-1 max-w-[320px] relative">
            <input
              type="text"
              placeholder="Tìm kiếm bằng tên khách, ..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white"
            />
            <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          <div className="flex-1" />

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Thu nhập
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
            Chi phí
          </button>

          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-8 max-w-[1200px]">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trang tổng quan</h1>
            <div className="flex items-center gap-3">
              <select className="text-sm border border-slate-200 rounded-xl px-4 py-2 text-slate-600 bg-white font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-emerald-500/20">
                <option>Khoảng thời gian: Tất cả</option>
                <option>Hôm nay</option>
                <option>Tháng này</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>}
              iconBg="bg-emerald-50" value="9/34" subtitle="Phòng đang sử dụng"
            />
            <StatCard
              icon={<svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>}
              iconBg="bg-slate-100" value="25/34" subtitle="Phòng trống"
            />
            <StatCard
              icon={<svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              iconBg="bg-amber-50" value="0" subtitle="Phòng sắp bắt đầu" badge="Hôm nay"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>}
              iconBg="bg-blue-50" value="0" subtitle="Phòng sắp đến hạn trả" badge="Hôm nay"
            />
            <StatCard
              icon={<svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>}
              iconBg="bg-orange-50" value="1" subtitle="Hoá đơn sắp hết hạn" badge="3 ngày tới"
            />
            <StatCard
              icon={<svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>}
              iconBg="bg-purple-50" value="0" subtitle="Visa sắp hết hạn" badge="Tháng này"
            />
          </div>

          <OccupancyChart />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Nhắc nhở tạo hoá đơn (0)
              </h3>
              <EmptyState title="Tất cả đã xong" description="Không có hóa đơn nào cần tạo ngay lúc này." />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                 Xem phòng hôm nay (0)
              </h3>
              <EmptyState title="Lịch trống" description="Hôm nay chưa có yêu cầu xem phòng nào." />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Sự cố báo về (0)
                </h3>
              </div>
              <EmptyState title="Yên bình" description="Chưa có báo cáo sự cố nào từ cư dân." />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                 Hóa đơn quá hạn ({overdueInvoices.length})
              </h3>
              <div className="space-y-4">
                {overdueInvoices.map(inv => (
                  <div key={inv.id} className="group border border-slate-50 rounded-2xl p-4 hover:bg-slate-50 transition-all hover:border-emerald-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-emerald-600">#{inv.id}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{inv.room}</span>
                      </div>
                      <button className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                        Thu tiền
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={inv.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{inv.tenant}</p>
                          <p className="text-[10px] font-medium text-slate-400">{inv.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{inv.amount.toLocaleString()}đ</p>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Quá hạn từ {inv.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center py-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Smartos Property Management &copy; 2026</p>
          </div>
        </div>
      </motion.main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo giao dịch thu/chi"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleCreateTransaction}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
