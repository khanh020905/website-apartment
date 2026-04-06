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
  const [isHovered, setIsHovered] = useState(false);
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
      matchPaths: ['/reservations', '/reservation-history', '/extra-services', '/utilities', '/messages', '/visitTours'],
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
      matchPaths: ['/operation/occupancy-rate', '/customer-report', '/revenues', '/for-owner'],
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
      matchPaths: ['/business-information', '/locations', '/integrations', '/users', '/roles', '/asset-groups', '/asset-types', '/services', '/suppliers'],
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
      paths.some((p) => location.pathname === p || location.pathname.startsWith(p + '/')) ||
      (item.subItems?.some((sub) => location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')))
    );
  };

  const activeItem = menuItems.find((item) => getIsActive(item));
  const hasSubItems = !!activeItem?.subItems;

  // Reset sub-collapse when navigating to an item without sub-items
  useEffect(() => {
    if (!hasSubItems) setIsSubCollapsed(false);
  }, [location.pathname, hasSubItems]);

  // Close sub panel when sidebar collapses
  useEffect(() => {
    if (!isHovered) setIsSubCollapsed(false);
  }, [isHovered]);

  const showSubPanel = isHovered && hasSubItems && !isSubCollapsed;

  return (
    <div
      className="flex h-full flex-shrink-0 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Primary Sidebar */}
      <motion.div
        animate={{ width: isHovered ? 260 : 68 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="h-full bg-[#1e2329] flex flex-col text-white z-20 relative overflow-hidden flex-shrink-0"
      >
        {/* Logo */}
        <div className="h-16 flex items-center border-b border-white/5 px-4 flex-shrink-0">
          <div className="w-10 h-10 bg-[#fcd34d] rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-yellow-500/20 flex-shrink-0">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-cover rounded-lg" />
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="ml-3 text-xl font-black tracking-tighter text-white uppercase italic truncate"
              >
                HomeSpot
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {menuItems
            .filter((item) => item.show !== false)
            .map((item) => {
              const isActive = getIsActive(item);
              return (
                <div key={item.path} className="relative">
                  <Link
                    to={item.subItems ? item.subItems[0].path : item.path}
                    onClick={() => setIsSubCollapsed(false)}
                    className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl text-[13px] font-bold transition-all duration-200 relative overflow-hidden whitespace-nowrap ${
                      isActive
                        ? 'bg-[#fcd34d] text-black shadow-xl shadow-yellow-900/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {/* Icon — fixed width so label doesn't jump */}
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-black' : 'text-slate-400'}`}
                      strokeWidth={2.5}
                    />

                    {/* Label */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.18, delay: 0.04 }}
                          className={`tracking-wide truncate ${isActive ? 'text-black' : ''}`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Active indicator pill */}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-black rounded-l-full"
                      />
                    )}
                  </Link>
                </div>
              );
            })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 mt-auto flex-shrink-0">
          {user ? (
            <div className="space-y-1">
              {/* User card */}
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="w-10 h-10 bg-[#fcd34d] rounded-full flex items-center justify-center text-black font-black flex-shrink-0"
                  title={user.user_metadata?.full_name || user.email || 'User'}
                >
                  {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm font-black truncate text-white">
                        {user.user_metadata?.full_name || 'Người dùng'}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {role}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sign out */}
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-2xl text-[13px] font-bold transition-all cursor-pointer overflow-hidden"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      Đăng xuất
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          ) : (
            <div className={`grid gap-2 ${isHovered ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <AnimatePresence mode="wait">
                {isHovered ? (
                  <motion.div
                    key="expanded-auth"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="contents"
                  >
                    <Link
                      to="/login"
                      className="flex items-center justify-center py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-all"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center py-2.5 bg-[#fcd34d] text-black rounded-2xl text-xs font-bold transition-all"
                    >
                      Đăng ký
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed-auth"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      to="/login"
                      title="Đăng nhập"
                      className="flex items-center justify-center w-10 h-10 mx-auto bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                    >
                      <User className="w-5 h-5 text-slate-400" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Secondary Sidebar — only visible when hovered + active item has sub-items */}
      <AnimatePresence>
        {showSubPanel && (
          <motion.div
            key={activeItem?.label}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-[#f8f9fa] border-r border-slate-200 flex flex-col z-10 shadow-2xl shadow-black/5 flex-shrink-0 overflow-hidden"
          >
            {/* Header */}
            <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-100 flex-shrink-0">
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

            {/* Sub-items */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
              {activeItem?.subItems?.map((sub) => {
                const isSubActive =
                  location.pathname === sub.path ||
                  location.pathname.startsWith(sub.path + '/');
                return (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
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

            {/* User chip */}
            {user && (
              <div className="p-3 border-t border-slate-100 flex-shrink-0">
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
