import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import type {
	BuildingWithRooms,
	DashboardStats,
	CreateBuildingInput,
	ContractWithRoom,
} from "../../../shared/types";

// Components
import { Overview } from "../components/dashboard/Overview";

import { BuildingModal } from "../components/dashboard/BuildingModal";

import { ContractModal } from "../components/dashboard/ContractModal";



export default function DashboardPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Data
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [buildings, setBuildings] = useState<BuildingWithRooms[]>([]);

	// Modals state
	const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
	const [isContractModalOpen, setIsContractModalOpen] = useState(false);
	const [editingBuilding, setEditingBuilding] = useState<BuildingWithRooms | undefined>(undefined);
	const [editingContract, setEditingContract] = useState<ContractWithRoom | undefined>(undefined);

	useEffect(() => {
		loadInitialData();
	}, []);

	const loadInitialData = async () => {
		setLoading(true);
		setError(null);
		try {
			const [statsRes, buildingsRes] = await Promise.all([
				api.get<DashboardStats>("/api/dashboard/stats"),
				api.get<{ buildings: BuildingWithRooms[] }>("/api/buildings"),
			]);

			if (statsRes.data) setStats(statsRes.data);
			if (buildingsRes.data) setBuildings(buildingsRes.data.buildings);
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





	return (
		<div className="flex-1 overflow-y-auto bg-brand-bg scroll-smooth">
			<div className="max-w-360 mx-auto p-4 md:p-8 space-y-8">
				{/* Top Navigation / Header */}
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
					<div>
						<h1 className="text-xl font-bold text-slate-900 tracking-tight">Trang tổng quan</h1>
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
						key="dashboard-overview"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						className="px-4"
					>
						{stats && <Overview stats={stats} />}

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
