import { useCallback, useEffect, useMemo, useState } from "react";
import {
	AtSign,
	ChevronDown,
	ChevronUp,
	Edit2,
	Globe,
	Info,
	MessageCircle,
	Music2,
} from "lucide-react";
import Modal from "../components/modals/Modal";
import { api } from "../lib/api";
import { applyBusinessThemeFromSettings, DEFAULT_APP_THEME } from "../lib/brandTheme";

const Facebook = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
	</svg>
);
const Instagram = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect
			width="20"
			height="20"
			x="2"
			y="2"
			rx="5"
			ry="5"
		/>
		<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
		<line
			x1="17.5"
			x2="17.51"
			y1="6.5"
			y2="6.5"
		/>
	</svg>
);
const Linkedin = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
		<rect
			width="4"
			height="12"
			x="2"
			y="9"
		/>
		<circle
			cx="4"
			cy="4"
			r="2"
		/>
	</svg>
);
const Twitter = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
	</svg>
);

interface BusinessSettings {
	brand_name?: string | null;
	phone?: string | null;
	email?: string | null;
	description?: string | null;
	address?: string | null;
	rep_business?: string | null;
	rep_name?: string | null;
	rep_position?: string | null;
	rep_phone?: string | null;
	rep_email?: string | null;
	tax_code?: string | null;
	rep_address?: string | null;
	social_website?: string | null;
	social_facebook?: string | null;
	social_instagram?: string | null;
	social_twitter?: string | null;
	social_linkedin?: string | null;
	social_zalo?: string | null;
	social_messenger?: string | null;
	social_tiktok?: string | null;
	payment_cycle?: string | null;
	odd_day_calc?: string | null;
	primary_color?: string | null;
	text_color?: string | null;
	logo_full_url?: string | null;
	logo_sm_url?: string | null;
}

const isHexColor = (value: string) => /^#([0-9A-F]{6})$/i.test(value);

const sanitizeHex = (value: string, fallback: string) => {
	const next = value.trim().toLowerCase();
	return isHexColor(next) ? next : fallback;
};

const dispatchThemeUpdated = (settings: BusinessSettings) => {
	window.dispatchEvent(
		new CustomEvent("business-theme-updated", {
			detail: { settings },
		}),
	);
};

