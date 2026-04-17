import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Store, Link as LinkIcon, Share2, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function BrokerCartPage() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<"cart" | "landlords">("cart");

	const storeLink = `${window.location.origin}/store/${user?.id || 'demo'}`;

	const [settings, setSettings] = useState({
		autoLoadOwner: true,
		directContact: true,
		autoLoadArea: true,
		hideExactAddress: true,
		hideMapLocation: true,
		areas: ["Quận Ngũ Hành Sơn", "Quận Bình Thạnh"],
		landlords: [
			{ id: '1', name: 'Ngô Sỹ Tú', active: true },
			{ id: '2', name: 'Anh Khoa FPHouse', active: true },
			{ id: '3', name: 'GenHouse', active: false },
		]
	});

	useEffect(() => {
		const saved = localStorage.getItem('broker_settings_' + user?.id);
		if (saved) {
			setSettings(JSON.parse(saved));
		}
	}, [user?.id]);

	const saveSettings = () => {
		setLoading(true);
		localStorage.setItem('broker_settings_' + user?.id, JSON.stringify(settings));
		setTimeout(() => {
			setLoading(false);
			alert("Lưu cài đặt thành công!");
		}, 500);
	};

	const toggleSetting = (key: keyof typeof settings) => {
		setSettings(prev => ({ ...prev, [key]: !(prev as any)[key] }));
	};

	const toggleLandlord = (id: string) => {
		setSettings(prev => ({
			...prev,
			landlords: prev.landlords.map(l => l.id === id ? { ...l, active: !l.active } : l)
		}));
	};

	const removeArea = (area: string) => {
		setSettings(prev => ({
			...prev,
			areas: prev.areas.filter(a => a !== area)
		}));
	};

	const addArea = () => {
		const area = prompt("Nhập tên quận/huyện cần theo dõi:");
		if (area && !settings.areas.includes(area)) {
			setSettings(prev => ({ ...prev, areas: [...prev.areas, area] }));
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col">
			<div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
				<div className="flex items-center gap-4">
					<Link to="/reservations" className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
						<ArrowLeft className="w-5 h-5" />
					</Link>
					<div>
						<h1 className="text-xl font-black text-slate-900 tracking-tight">Cài đặt Giỏ hàng</h1>
						<p className="text-sm text-slate-500 font-medium mt-0.5">Quản lý mạng lưới bán hàng của bạn</p>
					</div>
				</div>
				<button onClick={saveSettings} disabled={loading} className="px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
					{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
					<span>{loading ? "Đang lưu..." : "Lưu cài đặt"}</span>
				</button>
			</div>

			<div className="max-w-2xl w-full mx-auto p-6">
				{/* Store Link Card */}
				<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
								<Store className="w-4 h-4" /> Link giỏ hàng của bạn
							</h3>
							<a href={storeLink} target="_blank" rel="noreferrer" className="text-brand-primary font-bold text-base hover:underline flex items-center gap-2">
								{storeLink} <LinkIcon className="w-4 h-4" />
							</a>
							<p className="text-sm text-slate-500 mt-2">Bạn có thể gắn link giỏ hàng trên bio Tiktok / Facebook / Zalo / ... để khách thuê truy cập và xem phòng trống.</p>
						</div>
						<button onClick={() => { navigator.clipboard.writeText(storeLink); alert("Đã copy link!"); }} className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary/20 transition-colors">
							<Share2 className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-slate-200 mb-6 font-bold text-[15px]">
					<button 
						className={`pb-3 px-6 border-b-2 transition-colors ${activeTab === 'cart' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
						onClick={() => setActiveTab('cart')}
					>
						Giỏ hàng của bạn
					</button>
					<button 
						className={`pb-3 px-6 border-b-2 transition-colors ${activeTab === 'landlords' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
						onClick={() => setActiveTab('landlords')}
					>
						Danh sách chủ
					</button>
				</div>

				<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={activeTab}>
					{activeTab === 'cart' ? (
						<div className="space-y-6">
							{/* Areas */}
							<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
								<div className="flex items-center justify-between mb-4">
									<div>
										<h3 className="font-bold text-slate-900">Khu vực tự động nạp hàng</h3>
										<p className="text-[13px] text-slate-500">Bạn đang đăng ký những khu vực sau</p>
									</div>
									<button onClick={addArea} className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:border-brand-primary hover:text-brand-primary transition-colors">
										<Plus className="w-4 h-4" />
									</button>
								</div>
								<div className="flex flex-wrap gap-2">
									{settings.areas.map(area => (
										<div key={area} className="px-4 py-2 border border-slate-200 rounded-full text-[13px] font-bold text-slate-700 flex items-center gap-2">
											{area}
											<button onClick={() => removeArea(area)} className="text-slate-400 hover:text-rose-500 rounded-full p-0.5">&times;</button>
										</div>
									))}
								</div>
							</div>

							{/* Behaviors */}
							<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
								<div className="flex items-start gap-4">
									<div className="flex-1">
										<div className="flex items-center justify-between mb-2">
											<h3 className="font-bold text-slate-900">Tự động nạp hàng</h3>
											<Toggle checked={settings.autoLoadOwner} onChange={() => toggleSetting('autoLoadOwner')} />
										</div>
										<ul className="text-[13px] text-slate-500 space-y-2 list-disc pl-5">
											<li>Nạp hàng chính chủ vào giỏ hàng</li>
											<li>Khách thuê sẽ liên hệ trực tiếp bạn</li>
											<li>Hàng mới sẽ tự động nạp theo khu vực</li>
										</ul>
									</div>
								</div>

								<div className="h-px bg-slate-100" />

								<div className="flex items-start gap-4">
									<div className="flex-1">
										<div className="flex items-center justify-between mb-2">
											<h3 className="font-bold text-slate-900">Giấu địa chỉ trên website</h3>
											<Toggle checked={settings.hideExactAddress} onChange={() => toggleSetting('hideExactAddress')} />
										</div>
										<ul className="text-[13px] text-slate-500 space-y-2 list-disc pl-5">
											<li>Không xem được địa chỉ chính xác</li>
											<li>Không hiển thị vị trí trên bản đồ</li>
											<li>Ví dụ: 17C Vườn Lài &rarr; Vườn Lài</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
							<h3 className="font-bold text-slate-900 mb-2">Danh sách chủ nhà đã tích hợp</h3>
							<p className="text-[13px] text-slate-500 mb-6">Những phòng trống của các chủ nhà này sẽ hiện lên trang hàng của môi giới.</p>
							
							<div className="space-y-4">
								{settings.landlords.map(ll => (
									<div key={ll.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center relative">
												<Users className="w-5 h-5 text-slate-500" />
												<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
											</div>
											<div>
												<h4 className="font-bold text-slate-800 text-sm">{ll.name}</h4>
												<p className="text-xs text-slate-400">Đang hoạt động</p>
											</div>
										</div>
										<Toggle checked={ll.active} onChange={() => toggleLandlord(ll.id)} />
									</div>
								))}
							</div>
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: () => void }) {
	return (
		<button
			onClick={onChange}
			className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${checked ? 'bg-[#FFD12A]' : 'bg-slate-200'}`}
		>
			<motion.div 
				className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
				animate={{ left: checked ? '22px' : '2px' }}
				transition={{ type: "spring", stiffness: 500, damping: 30 }}
			/>
		</button>
	);
}
