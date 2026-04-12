import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Bell,
	Search,
	PlusCircle,
	MinusCircle,
	ChevronDown,
	LayoutDashboard,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useBuilding } from "../contexts/BuildingContext";
import { api } from "../lib/api";
import IncomeForm from "./modals/IncomeForm";
import ExpenseForm from "./modals/ExpenseForm";
import Modal from "./modals/Modal";

const Navbar = () => {
	const { user, signOut, role } = useAuth();
	const { buildings, selectedBuildingId, setSelectedBuildingId } = useBuilding();
	const location = useLocation();
	const isHomeRoute = location.pathname === "/";

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [notificationCount, setNotificationCount] = useState(0);
	const [search, setSearch] = useState("");
	const [isBuildingOpen, setIsBuildingOpen] = useState(false);
	const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
	const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

	const dropdownRef = useRef<HTMLDivElement>(null);
	const buildingRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (user && (role === "landlord" || role === "admin")) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			api.get<{ listings: any[] }>("/api/listings/my").then(({ data }) => {
				if (data && data.listings) {
					const attention = data.listings.filter(
						(l) => l.status === "pending" || l.status === "rejected",
					).length;
					setNotificationCount(attention);
				}
			});
		}
	}, [user, role]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
			if (buildingRef.current && !buildingRef.current.contains(e.target as Node)) {
				setIsBuildingOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selectedBuildingName =
		selectedBuildingId ?
			buildings.find((b) => b.id === selectedBuildingId)?.name || "N/A"
		:	"Mọi toà nhà";
	const managementPath = role === "user" ? "/profile" : "/dashboard";

	const handleSignOut = async () => {
		setDropdownOpen(false);
		await signOut();
	};

	const ROLE_LABELS: Record<string, string> = {
		user: "Khách",
		landlord: "Chủ trọ",
		broker: "Môi giới",
		admin: "Admin",
	};

	return (
		<div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-40 sticky top-0 shadow-sm shadow-slate-200/50 gap-4">
			{/* Building Switcher & Search Bar */}
			<div className="flex-1 flex items-center gap-3 max-w-3xl">
				{/* Building Switcher */}
				{role !== "user" && (
					<div
						className="relative"
						ref={buildingRef}
					>
						<button
							onClick={() => setIsBuildingOpen(!isBuildingOpen)}
							className={`flex items-center gap-2.5 px-3 py-1 bg-[#f8f9fa] border border-slate-200 rounded-lg text-sm font-semibold transition-all cursor-pointer min-w-36 ${
								isBuildingOpen ? "border-brand-primary shadow-sm" : "hover:border-slate-300"
							}`}
						>
							<span className="text-slate-700 truncate text-[13px]">{selectedBuildingName}</span>
							<ChevronDown
								className={`w-3 h-3 ml-auto text-slate-400 transition-transform ${isBuildingOpen ? "rotate-180 text-brand-primary" : ""}`}
							/>
						</button>

						<AnimatePresence>
							{isBuildingOpen && (
								<motion.div
									initial={{ opacity: 0, y: 8, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: 8, scale: 0.95 }}
									transition={{ duration: 0.15 }}
									className="absolute left-0 top-[calc(100%+8px)] w-65 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-slate-100 overflow-hidden z-50 py-1"
								>
									<div className="px-3 py-2 border-b border-slate-50">
										<div className="relative">
											<input
												type="text"
												placeholder="Tìm kiếm tòa nhà..."
												className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border-none rounded-lg text-xs font-bold focus:ring-0"
											/>
											<Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
										</div>
									</div>
									<div className="max-h-75 overflow-y-auto py-1 scrollbar-hide">
										<button
											onClick={() => {
												setSelectedBuildingId(null);
												setIsBuildingOpen(false);
											}}
											className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${
												selectedBuildingId === null ?
													"bg-brand-bg text-brand-primary"
												:	"text-slate-600 hover:bg-slate-50"
											}`}
										>
											Mọi toà nhà
										</button>
										{buildings.map((b) => (
											<button
												key={b.id}
												onClick={() => {
													setSelectedBuildingId(b.id);
													setIsBuildingOpen(false);
												}}
												className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${
													selectedBuildingId === b.id ?
														"bg-brand-bg text-brand-primary"
													:	"text-slate-600 hover:bg-slate-50"
												}`}
											>
												{b.name}
											</button>
										))}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}

				{/* Search Bar */}
				{role !== "user" && (
					<div className="relative flex-1 group">
						<input
							type="text"
							placeholder="Tìm kiếm khu vực, dự án, tên phòng..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600/30 transition-all"
						/>
						<Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-teal-600 transition-colors" />
					</div>
				)}
			</div>

			{/* Right Actions */}
			<div className="flex items-center gap-4">
				{/* Action Buttons */}
				<div className="hidden lg:flex items-center gap-1.5 pr-4 border-r border-slate-100">
					{user && isHomeRoute && (
						<Link to={managementPath}>
							<motion.button
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								className="flex items-center justify-center gap-1.5 w-[100px] h-9 bg-white border border-brand-primary text-brand-primary rounded-xl text-[12px] font-black transition-all cursor-pointer hover:bg-brand-bg px-0"
							>
								<LayoutDashboard className="w-3.5 h-3.5" />
								<span>Quản lý</span>
							</motion.button>
						</Link>
					)}
					<Link to="/create-listing">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="flex items-center justify-center gap-1.5 w-[100px] h-9 bg-brand-dark text-white rounded-xl text-[12px] font-black transition-all cursor-pointer shadow-lg shadow-brand-dark/20 hover:shadow-brand-dark/40 px-0"
						>
							<PlusCircle className="w-4 h-4" />
							<span>Đăng tin</span>
						</motion.button>
					</Link>
					{role !== "user" && (
						<>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => setIsIncomeModalOpen(true)}
								className="flex items-center justify-center gap-1.5 w-[100px] h-9 bg-brand-primary text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer px-0"
							>
								<PlusCircle className="w-3 h-3" />
								<span>Thu nhập</span>
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => setIsExpenseModalOpen(true)}
								className="flex items-center justify-center gap-1.5 w-[100px] h-9 bg-brand-primary text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer px-0"
							>
								<MinusCircle className="w-3 h-3" />
								<span>Chi phí</span>
							</motion.button>
						</>
					)}
				</div>

				{/* Icons */}
				<div className="flex items-center gap-1.5 pt-0.5">
					<button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all relative cursor-pointer">
						<Bell className="w-4.5 h-4.5" />
						{notificationCount > 0 && (
							<span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white shadow-sm" />
						)}
					</button>
				</div>

				{/* Profile */}
				{user && (
					<div
						className="relative pl-4 border-l border-slate-100"
						ref={dropdownRef}
					>
						<button
							onClick={() => setDropdownOpen(!dropdownOpen)}
							className="flex items-center gap-2.5 h-full cursor-pointer group"
						>
							<div className="text-right hidden sm:block">
								<p className="text-[13px] font-black text-slate-800 leading-tight truncate max-w-28">
									{user.user_metadata?.full_name || "Người dùng"}
								</p>
								<p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
									{ROLE_LABELS[role] || role}
								</p>
							</div>
							<div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white ring-2 ring-teal-50 group-hover:ring-teal-100 transition-all shadow-sm">
								<span className="text-[13px] font-black italic">
									{(user.user_metadata?.full_name?.[0] || "U").toUpperCase()}
								</span>
							</div>
						</button>

						<AnimatePresence>
							{dropdownOpen && (
								<motion.div
									initial={{ opacity: 0, y: 8, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: 8, scale: 0.95 }}
									transition={{ duration: 0.15 }}
									className="absolute right-0 top-[calc(100%+8px)] w-50 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-slate-100 overflow-hidden z-50 py-1"
								>
									<Link
										to="/profile"
										onClick={() => setDropdownOpen(false)}
										className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
									>
										Hồ sơ cá nhân
									</Link>
									<button
										onClick={handleSignOut}
										className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
									>
										Đăng xuất
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}
			</div>

			{/* Modals */}
			<Modal
				isOpen={isIncomeModalOpen}
				onClose={() => setIsIncomeModalOpen(false)}
				title="+ Thu nhập"
				size="lg"
			>
				<IncomeForm
					onCancel={() => setIsIncomeModalOpen(false)}
					onSubmit={async (data) => {
						try {
							await api.post("/api/transactions", { ...data, type: "income" });
							setIsIncomeModalOpen(false);
							alert("Tạo phiếu thu thành công!");
						} catch (err) {
							console.error(err);
							alert("Lỗi khi tạo phiếu thu");
						}
					}}
				/>
			</Modal>

			<Modal
				isOpen={isExpenseModalOpen}
				onClose={() => setIsExpenseModalOpen(false)}
				title="- Chi phí"
				size="lg"
			>
				<ExpenseForm
					onCancel={() => setIsExpenseModalOpen(false)}
					onSubmit={async (data) => {
						try {
							await api.post("/api/transactions", { ...data, type: "expense" });
							setIsExpenseModalOpen(false);
							alert("Tạo phiếu chi thành công!");
						} catch (err) {
							console.error(err);
							alert("Lỗi khi tạo phiếu chi");
						}
					}}
				/>
			</Modal>
		</div>
	);
};

export default Navbar;
