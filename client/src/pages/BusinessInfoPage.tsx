import { useState } from "react";
import {
	Building2,
	MapPin,
	Globe,
	Smartphone,
	Mail,
	CheckCircle2,
	Save,
	Upload,
} from "lucide-react";

const BusinessInfoPage = () => {
	const [formData, setFormData] = useState({
		name: "CÔNG TY TNHH SMARTOS VIỆT NAM",
		taxCode: "0102345678",
		address: "Tầng 5, Toà nhà Smartos, Quận 1, TP. Hồ Chí Minh",
		website: "https://smartos.space",
		phone: "0901234567",
		email: "contact@smartos.space",
		currency: "VND",
		timezone: "(GMT+07:00) Bangkok, Hanoi, Jakarta",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
						Thông tin doanh nghiệp
					</h1>

					<button className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-all hover:bg-amber-500 active:scale-[0.98] shadow-sm ml-auto cursor-pointer">
						<Save className="w-4 h-4 font-bold" />
						Lưu thay đổi
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Side: General Info */}
					<div className="lg:col-span-2 space-y-6">
						{/* Section: Basic Info */}
						<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
							<h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
								<Building2 className="w-4 h-4 text-amber-500" />
								Thông tin cơ bản
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="text-[13px] font-bold text-slate-700">
										Tên doanh nghiệp <span className="text-rose-500">*</span>
									</label>
									<input
										name="name"
										type="text"
										value={formData.name}
										onChange={handleChange}
										className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-[13px] font-bold text-slate-700">Mã số thuế</label>
									<input
										name="taxCode"
										type="text"
										value={formData.taxCode}
										onChange={handleChange}
										className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
									/>
								</div>
								<div className="space-y-2 md:col-span-2">
									<label className="text-[13px] font-bold text-slate-700">Địa chỉ trụ sở</label>
									<div className="relative">
										<MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
										<input
											name="address"
											type="text"
											value={formData.address}
											onChange={handleChange}
											className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<label className="text-[13px] font-bold text-slate-700">Website</label>
									<div className="relative">
										<Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
										<input
											name="website"
											type="url"
											value={formData.website}
											onChange={handleChange}
											className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Section: Contact */}
						<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
							<h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
								<Mail className="w-4 h-4 text-amber-500" />
								Thông tin liên hệ
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="text-[13px] font-bold text-slate-700">Điện thoại</label>
									<div className="relative">
										<Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
										<input
											name="phone"
											type="tel"
											value={formData.phone}
											onChange={handleChange}
											className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<label className="text-[13px] font-bold text-slate-700">
										Email nhận thông báo
									</label>
									<div className="relative">
										<Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
										<input
											name="email"
											type="email"
											value={formData.email}
											onChange={handleChange}
											className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Section: System Config */}
						<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
							<h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
								<Globe className="w-4 h-4 text-amber-500" />
								Cấu hình hệ thống
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="text-[13px] font-bold text-slate-700">Tiền tệ mặc định</label>
									<select
										name="currency"
										value={formData.currency}
										onChange={handleChange}
										className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer appearance-none"
									>
										<option value="VND">Vietnamese Dong (VND)</option>
										<option value="USD">US Dollar (USD)</option>
									</select>
								</div>
								<div className="space-y-2">
									<label className="text-[13px] font-bold text-slate-700">Múi giờ</label>
									<select
										name="timezone"
										value={formData.timezone}
										onChange={handleChange}
										className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer appearance-none"
									>
										<option value="(GMT+07:00) Bangkok, Hanoi, Jakarta">
											(GMT+07:00) Bangkok, Hanoi, Jakarta
										</option>
										<option value="(GMT+08:00) Singapore, Taipei, Beijing">
											(GMT+08:00) Singapore, Taipei, Beijing
										</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					{/* Right Side: Logo & Status */}
					<div className="space-y-6">
						{/* Section: Logo */}
						<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
							<h3 className="text-[15px] font-bold text-slate-900">Logo doanh nghiệp</h3>
							<div className="flex flex-col items-center gap-4">
								<div className="w-32 h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
									<Building2 className="w-12 h-12 text-slate-300" />
									<div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
										<Upload className="w-6 h-6 text-white" />
									</div>
								</div>
								<p className="text-[11px] text-slate-400 font-medium text-center leading-relaxed">
									Dung lượng tối đa 2MB.
									<br />
									Định dạng: .jpg, .png, .svg
								</p>
								<button className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
									Thay đổi logo
								</button>
							</div>
						</div>

						{/* Section: Verification Status */}
						<div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 border-b-2">
									<CheckCircle2 className="w-5 h-5" />
								</div>
								<div>
									<h4 className="text-[13px] font-bold text-emerald-900 tracking-tight">
										Tài khoản chính thức
									</h4>
									<p className="text-[10px] uppercase font-black text-emerald-600/70 tracking-widest mt-0.5">
										Verified Business
									</p>
								</div>
							</div>
							<p className="text-[12px] font-medium text-emerald-700/80 leading-relaxed">
								Doanh nghiệp của bạn đã được xác thực các thông tin pháp lý trên hệ thống Smartos.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BusinessInfoPage;
