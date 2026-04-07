import { useState, useEffect, useCallback } from "react";
import {
	Settings2,
	Plus,
	CreditCard,
	Building2,
	Trash2,
	CheckCircle2,
	ShieldCheck,
	Globe,
	Save,
	ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import Modal from "../components/modals/Modal";
import BankForm from "../components/modals/BankForm";

interface BankAccount {
	id: string;
	bank_name: string;
	account_name: string;
	account_number: string;
	branch: string;
	is_default: boolean;
	status: string;
}

const TransactionConfigPage = () => {
	const [activeTab, setActiveTab] = useState("bank");
	const [banks, setBanks] = useState<BankAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchBanks = useCallback(async () => {
		setLoading(true);
		const { data } = await api.get<BankAccount[]>("/api/bank-accounts");
		if (data) setBanks(data);
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchBanks();
	}, [fetchBanks]);

	const handleAddBank = async (formData: any) => {
		const { error } = await api.post("/api/bank-accounts", formData);
		if (!error) {
			setIsModalOpen(false);
			fetchBanks();
		} else {
			alert(error);
		}
	};

	const handleDeleteBank = async (id: string) => {
		if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
			const { error } = await api.delete(`/api/bank-accounts/${id}`);
			if (!error) fetchBanks();
		}
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4 flex items-center justify-between">
					<h1 className="text-[20px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
						<Settings2 className="w-5 h-5 text-amber-500" />
						Cấu hình giao dịch
					</h1>
					<button className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg text-[13px] font-bold transition-all hover:bg-amber-500 active:scale-[0.98] shadow-sm cursor-pointer ml-auto">
						<Save className="w-4 h-4 font-bold" />
						Lưu thay đổi
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-auto bg-[#f8f9fa] p-5 lg:p-6 flex flex-col gap-6">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					<div className="lg:col-span-1 space-y-2 shrink-0">
						{[
							{ id: "bank", label: "Tài khoản ngân hàng", icon: Building2 },
							{ id: "gateways", label: "Cổng thanh toán", icon: Globe },
							{ id: "methods", label: "Phương thức khác", icon: CreditCard },
						].map((item) => (
							<button
								key={item.id}
								onClick={() => setActiveTab(item.id)}
								className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
									activeTab === item.id ?
										"bg-white text-emerald-600 shadow-sm border border-slate-200"
									:	"text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
								}`}
							>
								<div className="flex items-center gap-3">
									<item.icon
										className={`w-5 h-5 shrink-0 ${activeTab === item.id ? "text-emerald-500" : "text-slate-400"}`}
									/>
									{item.label}
								</div>
								{activeTab === item.id && <ChevronRight className="w-4 h-4" />}
							</button>
						))}
					</div>

					<div className="lg:col-span-3 space-y-6">
						{activeTab === "bank" && (
							<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
								<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
											<Building2 className="w-6 h-6" />
										</div>
										<div>
											<h3 className="text-[15px] font-extrabold text-slate-900">Danh sách tài khoản</h3>
											<p className="text-[12px] text-slate-500 font-bold">Dùng để sinh mã QR thanh toán tự động</p>
										</div>
									</div>
									<button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[13px] font-black hover:bg-slate-200 transition-all shadow-sm cursor-pointer">
										<Plus className="w-4 h-4" /> Thêm tài khoản
									</button>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{loading ? (
										<div className="col-span-2 py-20 text-center text-slate-400 font-bold">Đang tải cấu hình...</div>
									) : banks.length === 0 ? (
										<div className="col-span-2 py-20 text-center bg-white border border-dashed rounded-2xl text-slate-400 font-bold">Chưa có tài khoản ngân hàng nào</div>
									) : (
										banks.map((bank) => (
											<div key={bank.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
												<div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />
												<div className="relative z-10 flex flex-col h-full">
													<div className="flex items-start justify-between mb-4">
														<span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-black uppercase tracking-widest border border-blue-100">{bank.bank_name}</span>
														<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
															<button onClick={() => handleDeleteBank(bank.id)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
														</div>
													</div>
													<div className="space-y-4 flex-1">
														<div className="flex flex-col">
															<span className="text-[11px] uppercase font-black text-slate-400 tracking-widest">Số tài khoản</span>
															<span className="text-lg font-black text-slate-900 font-mono tracking-tighter">{bank.account_number}</span>
														</div>
														<div className="flex flex-col">
															<span className="text-[11px] uppercase font-black text-slate-400 tracking-widest">Chủ tài khoản</span>
															<span className="text-[13px] font-black text-slate-700 uppercase">{bank.account_name}</span>
														</div>
													</div>
													<div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
														{bank.is_default ? (
															<span className="text-[13px] text-emerald-600 font-black flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Mặc định</span>
														) : (
															<span className="text-[12px] text-slate-300 font-bold">Tài khoản phụ</span>
														)}
														<span className="text-[12px] font-bold text-slate-400">{bank.branch}</span>
													</div>
												</div>
											</div>
										))
									)}
								</div>
							</motion.div>
						)}

						{(activeTab === "gateways" || activeTab === "methods") && (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-12 rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center space-y-4">
								<div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300"><ShieldCheck className="w-8 h-8" /></div>
								<div>
									<h4 className="text-[15px] font-bold text-slate-900">Tính năng đang phát triển</h4>
									<p className="text-[13px] text-slate-500 font-medium max-w-sm mt-1">Hệ thống đang tích hợp VNPay và MoMo trong đợt cập nhật tới.</p>
								</div>
							</motion.div>
						)}
					</div>
				</div>
			</div>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm tài khoản ngân hàng" size="md">
				<BankForm onSubmit={handleAddBank} onCancel={() => setIsModalOpen(false)} />
			</Modal>
		</div>
	);
};

export default TransactionConfigPage;
