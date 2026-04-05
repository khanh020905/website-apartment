/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, PieChart, RefreshCw, AlertCircle, FileText } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type {
	BuildingWithRooms,
	DashboardStats,
	CreateBuildingInput,
	ContractWithRoom,
} from "../../../shared/types";

// Components
import { Overview } from "../components/dashboard/Overview";
import { BuildingList } from "../components/dashboard/BuildingList";
import { BuildingModal } from "../components/dashboard/BuildingModal";
import { ContractList } from "../components/dashboard/ContractList";
import { ContractModal } from "../components/dashboard/ContractModal";

type DashboardTab = "overview" | "buildings" | "contracts";

export default function DashboardPage() {
	const navigate = useNavigate();
	const { canManageBuildings } = useAuth();
	const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Data
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [buildings, setBuildings] = useState<BuildingWithRooms[]>([]);
	const [contracts, setContracts] = useState<ContractWithRoom[]>([]);

	// Modals state
	const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
	const [isContractModalOpen, setIsContractModalOpen] = useState(false);
	const [editingBuilding, setEditingBuilding] = useState<BuildingWithRooms | undefined>(undefined);
	const [editingContract, setEditingContract] = useState<ContractWithRoom | undefined>(undefined);

	useEffect(() => {
		if (canManageBuildings) {
			loadInitialData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canManageBuildings]);

	const loadInitialData = async () => {
		setLoading(true);
		setError(null);
		try {
			const [statsRes, buildingsRes, contractsRes] = await Promise.all([
				api.get<DashboardStats>("/api/dashboard/stats"),
				api.get<{ buildings: BuildingWithRooms[] }>("/api/buildings"),
				api.get<{ contracts: ContractWithRoom[] }>("/api/contracts"),
			]);

			if (statsRes.data) setStats(statsRes.data);
			if (buildingsRes.data) setBuildings(buildingsRes.data.buildings);
			if (contractsRes.data) setContracts(contractsRes.data.contracts);
		} catch (err: any) {
			setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};


	const handleSaveBuilding = async (data: CreateBuildingInput) => {
		try {
			const { error: apiError } =
				editingBuilding ?
					await api.put(`/api/buildings/${editingBuilding.id}`, data)
				:	await api.post("/api/buildings", data);

			if (apiError) return alert(apiError);

			setIsBuildingModalOpen(false);
			setEditingBuilding(undefined);
			loadInitialData();
		} catch {
			alert("Lỗi khi lưu tòa nhà");
		}
	};

	const handleDeleteBuilding = async (id: string) => {
		if (!confirm("Cảnh báo: Tòa nhà chỉ xóa được khi không còn phòng. Tiếp tục?")) return;
		const { error } = await api.delete(`/api/buildings/${id}`);
		if (error) alert(error);
		else loadInitialData();
	};

	// Actions: Contract
	const handleSaveContract = async (data: any) => {
		try {
			if (editingContract) {
				await api.put(`/api/contracts/${editingContract.id}`, data);
			} else {
				await api.post("/api/contracts", data);
			}
			setIsContractModalOpen(false);
			setEditingContract(undefined);
			loadInitialData();
		} catch {
			alert("Lỗi khi lưu hợp đồng");
		}
	};

	const handleDeleteContract = async (id: string) => {
		if (!confirm("Xác nhận kết thúc hợp đồng này? Phòng sẽ được chuyển sang trạng thái trống."))
			return;
		await api.delete(`/api/contracts/${id}`);
		loadInitialData();
	};

	if (!canManageBuildings) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
				<div className="w-32 h-32 bg-rose-50 rounded-[48px] flex items-center justify-center mb-10 border-4 border-white shadow-xl rotate-6">
					<AlertCircle className="w-16 h-16 text-rose-500" />
				</div>
				<h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
					Tính năng giới hạn
				</h2>
				<p className="max-w-md text-slate-500 font-medium leading-relaxed mb-10">
					Bạn cần tài khoản **Chủ trọ** hoặc **Môi giới** để sử dụng bộ công cụ quản lý chuyên
					nghiệp này.
				</p>
				<button
					onClick={() => (window.location.href = "/")}
					className="px-10 py-4 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-900/40 hover:scale-105 transition-transform"
				>
					Quay lại Trang chủ
				</button>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto bg-brand-bg scroll-smooth">
			<div className="max-w-360 mx-auto p-4 md:p-8 space-y-8">
				{/* Top Navigation / Header */}
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
								LANDLORD DASHBOARD
							</span>
							{loading && <RefreshCw className="w-4 h-4 text-brand-primary/50 animate-spin" />}
						</div>
						<h1 className="text-4xl font-black text-brand-ink tracking-tighter">
							Quản lý Phòng trọ
						</h1>
					</div>

					<div className="flex items-center gap-2 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
						{(["overview", "buildings", "contracts"] as const).map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
									activeTab === tab ?
										"bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
									:	"text-slate-400 hover:bg-slate-50 hover:text-brand-ink"
								}`}
							>
								{tab === "overview" && <PieChart className="w-4 h-4" />}
								{tab === "buildings" && <Building2 className="w-4 h-4" />}
								{tab === "contracts" && <FileText className="w-4 h-4" />}
								{tab === "overview" ? "Tổng quan" : tab === "buildings" ? "Tòa nhà" : "Hợp đồng"}
							</button>
						))}
					</div>
				</div>

				{error && (
					<div className="mx-4 p-4 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 font-bold text-sm flex items-center gap-3">
						<AlertCircle className="w-5 h-5 shrink-0" />
						{error}
						<button
							onClick={loadInitialData}
							className="ml-auto underline decoration-2 underline-offset-4"
						>
							Thử lại
						</button>
					</div>
				)}

				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						className="px-4"
					>
						{activeTab === "overview" && stats && <Overview stats={stats} />}

						{activeTab === "buildings" && (
							<BuildingList
								buildings={buildings}
								selectedId={null}
								onSelect={() => {}}
								onAdd={() => navigate("/create-building")}
								onEdit={(b) => {
									setEditingBuilding(b);
									setIsBuildingModalOpen(true);
								}}
								onDelete={handleDeleteBuilding}
							/>
						)}

						{activeTab === "contracts" && (
							<ContractList
								contracts={contracts}
								onEdit={(c) => {
									setEditingContract(c);
									setIsContractModalOpen(true);
								}}
								onDelete={handleDeleteContract}
							/>
						)}
					</motion.div>
				</AnimatePresence>

				{/* Global Loading Overlay */}
				{loading && !stats && !buildings.length && (
					<div className="py-40 flex flex-col items-center justify-center space-y-6">
						<div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
						<p className="text-brand-primary/50 font-black uppercase tracking-[0.3em] text-xs">
							Loading Intelligence...
						</p>
					</div>
				)}
			</div>

			<BuildingModal
				isOpen={isBuildingModalOpen}
				onClose={() => setIsBuildingModalOpen(false)}
				onSave={handleSaveBuilding}
				initialData={editingBuilding}
			/>

			<ContractModal
				isOpen={isContractModalOpen}
				onClose={() => setIsContractModalOpen(false)}
				onSave={handleSaveContract}
				initialData={editingContract}
				room={editingContract?.room as any}
			/>
		</div>
	);
}
