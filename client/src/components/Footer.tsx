import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white">
      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">

          {/* Brand */}
          <div className="lg:w-[280px] flex-shrink-0">
            <h2 className="text-5xl font-extrabold tracking-tight leading-none mb-6" style={{ fontStyle: 'italic' }}>
              Home<br />Spot
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-[240px]">
              Nền tảng tìm kiếm và cho thuê bất động sản hàng đầu Việt Nam. Kết nối chủ nhà và người thuê một cách minh bạch.
            </p>
            <p className="text-white/30 text-xs uppercase tracking-[0.2em] mt-8 font-mono">
              Phiên bản 1.0 / 2025
            </p>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-400 mb-5">
                Dịch vụ
              </h3>
              <ul className="flex flex-col gap-3">
                <li><Link to="/" className="text-sm text-white/60 hover:text-white transition-colors">Tìm phòng trọ</Link></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Đăng tin cho thuê</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Bản đồ bất động sản</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Báo giá quảng cáo</a></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-400 mb-5">
                Về chúng tôi
              </h3>
              <ul className="flex flex-col gap-3">
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Giới thiệu</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Đội ngũ</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Tuyển dụng</a></li>
                <li><Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Liên hệ</Link></li>
              </ul>
            </div>

            {/* Column 3 — Newsletter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-400 mb-5">
                Bản tin
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                Đăng ký nhận tin tức mới nhất về bất động sản và ưu đãi đặc biệt.
              </p>
              <div className="flex flex-col gap-2.5">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button className="text-sm font-bold text-white uppercase tracking-wider hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  Đăng ký ngay →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo mark */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-700 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 9v11a1 1 0 001 1h5v-6h6v6h5a1 1 0 001-1V9l-9-7z" fill="white" opacity="0.9"/>
                <circle cx="15" cy="10" r="3" fill="#34d399" stroke="white" strokeWidth="1.5"/>
                <circle cx="15" cy="10" r="1" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-extrabold text-white/80">HOMESPOT</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-white/30 uppercase tracking-wider font-mono">
            © 2025 HomeSpot. All rights reserved.
          </p>

          {/* Legal links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-white/40 uppercase tracking-wider font-bold hover:text-white/70 transition-colors">
              Điều khoản
            </a>
            <a href="#" className="text-xs text-white/40 uppercase tracking-wider font-bold hover:text-white/70 transition-colors">
              Chính sách
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
