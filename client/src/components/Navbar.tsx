import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut, role, canPost, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  const ROLE_LABELS: Record<string, string> = {
    user: 'Khách',
    landlord: 'Chủ trọ',
    broker: 'Môi giới',
    admin: 'Admin',
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-[56px] flex items-center justify-between px-6 z-50 relative"
      style={{ background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)' }}
    >
      {/* Left — Logo */}
      <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
        <div className="w-9 h-9 bg-emerald-700 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 9v11a1 1 0 001 1h5v-6h6v6h5a1 1 0 001-1V9l-9-7z" fill="white" opacity="0.9"/>
            <circle cx="15" cy="10" r="3" fill="#34d399" stroke="white" strokeWidth="1.5"/>
            <circle cx="15" cy="10" r="1" fill="white"/>
          </svg>
        </div>
        <span className="text-xl font-extrabold text-white tracking-tight">HomeSpot</span>
      </Link>

      {/* Center — Nav links */}
      <div className="hidden md:flex items-center gap-6">
        <Link to="/search" className={`text-sm font-medium transition-colors ${location.pathname === '/search' ? 'text-white' : 'text-white/70 hover:text-white'}`}>
          Tìm kiếm
        </Link>
        {canPost && (
          <>
            <Link to="/dashboard" className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-white' : 'text-white/70 hover:text-white'}`}>
              Bảng điều khiển
            </Link>
            <Link to="/my-listings" className={`text-sm font-medium transition-colors ${location.pathname === '/my-listings' ? 'text-white' : 'text-white/70 hover:text-white'}`}>
              Tin của tôi
            </Link>
          </>
        )}
        {isAdmin && (
          <Link to="/admin" className={`text-sm font-medium transition-colors ${location.pathname === '/admin' ? 'text-white' : 'text-white/70 hover:text-white'}`}>
            Quản trị
          </Link>
        )}
        {!canPost && !loading && (
          <Link to="/create-listing" className={`text-sm font-medium transition-colors ${location.pathname === '/create-listing' ? 'text-white' : 'text-white/70 hover:text-white'}`}>
            Đăng tin
          </Link>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-4">
        {canPost && (
          <Link to="/create-listing">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2 bg-white text-slate-900 rounded-full text-sm font-semibold hover:bg-white/90 transition-all cursor-pointer shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" />
              </svg>
              Đăng tin
            </motion.button>
          </Link>
        )}
        {!canPost && !loading && (
          <Link to="/create-listing">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2 border border-white/50 text-white rounded-full text-sm font-semibold hover:bg-white/10 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" />
              </svg>
              Đăng tin
            </motion.button>
          </Link>
        )}

        <Link to="/contact" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Liên hệ
        </Link>

        {loading ? null : user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-white/30 transition-all">
                {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
              <span className="hidden md:block text-xs text-emerald-300 font-semibold">{ROLE_LABELS[role] || role}</span>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-white rounded-xl shadow-xl shadow-black/10 border border-slate-100 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {user.user_metadata?.full_name || 'Người dùng'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                      {ROLE_LABELS[role] || role}
                    </span>
                  </div>

                  <div className="py-1">
                    {canPost && (
                      <>
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
                          </svg>
                          Bảng điều khiển
                        </Link>
                        <Link to="/my-listings" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          Tin đăng của tôi
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        Quản trị
                      </Link>
                    )}
                    <Link to="/search" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      Tìm kiếm nâng cao
                    </Link>
                    <Link to="/create-listing" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Đăng tin cho thuê
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <Link to="/login" className={`text-sm font-medium transition-colors ${
              location.pathname === '/login' ? 'text-white underline underline-offset-4' : 'text-white/80 hover:text-white'
            }`}>
              Đăng nhập
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-1.5 text-sm rounded-lg font-semibold transition-all cursor-pointer ${
                  location.pathname === '/register'
                    ? 'bg-white text-emerald-900'
                    : 'border border-white/50 text-white hover:bg-white/10'
                }`}
              >
                Đăng ký
              </motion.button>
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
