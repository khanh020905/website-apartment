import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays,
  History,
  CalendarSearch,
  LayoutGrid, 
  Search, 
  User, 
  PlusCircle, 
  CreditCard, 
  ShieldCheck, 
  Mail,
  Home,
  LogOut,
  Users,
  ChevronLeft,
  Car
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AppSidebar = () => {
  const location = useLocation();
  const { user, role, canPost, isAdmin, signOut } = useAuth();
  const [isSubCollapsed, setIsSubCollapsed] = useState(false);

  const menuItems = [
    { icon: Search, label: 'Tìm kiếm', path: '/search' },
    { icon: LayoutGrid, label: 'Trang tổng quan', path: '/dashboard', show: canPost },
    { 
      icon: Users, 
      label: 'Khách hàng', 
      path: '/customers', 
      show: canPost,
      subItems: [
        { icon: User, label: 'Khách hàng', path: '/customers' },
        { icon: Car, label: 'Phương tiện', path: '/customers/vehicles' },
      ]
    },
    {
      icon: CalendarDays,
      label: 'Đặt phòng',
      path: '/bookings',
      show: canPost,
      subItems: [
        { icon: CalendarDays, label: 'Đặt phòng', path: '/bookings' },
        { icon: History, label: 'Lịch sử đặt phòng', path: '/bookings/history' },
        { icon: CalendarSearch, label: 'Lịch hẹn xem phòng', path: '/bookings/appointments' },
      ]
    },
    { icon: Home, label: 'Tin của tôi', path: '/my-listings', show: canPost },
    { icon: CreditCard, label: 'Gói dịch vụ', path: '/pricing' },
    { icon: ShieldCheck, label: 'Quản trị', path: '/admin', show: isAdmin },
    { icon: PlusCircle, label: 'Đăng tin', path: '/create-listing', show: !canPost },
    { icon: User, label: 'Hồ sơ', path: '/profile', show: !!user },
    { icon: Mail, label: 'Liên hệ', path: '/contact' },
  ];

  useEffect(() => {
    // Reset collapse state when switching to an item that doesn't have sub-items
    const activeItem = menuItems.find(item => 
      item.path === location.pathname || 
      (item.subItems && item.subItems.some(sub => sub.path === location.pathname)) ||
      (location.pathname.startsWith('/customers') && item.path === '/customers') ||
      (location.pathname.startsWith('/bookings') && item.path === '/bookings')
    );
    if (!activeItem?.subItems) {
      setIsSubCollapsed(false);
    }
  }, [location.pathname]);

  const activeItem = menuItems.find(item => 
    item.path === location.pathname || 
    (item.subItems && item.subItems.some(sub => sub.path === location.pathname)) ||
    (location.pathname.startsWith('/customers') && item.path === '/customers') ||
    (location.pathname.startsWith('/bookings') && item.path === '/bookings')
  );

  const hasSubItems = activeItem?.subItems;

  return (
    <div className="flex h-full flex-shrink-0 z-50">
      {/* Primary Sidebar - Dark */}
      <div className="w-[260px] h-full bg-[#1e2329] flex flex-col text-white z-20 relative">
        {/* Brand/Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-[#fcd34d] rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-yellow-500/20 flex-shrink-0">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-cover rounded-lg" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic truncate">HomeSpot</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          {menuItems.filter(item => item.show !== false).map((item) => {
            const isActive = location.pathname === item.path || 
                          (item.subItems && item.subItems.some(sub => sub.path === location.pathname)) ||
                          (location.pathname.startsWith('/customers') && item.path === '/customers') ||
                          (location.pathname.startsWith('/bookings') && item.path === '/bookings');
            return (
              <div key={item.path} className="relative group">
                <Link 
                  to={item.subItems ? item.subItems[0].path : item.path}
                  onClick={() => setIsSubCollapsed(false)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? 'bg-[#fcd34d] text-black shadow-xl shadow-yellow-900/10' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-slate-400 group-hover:text-white'} transition-colors`} strokeWidth={2.5} />
                  <span className={`tracking-wide ${isActive ? 'text-black' : ''}`}>{item.label}</span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-black rounded-l-full"
                    />
                  )}
                </Link>

                {isActive && hasSubItems && isSubCollapsed && (
                  <button 
                    onClick={() => setIsSubCollapsed(false)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1e2329] hover:bg-teal-400 transition-colors cursor-pointer z-30"
                  >
                    <motion.div
                      animate={{ rotate: 180 }}
                      className="text-white"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" strokeWidth={3} />
                    </motion.div>
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-white/5 mt-auto">
          {user ? (
            <div className="space-y-2">
              <div className="p-3 bg-white/5 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-[#fcd34d] rounded-full flex items-center justify-center text-black font-black flex-shrink-0">
                  {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate">{user.user_metadata?.full_name || 'Người dùng'}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{role}</p>
                </div>
              </div>
              <button 
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-2xl text-[13px] font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" className="flex items-center justify-center py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-all">
                Đăng nhập
              </Link>
              <Link to="/register" className="flex items-center justify-center py-3 bg-[#fcd34d] text-black rounded-2xl text-xs font-bold transition-all">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Sidebar - Light */}
      <AnimatePresence mode="wait">
        {hasSubItems && !isSubCollapsed && (
          <motion.div
            key={activeItem.label}
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-[240px] h-full bg-[#f8f9fa] border-r border-slate-200 flex flex-col z-10 overflow-hidden shadow-2xl shadow-black/5"
          >
            <div className="p-6 flex items-center gap-4">
              <button 
                onClick={() => setIsSubCollapsed(true)}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-500 flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight truncate">{activeItem.label}</h2>
            </div>
            
            <div className="px-3 pt-2 space-y-1">
              {activeItem.subItems?.map((sub) => {
                const isSubActive = location.pathname === sub.path;
                return (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all ${
                      isSubActive 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <sub.icon className={`w-5 h-5 ${isSubActive ? 'text-teal-600' : 'text-slate-400'}`} strokeWidth={2.5} />
                    <span>{sub.label}</span>
                    {isSubActive && (
                      <motion.div 
                        layoutId="sub-active-indicator"
                        className="ml-auto w-1.5 h-1.5 bg-teal-500 rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppSidebar;
