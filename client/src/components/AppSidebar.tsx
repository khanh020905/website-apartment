import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Users,
  User,
  Car,
  CalendarDays,
  History,
  Package,
  Zap,
  MessageSquare,
  CalendarSearch,
  CreditCard,
  FileText,
  ArrowLeftRight,
  CheckSquare,
  Settings2,
  FileCode,
  Wrench,
  AlertTriangle,
  Tag,
  BarChart3,
  Globe,
  BookOpen,
  Activity,
  TrendingUp,
  Building2,
  Settings,
  Info,
  MapPin,
  Plug,
  Shield,
  Box,
  Cog,
  Truck,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SubItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  show?: boolean;
  matchPaths?: string[];
  subItems?: SubItem[];
}

const AppSidebar = () => {
  const location = useLocation();
  const { user, role, canPost, signOut } = useAuth();
  const [isSubCollapsed, setIsSubCollapsed] = useState(false);

  const menuItems: MenuItem[] = [
    {
      icon: LayoutGrid,
      label: 'Trang tổng quan',
      path: '/dashboard',
      show: canPost,
      matchPaths: ['/dashboard'],
    },
    {
      icon: Users,
      label: 'Khách hàng',
      path: '/customers',
      show: canPost,
      matchPaths: ['/customers', '/vehicles'],
      subItems: [
        { icon: User, label: 'Khách hàng', path: '/customers' },
        { icon: Car, label: 'Phương tiện', path: '/vehicles' },
      ],
    },
    {
      icon: CalendarDays,
      label: 'Đặt phòng',
      path: '/reservations',
      show: canPost,
      matchPaths: [
        '/reservations',
        '/reservation-history',
        '/extra-services',
        '/utilities',
        '/messages',
        '/visitTours',
      ],
      subItems: [
        { icon: CalendarDays, label: 'Đặt phòng', path: '/reservations' },
        { icon: History, label: 'Lịch sử đặt phòng', path: '/reservation-history' },
        { icon: Package, label: 'Dịch vụ bổ sung', path: '/extra-services' },
        { icon: Zap, label: 'Tiện ích', path: '/utilities' },
        { icon: MessageSquare, label: 'Yêu cầu', path: '/messages' },
        { icon: CalendarSearch, label: 'Lịch hẹn xem phòng', path: '/visitTours' },
      ],
    },
    {
      icon: CreditCard,
      label: 'Thanh toán',
      path: '/invoices',
      show: canPost,
      matchPaths: ['/invoices', '/transactions', '/proof-of-payment', '/transaction-config'],
      subItems: [
        { icon: FileText, label: 'Hóa đơn', path: '/invoices' },
        { icon: ArrowLeftRight, label: 'Giao dịch', path: '/transactions' },
        { icon: CheckSquare, label: 'Xác nhận thanh toán', path: '/proof-of-payment' },
        { icon: Settings2, label: 'Thiết lập giao dịch', path: '/transaction-config' },
      ],
    },
    {
      icon: FileText,
      label: 'Hợp đồng',
      path: '/contracts',
      show: canPost,
      matchPaths: ['/contracts', '/contract-templates'],
      subItems: [
        { icon: FileText, label: 'Hợp đồng', path: '/contracts' },
        { icon: FileCode, label: 'Mẫu hợp đồng', path: '/contract-templates' },
      ],
    },
    {
      icon: Wrench,
      label: 'Bảo trì',
      path: '/incidents',
      show: canPost,
      matchPaths: ['/incidents', '/incident-types'],
      subItems: [
        { icon: AlertTriangle, label: 'Sự cố', path: '/incidents' },
        { icon: Tag, label: 'Loại sự cố', path: '/incident-types' },
      ],
    },
    {
      icon: Package,
      label: 'Quản lý tài sản',
      path: '/assets/id-base',
      show: canPost,
      matchPaths: ['/assets/id-base', '/assets/quantity-base'],
      subItems: [
        { icon: Package, label: 'Tài sản', path: '/assets/id-base' },
        { icon: BarChart3, label: 'Tài sản (số lượng)', path: '/assets/quantity-base' },
      ],
    },
    {
      icon: Globe,
      label: 'Cộng đồng',
      path: '/events',
      show: canPost,
      matchPaths: ['/events', '/posts', '/blogs'],
      subItems: [
        { icon: CalendarDays, label: 'Sự kiện', path: '/events' },
        { icon: FileText, label: 'Bài viết', path: '/posts' },
        { icon: BookOpen, label: 'Blogs', path: '/blogs' },
      ],
    },
    {
      icon: BarChart3,
      label: 'Báo cáo',
      path: '/operation/occupancy-rate',
      show: canPost,
      matchPaths: [
        '/operation/occupancy-rate',
        '/customer-report',
        '/revenues',
        '/for-owner',
      ],
      subItems: [
        { icon: Activity, label: 'Vận hành', path: '/operation/occupancy-rate' },
        { icon: Users, label: 'Khách hàng', path: '/customer-report' },
        { icon: TrendingUp, label: 'Doanh thu', path: '/revenues' },
        { icon: Building2, label: 'Cho chủ doanh nghiệp', path: '/for-owner' },
      ],
    },
    {
      icon: Settings,
      label: 'Quản lý',
      path: '/business-information',
      show: canPost,
      matchPaths: [
        '/business-information',
        '/locations',
        '/integrations',
        '/users',
        '/roles',
        '/asset-groups',
        '/asset-types',
        '/services',
        '/suppliers',
      ],
      subItems: [
        { icon: Info, label: 'Thông tin chung', path: '/business-information' },
        { icon: Building2, label: 'Toà nhà', path: '/locations' },
        { icon: Cog, label: 'Dịch vụ', path: '/services' },
        { icon: Users, label: 'Người dùng & vai trò', path: '/users' },
        { icon: Plug, label: 'Tích hợp', path: '/integrations' },
        { icon: Box, label: 'Nhóm tài sản', path: '/asset-groups' },
        { icon: Tag, label: 'Loại tài sản', path: '/asset-types' },
        { icon: Truck, label: 'Nhà cung cấp', path: '/suppliers' },
        { icon: Shield, label: 'Vai trò', path: '/roles' },
      ],
    },
    {
      icon: MapPin,
      label: 'Hỗ trợ',
      path: '/contact',
      matchPaths: ['/contact'],
    },
  ];

  const getIsActive = (item: MenuItem) => {
    const paths = item.matchPaths ?? [item.path];
    return (
      location.pathname === item.path ||
      paths.some(
        (p) =>
          location.pathname === p ||
          location.pathname.startsWith(p + '/')
      ) ||
      (item.subItems &&
        item.subItems.some((sub) => location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')))
    );
  };

  const activeItem = menuItems.find((item) => getIsActive(item));
  const hasSubItems = activeItem?.subItems;

  useEffect(() => {
    if (!hasSubItems) {
      setIsSubCollapsed(false);
    }
  }, [location.pathname, hasSubItems]);

  return (
    <div className="flex h-full flex-shrink-0 z-50">
      {/* Primary Sidebar - Dark */}
      <div className="w-[68px] h-full bg-[#1e2329] flex flex-col text-white z-20 relative">
        {/* Brand/Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/5">
          <div className="w-10 h-10 bg-[#fcd34d] rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-yellow-500/20 flex-shrink-0">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-cover rounded-lg" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          {menuItems
            .filter((item) => item.show !== false)
            .map((item) => {
              const isActive = getIsActive(item);
              return (
                <div
                  key={item.path}
                  className="relative group"
                >
                  <Link
                    to={item.subItems ? item.subItems[0].path : item.path}
                    onClick={() => setIsSubCollapsed(false)}
                    title={item.label}
                    className={`flex items-center justify-center w-12 h-12 mx-auto rounded-2xl transition-all duration-200 relative ${
                      isActive
                        ? 'bg-[#fcd34d] text-black shadow-lg shadow-yellow-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${isActive ? 'text-black' : 'text-slate-400 group-hover:text-white'} transition-colors`}
                      strokeWidth={2.5}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-black rounded-l-full"
                      />
                    )}
                  </Link>

                  {/* Tooltip */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                  </div>

                  {isActive && hasSubItems && isSubCollapsed && (
                    <button
                      onClick={() => setIsSubCollapsed(false)}
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1e2329] hover:bg-teal-400 transition-colors cursor-pointer z-30"
                    >
                      <motion.div animate={{ rotate: 180 }} className="text-white">
                        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={3} />
                      </motion.div>
                    </button>
                  )}
                </div>
              );
            })}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-2 border-t border-white/5 mt-auto">
          {user ? (
            <div className="space-y-1">
              <div className="w-12 h-12 mx-auto bg-[#fcd34d] rounded-full flex items-center justify-center text-black font-black text-sm cursor-default" title={user.user_metadata?.full_name || user.email || 'User'}>
                {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
              <button
                onClick={signOut}
                title="Đăng xuất"
                className="w-12 h-12 mx-auto flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-2xl transition-all cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="w-12 h-12 mx-auto flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl text-xs font-bold transition-all"
              title="Đăng nhập"
            >
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Secondary Sidebar - Light */}
      <AnimatePresence mode="wait">
        {hasSubItems && !isSubCollapsed && (
          <motion.div
            key={activeItem?.label}
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-[220px] h-full bg-[#f8f9fa] border-r border-slate-200 flex flex-col z-10 overflow-hidden shadow-2xl shadow-black/5"
          >
            <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-100">
              <button
                onClick={() => setIsSubCollapsed(true)}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-500 flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <h2 className="text-base font-bold text-slate-900 tracking-tight truncate">
                {activeItem?.label}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
              {activeItem?.subItems?.map((sub) => {
                const isSubActive =
                  location.pathname === sub.path ||
                  location.pathname.startsWith(sub.path + '/');
                return (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                      isSubActive
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <sub.icon
                      className={`w-4 h-4 flex-shrink-0 ${isSubActive ? 'text-brand-primary' : 'text-slate-400'}`}
                      strokeWidth={2.5}
                    />
                    <span className="truncate">{sub.label}</span>
                    {isSubActive && (
                      <motion.div
                        layoutId="sub-active-indicator"
                        className="ml-auto w-1.5 h-1.5 bg-brand-primary rounded-full flex-shrink-0"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User info in secondary sidebar */}
            {user && (
              <div className="p-3 border-t border-slate-100">
                <div className="flex items-center gap-2 px-2 py-2 bg-white rounded-xl border border-slate-100">
                  <div className="w-7 h-7 bg-[#fcd34d] rounded-full flex items-center justify-center text-black font-black text-xs flex-shrink-0">
                    {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {user.user_metadata?.full_name || 'Người dùng'}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold truncate">
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppSidebar;