export default function BusinessInfoPage() {
	const [loading, setLoading] = useState(true);
	const [savingBranding, setSavingBranding] = useState(false);
	const [settings, setSettings] = useState<BusinessSettings>({});
	const [repExpanded, setRepExpanded] = useState(true);
	const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false);
	const [isEditRepOpen, setIsEditRepOpen] = useState(false);
	const [isEditSocialOpen, setIsEditSocialOpen] = useState(false);
	const [brandingDraft, setBrandingDraft] = useState({
		primary_color: DEFAULT_APP_THEME.primary,
		text_color: DEFAULT_APP_THEME.ink,
		logo_full_url: "",
		logo_sm_url: "",
	});

	const loadSettings = useCallback(async () => {
		setLoading(true);
		const { data } = await api.get<{ settings: BusinessSettings }>("/api/business-settings");
		const next = data?.settings || {};
		const normalizedPrimary = sanitizeHex(next.primary_color || "", DEFAULT_APP_THEME.primary);
		const normalizedText = sanitizeHex(next.text_color || "", DEFAULT_APP_THEME.ink);
		const isLegacyPrimary = (next.primary_color || "").trim().toLowerCase() === "#ffba38";
		const shouldPersistDefaultBranding =
			!next.primary_color ||
			!next.text_color ||
			!isHexColor((next.primary_color || "").trim()) ||
			!isHexColor((next.text_color || "").trim()) ||
			isLegacyPrimary;

		const normalizedSettings: BusinessSettings = {
			...next,
			primary_color: normalizedPrimary,
			text_color: normalizedText,
		};

		if (shouldPersistDefaultBranding) {
			const { data: updated } = await api.put<{ settings: BusinessSettings }>("/api/business-settings", {
				primary_color: normalizedPrimary,
				text_color: normalizedText,
			});
			const resolved = updated?.settings || normalizedSettings;
			setSettings(resolved);
			applyBusinessThemeFromSettings(resolved);
			dispatchThemeUpdated(resolved);
			setLoading(false);
			return;
		}

		setSettings(normalizedSettings);
		applyBusinessThemeFromSettings(normalizedSettings);
		dispatchThemeUpdated(normalizedSettings);
		setLoading(false);
	}, []);

	useEffect(() => {
		loadSettings();
	}, [loadSettings]);

	useEffect(() => {
		setBrandingDraft({
			primary_color: sanitizeHex(settings.primary_color || "", DEFAULT_APP_THEME.primary),
			text_color: sanitizeHex(settings.text_color || "", DEFAULT_APP_THEME.ink),
			logo_full_url: settings.logo_full_url || "",
			logo_sm_url: settings.logo_sm_url || "",
		});
	}, [settings.primary_color, settings.text_color, settings.logo_full_url, settings.logo_sm_url]);

	const updateSettings = async (
		patch: Partial<BusinessSettings>,
		opts?: { close?: () => void; applyTheme?: boolean },
	) => {
		const previous = settings;
		const optimistic = { ...settings, ...patch };
		setSettings(optimistic);

		if (opts?.applyTheme) {
			applyBusinessThemeFromSettings(optimistic);
		}

		const { data, error } = await api.put<{ settings: BusinessSettings }>("/api/business-settings", patch);
		if (error || !data?.settings) {
			setSettings(previous);
			if (opts?.applyTheme) applyBusinessThemeFromSettings(previous);
			alert(error || "Cập nhật thất bại");
			return false;
		}

		setSettings(data.settings);
		if (opts?.applyTheme) {
			applyBusinessThemeFromSettings(data.settings);
			dispatchThemeUpdated(data.settings);
		}
		opts?.close?.();
		return true;
	};

	const previewPrimary = sanitizeHex(brandingDraft.primary_color, DEFAULT_APP_THEME.primary);
	const previewText = sanitizeHex(brandingDraft.text_color, DEFAULT_APP_THEME.ink);

	const socialItems = useMemo(
		() => [
			{
				Icon: Globe,
				label: "Website",
				color: "text-slate-600",
				key: "social_website" as const,
				value: settings.social_website,
			},
			{
				Icon: Facebook,
				label: "Facebook",
				color: "text-blue-600",
				key: "social_facebook" as const,
				value: settings.social_facebook,
			},
			{
				Icon: Instagram,
				label: "Instagram",
				color: "text-rose-500",
				key: "social_instagram" as const,
				value: settings.social_instagram,
			},
			{
				Icon: Twitter,
				label: "Twitter",
				color: "text-sky-500",
				key: "social_twitter" as const,
				value: settings.social_twitter,
			},
			{
				Icon: Linkedin,
				label: "Linkedin",
				color: "text-blue-700",
				key: "social_linkedin" as const,
				value: settings.social_linkedin,
			},
			{
				Icon: MessageCircle,
				label: "Zalo",
				color: "text-blue-500",
				key: "social_zalo" as const,
				value: settings.social_zalo,
			},
			{
				Icon: AtSign,
				label: "Messenger",
				color: "text-sky-500",
				key: "social_messenger" as const,
				value: settings.social_messenger,
			},
			{
				Icon: Music2,
				label: "Tiktok",
				color: "text-slate-900",
				key: "social_tiktok" as const,
				value: settings.social_tiktok,
			},
		],
		[settings],
	);

	if (loading) {
		return <div className="p-6 text-center text-slate-500 font-semibold">Đang tải cấu hình doanh nghiệp...</div>;
	}

	return (
		<div className="flex-1 flex flex-col h-full bg-brand-bg/40 overflow-hidden">
			<div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
				<h1 className="text-lg font-semibold text-slate-900">Thông tin doanh nghiệp</h1>
			</div>

			<div className="flex-1 overflow-auto p-6 space-y-6">
				<div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h2 className="text-2xl font-bold text-slate-900">
								{settings.brand_name || "Chưa cập nhật tên doanh nghiệp"}
							</h2>
							<p className="text-sm text-slate-500 mt-1">{settings.description || "Chưa có mô tả doanh nghiệp"}</p>
						</div>
						<button
							onClick={() => setIsEditBusinessOpen(true)}
							className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
						>
							<Edit2 className="w-4 h-4" />
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
						<div className="rounded-lg border border-slate-200 p-4">
							<p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Liên hệ</p>
							<p className="text-sm font-semibold text-slate-700">{settings.phone || "Chưa cấu hình số điện thoại"}</p>
							<p className="text-sm text-slate-500 mt-1">{settings.email || "Chưa cấu hình email"}</p>
						</div>
						<div className="rounded-lg border border-slate-200 p-4 md:col-span-2">
							<p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Địa chỉ</p>
							<p className="text-sm text-slate-700">{settings.address || "Chưa cấu hình địa chỉ doanh nghiệp"}</p>
						</div>
					</div>

					<div className="mt-6 flex items-center justify-between">
						<h3 className="text-sm font-semibold text-slate-800">Mạng xã hội</h3>
						<button
							onClick={() => setIsEditSocialOpen(true)}
							className="text-sm font-semibold text-brand-primary hover:text-brand-dark cursor-pointer"
						>
							Chỉnh sửa liên kết
						</button>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
						{socialItems.map((social) => (
							<div
								key={social.key}
								className="flex items-center gap-2.5 border border-slate-200 rounded-lg px-3 py-2"
							>
								<social.Icon className={`w-4 h-4 ${social.color}`} />
								<span className="text-xs text-slate-600 truncate">{social.value || "Chưa thiết lập"}</span>
							</div>
						))}
					</div>
				</div>

				<div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
					<div className="flex items-center justify-between gap-4 flex-wrap">
						<div>
							<h2 className="text-base font-semibold text-slate-900">Màu thương hiệu & logo</h2>
							<p className="text-sm text-slate-500 mt-1">
								Màu thương hiệu ở đây là màu mặc định toàn app. Lưu là áp dụng cho tất cả trang.
							</p>
						</div>
						<button
							onClick={async () => {
								setBrandingDraft({
									primary_color: DEFAULT_APP_THEME.primary,
									text_color: DEFAULT_APP_THEME.ink,
									logo_full_url: settings.logo_full_url || "",
									logo_sm_url: settings.logo_sm_url || "",
								});
								await updateSettings(
									{
										primary_color: DEFAULT_APP_THEME.primary,
										text_color: DEFAULT_APP_THEME.ink,
									},
									{ applyTheme: true },
								);
							}}
							className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
						>
							Đặt lại mặc định app
						</button>
					</div>

					<form
						className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6"
						onSubmit={async (e) => {
							e.preventDefault();
							const nextPrimary = sanitizeHex(
								brandingDraft.primary_color,
								DEFAULT_APP_THEME.primary,
							);
							const nextText = sanitizeHex(brandingDraft.text_color, DEFAULT_APP_THEME.ink);
							const patch: Partial<BusinessSettings> = {
								primary_color: nextPrimary,
								text_color: nextText,
								logo_full_url: brandingDraft.logo_full_url.trim() || null,
								logo_sm_url: brandingDraft.logo_sm_url.trim() || null,
							};
							setSavingBranding(true);
							await updateSettings(patch, { applyTheme: true });
							setSavingBranding(false);
						}}
					>
						<div className="space-y-5">
							<div>
								<label className="text-sm font-semibold text-slate-700 block mb-2">Màu chủ đạo app</label>
								<div className="flex items-center gap-3">
									<input
										type="color"
										value={previewPrimary}
										onChange={(e) =>
											setBrandingDraft((prev) => ({ ...prev, primary_color: e.target.value }))
										}
										className="w-11 h-11 border border-slate-200 rounded-lg bg-white cursor-pointer"
									/>
									<input
										type="text"
										value={brandingDraft.primary_color}
										onChange={(e) =>
											setBrandingDraft((prev) => ({ ...prev, primary_color: e.target.value }))
										}
										placeholder="#0f9b9b"
										className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white"
									/>
								</div>
							</div>
							<div>
								<label className="text-sm font-semibold text-slate-700 block mb-2">Màu chữ thương hiệu</label>
								<div className="flex items-center gap-3">
									<input
										type="color"
										value={previewText}
										onChange={(e) =>
											setBrandingDraft((prev) => ({ ...prev, text_color: e.target.value }))
										}
										className="w-11 h-11 border border-slate-200 rounded-lg bg-white cursor-pointer"
									/>
									<input
										type="text"
										value={brandingDraft.text_color}
										onChange={(e) =>
											setBrandingDraft((prev) => ({ ...prev, text_color: e.target.value }))
										}
										placeholder="#000000"
										className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white"
									/>
								</div>
							</div>
							<button
								type="submit"
								disabled={savingBranding}
								className="px-4 py-2.5 text-sm font-bold bg-brand-primary text-white rounded-lg hover:bg-brand-dark disabled:opacity-60 cursor-pointer"
							>
								{savingBranding ? "Đang lưu..." : "Lưu thương hiệu"}
							</button>
						</div>

						<div className="space-y-4">
							<div className="rounded-xl border border-slate-200 p-4">
								<p className="text-sm font-semibold text-slate-700 mb-3">Preview</p>
								<div className="h-24 rounded-lg border border-slate-200 px-4 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className="w-10 h-10 rounded-lg"
											style={{ backgroundColor: previewPrimary }}
										/>
										<div>
											<p
												className="text-sm font-bold"
												style={{ color: previewText }}
											>
												{settings.brand_name || "Rental Platform"}
											</p>
											<p className="text-xs text-slate-500">Màu áp dụng toàn app sau khi lưu</p>
										</div>
									</div>
								</div>
							</div>
							<div>
								<label className="text-sm font-semibold text-slate-700 block mb-2">Logo đầy đủ URL</label>
								<input
									type="url"
									value={brandingDraft.logo_full_url}
									onChange={(e) =>
										setBrandingDraft((prev) => ({ ...prev, logo_full_url: e.target.value }))
									}
									placeholder="https://..."
									className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
								/>
							</div>
							<div>
								<label className="text-sm font-semibold text-slate-700 block mb-2">Logo thu gọn URL</label>
								<input
									type="url"
									value={brandingDraft.logo_sm_url}
									onChange={(e) =>
										setBrandingDraft((prev) => ({ ...prev, logo_sm_url: e.target.value }))
									}
									placeholder="https://..."
									className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
								/>
							</div>
							<p className="text-xs text-slate-500 flex items-center gap-1.5">
								<Info className="w-3.5 h-3.5" />
								Bạn có thể dùng URL từ Supabase Storage hoặc CDN.
							</p>
						</div>
					</form>
				</div>

				<div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
					<div
						className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
						onClick={() => setRepExpanded((prev) => !prev)}
					>
						<div className="flex items-center gap-2">
							{repExpanded ?
								<ChevronUp className="w-5 h-5 text-slate-400" />
							:	<ChevronDown className="w-5 h-5 text-slate-400" />}
							<h2 className="text-base font-semibold text-slate-900">Thông tin người đại diện</h2>
						</div>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setIsEditRepOpen(true);
							}}
							className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
						>
							<Edit2 className="w-4 h-4" />
						</button>
					</div>
					{repExpanded && (
						<div className="px-6 pb-6 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div>
								<p className="text-xs text-slate-400">Doanh nghiệp</p>
								<p className="text-sm font-semibold text-slate-700">{settings.rep_business || "N/A"}</p>
							</div>
							<div>
								<p className="text-xs text-slate-400">Người đại diện</p>
								<p className="text-sm font-semibold text-slate-700">{settings.rep_name || "N/A"}</p>
							</div>
							<div>
								<p className="text-xs text-slate-400">Chức vụ</p>
								<p className="text-sm font-semibold text-slate-700">{settings.rep_position || "N/A"}</p>
							</div>
							<div>
								<p className="text-xs text-slate-400">Số điện thoại</p>
								<p className="text-sm font-semibold text-slate-700">{settings.rep_phone || "N/A"}</p>
							</div>
							<div>
								<p className="text-xs text-slate-400">Email</p>
								<p className="text-sm font-semibold text-slate-700">{settings.rep_email || "N/A"}</p>
							</div>
							<div>
								<p className="text-xs text-slate-400">Mã số thuế</p>
								<p className="text-sm font-semibold text-slate-700">{settings.tax_code || "N/A"}</p>
							</div>
							<div className="md:col-span-2 lg:col-span-3">
								<p className="text-xs text-slate-400">Địa chỉ</p>
								<p className="text-sm font-semibold text-slate-700">{settings.rep_address || "N/A"}</p>
							</div>
						</div>
					)}
				</div>

				<div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
					<h2 className="text-base font-semibold text-slate-900 mb-6">Cài đặt quy trình thanh toán</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="space-y-3">
							<h3 className="text-sm font-semibold text-slate-700">Cách tính tròn tháng</h3>
							<label className="flex items-center gap-2.5 cursor-pointer">
								<input
									type="radio"
									checked={settings.payment_cycle !== "actual_days"}
									onChange={() => void updateSettings({ payment_cycle: "30_days" })}
									className="w-4 h-4 text-brand-primary"
								/>
								<span className="text-sm text-slate-700">Chu kỳ 30 ngày</span>
							</label>
							<label className="flex items-center gap-2.5 cursor-pointer">
								<input
									type="radio"
									checked={settings.payment_cycle === "actual_days"}
									onChange={() => void updateSettings({ payment_cycle: "actual_days" })}
									className="w-4 h-4 text-brand-primary"
								/>
								<span className="text-sm text-slate-700">Theo lịch thực tế</span>
							</label>
						</div>
						<div className="space-y-3">
							<h3 className="text-sm font-semibold text-slate-700">Tính ngày lẻ</h3>
							<label className="flex items-center gap-2.5 cursor-pointer">
								<input
									type="radio"
									checked={settings.odd_day_calc !== "actual_days"}
									onChange={() => void updateSettings({ odd_day_calc: "30_days_fixed" })}
									className="w-4 h-4 text-brand-primary"
								/>
								<span className="text-sm text-slate-700">Theo 30 ngày cố định</span>
							</label>
							<label className="flex items-center gap-2.5 cursor-pointer">
								<input
									type="radio"
									checked={settings.odd_day_calc === "actual_days"}
									onChange={() => void updateSettings({ odd_day_calc: "actual_days" })}
									className="w-4 h-4 text-brand-primary"
								/>
								<span className="text-sm text-slate-700">Theo số ngày thực tế</span>
							</label>
						</div>
					</div>
				</div>
			</div>

			<Modal
				isOpen={isEditBusinessOpen}
				onClose={() => setIsEditBusinessOpen(false)}
				title="Chỉnh sửa thông tin chung"
				size="lg"
			>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						const form = new FormData(e.currentTarget);
						await updateSettings(
							{
								brand_name: String(form.get("brand_name") || "").trim(),
								phone: String(form.get("phone") || "").trim(),
								email: String(form.get("email") || "").trim(),
								description: String(form.get("description") || "").trim(),
								address: String(form.get("address") || "").trim(),
							},
							{ close: () => setIsEditBusinessOpen(false) },
						);
					}}
					className="p-6 space-y-4"
				>
					<div>
						<label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên doanh nghiệp</label>
						<input
							name="brand_name"
							defaultValue={settings.brand_name || ""}
							required
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
							<input
								name="phone"
								defaultValue={settings.phone || ""}
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
							<input
								name="email"
								type="email"
								defaultValue={settings.email || ""}
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-semibold text-slate-700 mb-1.5">Địa chỉ</label>
						<input
							name="address"
							defaultValue={settings.address || ""}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả</label>
						<textarea
							name="description"
							defaultValue={settings.description || ""}
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none min-h-[96px]"
						/>
					</div>
					<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
						<button
							type="button"
							onClick={() => setIsEditBusinessOpen(false)}
							className="px-5 py-2.5 text-sm font-semibold text-slate-600 cursor-pointer"
						>
							Hủy
						</button>
						<button
							type="submit"
							className="px-6 py-2.5 text-sm font-bold bg-brand-primary text-white rounded-lg cursor-pointer"
						>
							Lưu
						</button>
					</div>
				</form>
			</Modal>

			<Modal
				isOpen={isEditRepOpen}
				onClose={() => setIsEditRepOpen(false)}
				title="Chỉnh sửa người đại diện"
				size="lg"
			>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						const form = new FormData(e.currentTarget);
						await updateSettings(
							{
								rep_business: String(form.get("rep_business") || "").trim(),
								rep_name: String(form.get("rep_name") || "").trim(),
								rep_position: String(form.get("rep_position") || "").trim(),
								rep_phone: String(form.get("rep_phone") || "").trim(),
								rep_email: String(form.get("rep_email") || "").trim(),
								tax_code: String(form.get("tax_code") || "").trim(),
								rep_address: String(form.get("rep_address") || "").trim(),
							},
							{ close: () => setIsEditRepOpen(false) },
						);
					}}
					className="p-6 space-y-4"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="md:col-span-2">
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên pháp nhân</label>
							<input
								name="rep_business"
								defaultValue={settings.rep_business || ""}
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">Người đại diện</label>
							<input
								name="rep_name"
								defaultValue={settings.rep_name || ""}
								required
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">Chức vụ</label>
							<input
								name="rep_position"
								defaultValue={settings.rep_position || ""}
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
							<input
								name="rep_phone"
								defaultValue={settings.rep_phone || ""}
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
							<input
								name="rep_email"
								type="email"
								defaultValue={settings.rep_email || ""}
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">Mã số thuế</label>
							<input
								name="tax_code"
								defaultValue={settings.tax_code || ""}
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
							/>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm font-semibold text-slate-700 mb-1.5">Địa chỉ</label>
							<input
								name="rep_address"
								defaultValue={settings.rep_address || ""}
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
							/>
						</div>
					</div>
					<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
						<button
							type="button"
							onClick={() => setIsEditRepOpen(false)}
							className="px-5 py-2.5 text-sm font-semibold text-slate-600 cursor-pointer"
						>
							Hủy
						</button>
						<button
							type="submit"
							className="px-6 py-2.5 text-sm font-bold bg-brand-primary text-white rounded-lg cursor-pointer"
						>
							Lưu
						</button>
					</div>
				</form>
			</Modal>

			<Modal
				isOpen={isEditSocialOpen}
				onClose={() => setIsEditSocialOpen(false)}
				title="Chỉnh sửa mạng xã hội"
				size="md"
			>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						const form = new FormData(e.currentTarget);
						await updateSettings(
							{
								social_website: String(form.get("social_website") || "").trim(),
								social_facebook: String(form.get("social_facebook") || "").trim(),
								social_instagram: String(form.get("social_instagram") || "").trim(),
								social_twitter: String(form.get("social_twitter") || "").trim(),
								social_linkedin: String(form.get("social_linkedin") || "").trim(),
								social_zalo: String(form.get("social_zalo") || "").trim(),
								social_messenger: String(form.get("social_messenger") || "").trim(),
								social_tiktok: String(form.get("social_tiktok") || "").trim(),
							},
							{ close: () => setIsEditSocialOpen(false) },
						);
					}}
					className="p-6 space-y-4"
				>
					{socialItems.map((social) => (
						<div
							key={social.key}
							className="space-y-1.5"
						>
							<label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
								<social.Icon className={`w-4 h-4 ${social.color}`} />
								{social.label}
							</label>
							<input
								name={social.key}
								defaultValue={social.value || ""}
								placeholder="https://..."
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
							/>
						</div>
					))}
					<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
						<button
							type="button"
							onClick={() => setIsEditSocialOpen(false)}
							className="px-5 py-2.5 text-sm font-semibold text-slate-600 cursor-pointer"
						>
							Hủy
						</button>
						<button
							type="submit"
							className="px-6 py-2.5 text-sm font-bold bg-brand-primary text-white rounded-lg cursor-pointer"
						>
							Lưu
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
