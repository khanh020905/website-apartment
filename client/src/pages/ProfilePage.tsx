import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	User,
	Mail,
	Phone,
	Calendar,
	Shield,
	Camera,
	Lock,
	Key,
	Save,
	AlertCircle,
	CheckCircle2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

const ProfilePage = () => {
	const { user, updateProfile } = useAuth();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Profile State
	const [fullName, setFullName] = useState(user?.profile?.full_name || "");
	const [phone, setPhone] = useState(user?.profile?.phone || "");
	const [dob, setDob] = useState(user?.profile?.dob || "");

	// Password State
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setSuccess(null);
		setError(null);

		const result = await updateProfile({
			full_name: fullName,
			phone: phone,
			dob: dob,
		});

		setLoading(false);
		if (result.error) {
			setError(result.error);
		} else {
			setSuccess("Cập nhật hồ sơ thành công");
			setTimeout(() => setSuccess(null), 3000);
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			setError("Mật khẩu xác nhận không khớp");
			return;
		}

		setLoading(true);
		setSuccess(null);
		setError(null);

		try {
			const { error: apiError } = await api.post("/api/auth/change-password", {
				currentPassword,
				password: newPassword,
			});
			if (apiError) throw new Error(apiError);

			setSuccess("Đổi mật khẩu thành công");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => setSuccess(null), 3000);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			setError(err.message || "Có lỗi xảy ra khi đổi mật khẩu");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10 font-sans">
			<div className="max-w-6xl mx-auto space-y-10">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-black text-slate-900 tracking-tight">Hồ sơ người dùng</h1>
						<p className="text-slate-500 font-medium mt-1">
							Quản lý thông tin cá nhân và cài đặt bảo mật của bạn.
						</p>
					</div>
					<div
						className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 ${
							user?.profile?.is_verified ?
								"bg-emerald-50 border-emerald-100 text-emerald-600"
							:	"bg-slate-100 border-slate-200 text-slate-400"
						}`}
					>
						<Shield
							size={14}
							className={user?.profile?.is_verified ? "fill-emerald-600/20" : ""}
						/>
						{user?.profile?.is_verified ? "Đã xác thực" : "Chưa xác thực"}
					</div>
				</div>

				{/* Success/Error Messages */}
				<AnimatePresence>
					{success && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold"
						>
							<CheckCircle2 size={20} />
							{success}
						</motion.div>
					)}
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold"
						>
							<AlertCircle size={20} />
							{error}
						</motion.div>
					)}
				</AnimatePresence>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
					{/* Avatar & Basic Info */}
					<div className="lg:col-span-1 space-y-6">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm text-center"
						>
							<div className="relative inline-block mb-6">
								<div className="w-32 h-32 rounded-4xl bg-slate-100 border-4 border-white shadow-xl overflow-hidden">
									<img
										src={
											user?.profile?.avatar_url ||
											`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.full_name || "User")}&background=random`
										}
										alt="Avatar"
										className="w-full h-full object-cover"
									/>
								</div>
								<button className="absolute -bottom-2 -right-2 p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
									<Camera size={18} />
								</button>
							</div>
							<h2
								className="text-xl font-black text-slate-900 leading-tight truncate"
								title={user?.profile?.full_name || ""}
							>
								{user?.profile?.full_name || "Chưa cập nhật tên"}
							</h2>
							<p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
								{user?.profile?.role === "landlord" ?
									"Chủ nhà"
								: user?.profile?.role === "broker" ?
									"Môi giới"
								:	"Khách hàng"}
							</p>

							<div className="mt-8 pt-8 border-t border-slate-50 flex flex-col gap-4 text-left">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
										<Mail size={16} />
									</div>
									<div>
										<p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
											Email
										</p>
										<p
											className="text-sm font-bold text-slate-700 truncate"
											title={user?.email || ""}
										>
											{user?.email}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
										<Phone size={16} />
									</div>
									<div>
										<p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
											Điện thoại
										</p>
										<p className="text-sm font-bold text-slate-700">
											{user?.profile?.phone || "Chưa cập nhật"}
										</p>
									</div>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Form Area */}
					<div className="lg:col-span-2 space-y-8">
						{/* Personal Information */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm"
						>
							<div className="flex items-center gap-3 mb-8">
								<div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
									<User size={20} />
								</div>
								<h3 className="text-xl font-black text-slate-900 tracking-tight">
									Thông tin cá nhân
								</h3>
							</div>

							<form
								onSubmit={handleUpdateProfile}
								className="space-y-6"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
											Họ và tên
										</label>
										<div className="relative">
											<input
												type="text"
												value={fullName}
												onChange={(e) => setFullName(e.target.value)}
												placeholder="Nhập họ tên của bạn"
												className="w-full h-14 pl-4 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-teal-600 outline-none transition-all"
											/>
										</div>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
											Ngày sinh
										</label>
										<div className="relative">
											<input
												type="date"
												value={dob}
												onChange={(e) => setDob(e.target.value)}
												className="w-full h-14 pl-4 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-teal-600 outline-none transition-all"
											/>
											<Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
										</div>
									</div>
									<div className="space-y-2 col-span-1 md:col-span-2">
										<label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
											Số điện thoại
										</label>
										<div className="relative">
											<input
												type="tel"
												value={phone}
												onChange={(e) => setPhone(e.target.value)}
												placeholder="09xx xxx xxx"
												className="w-full h-14 pl-4 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-teal-600 outline-none transition-all"
											/>
											<Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
										</div>
									</div>
								</div>

								<div className="pt-4">
									<button
										type="submit"
										disabled={loading}
										className="h-14 px-10 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-teal-700 shadow-xl shadow-teal-900/10 active:scale-95 transition-all disabled:opacity-50"
									>
										{loading ?
											<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										:	<Save size={18} />}
										Lưu thay đổi
									</button>
								</div>
							</form>
						</motion.div>

						{/* Change Password */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 }}
							className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm"
						>
							<div className="flex items-center gap-3 mb-8">
								<div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
									<Lock size={20} />
								</div>
								<h3 className="text-xl font-black text-slate-900 tracking-tight">
									Cài đặt bảo mật
								</h3>
							</div>

							<form
								onSubmit={handleChangePassword}
								className="space-y-6"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2 col-span-1 md:col-span-2">
										<label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
											Mật khẩu hiện tại
										</label>
										<div className="relative">
											<input
												type="password"
												value={currentPassword}
												onChange={(e) => setCurrentPassword(e.target.value)}
												placeholder="••••••••"
												className="w-full h-14 pl-4 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-red-600 outline-none transition-all"
											/>
											<Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
										</div>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
											Mật khẩu mới
										</label>
										<div className="relative">
											<input
												type="password"
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												placeholder="••••••••"
												className="w-full h-14 pl-4 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all"
											/>
											<Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
										</div>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
											Xác nhận mật khẩu mới
										</label>
										<div className="relative">
											<input
												type="password"
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												placeholder="••••••••"
												className="w-full h-14 pl-4 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all"
											/>
											<CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
										</div>
									</div>
								</div>

								<div className="pt-4 flex items-center justify-between gap-4">
									<div className="flex-1">
										<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
											Sử dụng mật khẩu mạnh với ít nhất 6 ký tự. Phải nhập mật khẩu cũ để xác thực.
										</p>
									</div>
									<button
										type="submit"
										disabled={loading || !newPassword || !currentPassword}
										className="h-14 px-10 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-900/10 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
									>
										{loading ?
											<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										:	<Shield size={18} />}
										Cập nhật mật khẩu
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
