import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3 as _BarChart3,
  Activity,
  Users,
  TrendingUp,
  Building2,
  RefreshCw,
  Home,
  CheckSquare,
  Calendar,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { useBuilding } from "../contexts/BuildingContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OccupancyData {
  occupancy_rate: number;
  occupied_rooms: number;
  total_rooms: number;
  empty_rooms: number;
  checkins_this_month: number;
  last_updated: string;
  trend_data: { date: string; rate: number }[];
  buildings: {
    id: string;
    name: string;
    total_rooms: number;
    occupied_rooms: number;
    rate: number;
  }[];
  room_details: {
    room_number: string;
    tenant_name: string;
    booking_code: string;
    deposit: number;
    start_date: string;
    end_date: string;
    rent: number;
    checkin: string;
  }[];
}

const tabs = [
  { label: "Báo cáo", path: "/operation/occupancy-rate", icon: Activity },
  { label: "Khách hàng", path: "/customer-report", icon: Users },
  { label: "Doanh thu", path: "/revenues", icon: TrendingUp },
  { label: "Cho chủ doanh nghiệp", path: "/for-owner", icon: Building2 },
];

const formatDate = (iso: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return iso;
  }
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function ReportsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBuildingId } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OccupancyData | null>(null);

  const activeTab = location.pathname;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = selectedBuildingId ? `?building_id=${selectedBuildingId}` : "";
    const { data: res } = await api.get<OccupancyData>(`/api/reports/occupancy${params}`);
    if (res) setData(res);
    setLoading(false);
  }, [selectedBuildingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fallback demo data for display
  const displayData = data ?? {
    occupancy_rate: 0,
    occupied_rooms: 0,
    total_rooms: 0,
    empty_rooms: 0,
    checkins_this_month: 0,
    last_updated: new Date().toISOString(),
    trend_data: [],
    buildings: [],
    room_details: [],
  };

  const statCards = [
    {
      label: "Tỷ lệ lấp đầy",
      value: `${displayData.occupancy_rate}%`,
      icon: Activity,
      gradient: "from-brand-primary to-teal-600",
      shadow: "shadow-teal-500/25",
    },
    {
      label: `Phòng đang sử dụng / Tổng`,
      value: `${displayData.occupied_rooms}/${displayData.total_rooms}`,
      icon: Home,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/25",
    },
    {
      label: "Phòng trống / Tổng",
      value: `${displayData.empty_rooms}/${displayData.total_rooms}`,
      icon: Building2,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/25",
    },
    {
      label: "Nhận phòng tháng này",
      value: displayData.checkins_this_month,
      icon: CheckSquare,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/25",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-linear-to-br from-slate-50 to-slate-100/50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Báo cáo</h1>
          <p className="text-sm text-slate-500 mt-1">
            Cập nhật lần cuối: {formatDate(displayData.last_updated)}
          </p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Tab nav */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-1 p-2 border-b border-slate-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.path ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
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
                    <p className="text-2xl lg:text-3xl font-black text-white mb-0.5">{stat.value}</p>
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

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-slate-50 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Tỷ lệ lấp đầy theo thời gian</h3>
                <p className="text-sm text-slate-500">Trung bình {displayData.occupancy_rate}%</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-primary" />
                <span className="text-xs text-slate-500 font-medium">Tuần này</span>
              </div>
            </div>
            {displayData.trend_data.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={displayData.trend_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    formatter={(value) => [`${value ?? 0}%`, "Tỷ lệ lấp đầy"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#0f9b9b" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
                Chưa có dữ liệu biểu đồ
              </div>
            )}
          </motion.div>

          {/* Building breakdown table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h3 className="text-base font-bold text-slate-800 mb-3">Tỷ lệ lấp đầy theo tòa nhà</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {["Tòa nhà", "Tổng số phòng", "Tỷ lệ lấp đầy"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={3} className="px-4 py-10 text-center">
                      <div className="flex justify-center"><div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" /></div>
                    </td></tr>
                  ) : displayData.buildings.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">Không có dữ liệu</td></tr>
                  ) : (
                    displayData.buildings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{b.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{b.total_rooms} phòng</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${b.rate}%` }} />
                            </div>
                            <span className="text-sm font-bold text-brand-primary w-10 text-right">{b.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Room details */}
          {displayData.room_details.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <h3 className="text-base font-bold text-slate-800 mb-3">Chi tiết phòng</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Phòng", "Khách đại diện", "Mã đặt phòng", "Tiền cọc", "Ngày bắt đầu", "Ngày kết thúc", "Tiền phòng", "Nhận phòng"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayData.room_details.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{r.room_number}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{r.tenant_name || "—"}</td>
                        <td className="px-4 py-3 font-mono text-sm text-slate-600">{r.booking_code || "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{r.deposit > 0 ? formatCurrency(r.deposit) : "—"}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span className="text-sm text-slate-600">{formatDate(r.start_date)}</span></div></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span className="text-sm text-slate-600">{formatDate(r.end_date)}</span></div></td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">{r.rent > 0 ? formatCurrency(r.rent) : "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(r.checkin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
