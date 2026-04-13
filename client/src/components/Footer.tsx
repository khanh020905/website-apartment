import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer
			className="text-white"
			style={{ background: "linear-gradient(180deg, #0b7272 0%, #0f9b9b 55%, #0f3f4a 100%)" }}
		>
			{/* Main footer */}
			<div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
				<div className="flex flex-col lg:flex-row gap-12 lg:gap-8">
					{/* Brand */}
					<div className="lg:w-70 shrink-0">
						<div className="flex items-center gap-3 mb-5">
							<img
								src="/logo.jpg"
								alt="HomeSpot logo"
								className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/30"
							/>
							<h2
								className="text-4xl font-extrabold tracking-tight leading-none"
								style={{ fontStyle: "italic" }}
							>
								Home
								<br />
								Spot
							</h2>
						</div>
						<p className="text-white/50 text-sm leading-relaxed max-w-60">
							Nền tảng tìm kiếm và cho thuê bất động sản hàng đầu Việt Nam. Kết nối chủ nhà và người
							thuê một cách minh bạch.
						</p>
						<p className="text-white/30 text-xs uppercase tracking-[0.2em] mt-8 font-mono">
							Phiên bản 1.0 / 2025
						</p>
					</div>

					{/* Link columns */}
					<div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
						{/* Column 1 */}
						<div>
							<h3 className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-100 mb-5">
								Dịch vụ
							</h3>
							<ul className="flex flex-col gap-3">
								<li>
									<Link
										to="/"
										className="text-sm text-white/60 hover:text-white transition-colors"
									>
										Tìm phòng trọ
									</Link>
								</li>
								<li>
									<a
										href="#"
										className="text-sm text-white/60 hover:text-white transition-colors"
									>
										Đăng tin cho thuê
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-sm text-white/60 hover:text-white transition-colors"
									>
										Bản đồ bất động sản
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-sm text-white/60 hover:text-white transition-colors"
									>
										Báo giá quảng cáo
									</a>
								</li>
							</ul>
						</div>

						{/* Column 2 */}
						<div>
							<h3 className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-100 mb-5">
								Về chúng tôi
							</h3>
							<ul className="flex flex-col gap-3">
								<li>
									<a
										href="#"
										className="text-sm text-white/60 hover:text-white transition-colors"
									>
										Giới thiệu
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-sm text-white/60 hover:text-white transition-colors"
									>
										Đội ngũ
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-sm text-white/60 hover:text-white transition-colors"
									>
										Tuyển dụng
									</a>
								</li>
								<li>
									<Link
										to="/contact"
										className="text-sm text-white/60 hover:text-white transition-colors"
									>
										Liên hệ
									</Link>
								</li>
							</ul>
						</div>

						{/* Column 3 — Newsletter */}
						<div>
							<h3 className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-100 mb-5">
								Bản tin
							</h3>
							<p className="text-sm text-white/50 leading-relaxed mb-4">
								Đăng ký nhận tin tức mới nhất về bất động sản và ưu đãi đặc biệt.
							</p>
							<div className="flex flex-col gap-2.5">
								<input
									type="email"
									placeholder="Email của bạn"
									className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-200 transition-colors"
								/>
								<button className="text-sm font-bold text-white uppercase tracking-wider hover:text-cyan-100 transition-colors text-left cursor-pointer">
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
						<img
							src="/logo.jpg"
							alt="HomeSpot logo"
							className="w-7 h-7 rounded-md object-cover ring-1 ring-white/35"
						/>
						<span className="text-sm font-extrabold text-white/80">HOMESPOT</span>
					</div>

					{/* Copyright */}
					<p className="text-xs text-white/30 uppercase tracking-wider font-mono">
						© 2025 HomeSpot. All rights reserved.
					</p>

					{/* Legal links */}
					<div className="flex items-center gap-6">
						<a
							href="#"
							className="text-xs text-white/40 uppercase tracking-wider font-bold hover:text-white/70 transition-colors"
						>
							Điều khoản
						</a>
						<a
							href="#"
							className="text-xs text-white/40 uppercase tracking-wider font-bold hover:text-white/70 transition-colors"
						>
							Chính sách
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
