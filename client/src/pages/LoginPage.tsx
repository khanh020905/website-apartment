import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const LoginPage = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [remember, setRemember] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { signIn } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const { error } = await signIn(email, password);
		setLoading(false);

		if (error) {
			setError(error);
		} else {
			navigate("/");
		}
	};

	const handleGoogleLogin = async () => {
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: window.location.origin,
				},
			});
			if (error) throw error;
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Lỗi đăng nhập Google");
		}
	};

	return (
		<div className="flex-1 flex overflow-hidden bg-slate-50">
			{/* Left — Image + Testimonial */}
			<motion.div
				initial={{ x: -60, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
				className="hidden lg:flex w-[50%] relative overflow-hidden m-5 mr-0 rounded-3xl"
			>
				<img
					src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
					alt="Modern apartment"
					className="absolute inset-0 w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

				{/* Overlay content */}
				<div className="absolute bottom-0 left-0 right-0 p-8">
					<div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
						<p className="text-white/90 text-[15px] leading-relaxed mb-5 italic">
							"Tìm phòng trọ chưa bao giờ dễ dàng đến thế. Chỉ cần mở HomeSpot, chọn khu vực và ngân
							sách — mọi thứ hiện ra ngay trên bản đồ. Tiết kiệm thời gian cực kỳ!"
						</p>
						<div className="flex items-center gap-3">
							<img
								src="https://i.pravatar.cc/100?img=32"
								alt="Avatar"
								className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
							/>
							<div>
								<h4 className="text-white font-bold text-sm">Trần Đức Huy</h4>
								<p className="text-white/60 text-xs">Sinh viên Đại học Bách Khoa</p>
								<p className="text-cyan-200 text-xs font-medium">Quận Thủ Đức, TP.HCM</p>
							</div>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Right — Login Form */}
			<motion.div
				initial={{ x: 60, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
				className="flex-1 flex items-center justify-center p-8 overflow-y-auto"
			>
				<div className="w-full max-w-105">
					{/* Title */}
					<h1 className="text-3xl font-extrabold text-slate-900 mb-1.5 tracking-tight">
						Chào mừng trở lại
					</h1>
					<p className="text-sm text-slate-500 mb-8">
						Đăng nhập để tiếp tục tìm kiếm căn hộ của bạn.
					</p>

					{/* Error message */}
					{error && (
						<div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-4 h-4 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
							{error}
						</div>
					)}

					{/* Google Login */}
					<button
						type="button"
						onClick={handleGoogleLogin}
						className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all mb-6 cursor-pointer"
					>
						<svg
							className="w-5 h-5"
							viewBox="0 0 24 24"
						>
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Tiếp tục với Google
					</button>

					{/* Divider */}
					<div className="flex items-center gap-4 mb-6">
						<div className="flex-1 h-px bg-slate-200" />
						<span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
							Hoặc
						</span>
						<div className="flex-1 h-px bg-slate-200" />
					</div>

					{/* Form */}
					<form
						className="flex flex-col gap-4"
						onSubmit={handleSubmit}
					>
						{/* Email */}
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">
								Địa chỉ email
							</label>
							<input
								type="email"
								placeholder="email@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-700/10 transition-all"
							/>
						</div>

						{/* Password */}
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									placeholder="Nhập mật khẩu"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-700/10 transition-all pr-12"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
								>
									{showPassword ?
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="w-5 h-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={1.5}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
											/>
										</svg>
									:	<svg
											xmlns="http://www.w3.org/2000/svg"
											className="w-5 h-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={1.5}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
									}
								</button>
							</div>
						</div>

						{/* Remember + Forgot */}
						<div className="flex items-center justify-between">
							<label
								className="flex items-center gap-2.5 cursor-pointer"
								onClick={() => setRemember(!remember)}
							>
								<div
									className={`w-4.5 h-4.5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
										remember ?
											"bg-brand-primary border-brand-primary"
										:	"border-slate-300 hover:border-slate-400"
									}`}
								>
									{remember && (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="w-3 h-3 text-white"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={3}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M5 13l4 4L19 7"
											/>
										</svg>
									)}
								</div>
								<span className="text-sm text-slate-600">Ghi nhớ đăng nhập</span>
							</label>
							<a
								href="#"
								className="text-sm text-brand-dark font-medium hover:text-brand-primary transition-colors"
							>
								Quên mật khẩu?
							</a>
						</div>

						{/* Submit */}
						<motion.button
							whileHover={{ scale: 1.01, y: -1 }}
							whileTap={{ scale: 0.99 }}
							type="submit"
							disabled={loading}
							className="w-full py-3.5 bg-brand-dark hover:bg-brand-primary text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-cyan-950/20 mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{loading ? "Đang đăng nhập..." : "Đăng nhập"}
						</motion.button>
					</form>

					{/* Footer link */}
					<p className="text-center text-sm text-slate-500 mt-6">
						Chưa có tài khoản?{" "}
						<Link
							to="/register"
							className="text-brand-dark font-semibold hover:text-brand-primary underline underline-offset-2 transition-colors"
						>
							Đăng ký ngay
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};

export default LoginPage;
