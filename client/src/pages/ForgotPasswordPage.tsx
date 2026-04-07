import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (error) throw error;
			setSuccess(true);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex-1 flex items-center justify-center bg-slate-50 p-6 min-h-[calc(100vh-64px)]">
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-112.5 bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100"
			>
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-8 h-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-extrabold text-slate-900 mb-2">Quên mật khẩu?</h1>
					<p className="text-sm text-slate-500">
						Nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
					</p>
				</div>

				{error && (
					<div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
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

				{success ?
					<div className="text-center space-y-6">
						<div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
							<p className="text-sm text-emerald-800 font-medium leading-relaxed">
								Email khôi phục đã được gửi! Vui lòng kiểm tra hộp thư đến của bạn và làm theo hướng
								dẫn.
							</p>
						</div>
						<Link
							to="/login"
							className="inline-block w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm transition-all"
						>
							Quay lại đăng nhập
						</Link>
					</div>
				:	<form
						onSubmit={handleReset}
						className="space-y-6"
					>
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
								className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-700/10 transition-all"
							/>
						</div>

						<motion.button
							whileHover={{ scale: 1.01, y: -1 }}
							whileTap={{ scale: 0.99 }}
							type="submit"
							disabled={loading}
							className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-900/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{loading ? "Đang xử lý..." : "Gửi yêu cầu khôi phục"}
						</motion.button>

						<Link
							to="/login"
							className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-emerald-700 font-medium transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							Quay lại đăng nhập
						</Link>
					</form>
				}
			</motion.div>
		</div>
	);
};

export default ForgotPasswordPage;
