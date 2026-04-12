import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Bell,
	Search,
	PlusCircle,
	MinusCircle,
	ChevronDown,
	Settings,
	Grid,
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
	const managementPath = role === "user" ? "/profile" : role === "admin" ? "/admin" : "/dashboard";

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
		<div className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-40 sticky top-0 shadow-sm shadow-slate-200/50 gap-6">
			{/* Left Section */}
			<div className="flex-1 flex items-center gap-4 max-w-3xl">
				{isHomeRoute ?
					<Link
						to="/"
						className="flex items-center gap-3 group"
					>
						<img
							src="/logo.jpg"
							alt="HomeSpot"
							className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
						/>
						<div className="hidden sm:block">
							<p className="text-sm font-black tracking-tight text-slate-900">HomeSpot</p>
							<p className="text-[11px] font-semibold text-slate-500">Nền tảng cho thuê phòng</p>
						</div>
					</Link>
				:	<>
						{/* Building Switcher */}
						{role !== "user" && (
							<div
								className="relative"
								ref={buildingRef}
							>
								<button
									onClick={() => setIsBuildingOpen(!isBuildingOpen)}
									className={`flex items-center gap-3 px-3 py-1.5 bg-[#f8f9fa] border border-slate-200 rounded-lg text-sm font-semibold transition-all cursor-pointer min-w-40 ${
										isBuildingOpen ? "border-brand-primary shadow-sm" : "hover:border-slate-300"
									}`}
								>
									<span className="text-slate-700 truncate">{selectedBuildingName}</span>
									<ChevronDown
										className={`w-3.5 h-3.5 ml-auto text-slate-400 transition-transform ${isBuildingOpen ? "rotate-180 text-brand-primary" : ""}`}
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
									className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600/30 transition-all"
								/>
								<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-teal-600 transition-colors" />
							</div>
						)}
					</>
				}
			</div>

			{/* Right Actions */}
			<div className="flex items-center gap-4">
				{/* Action Buttons */}
				<div
					className={`hidden lg:flex items-center gap-2 ${
						user ? "pr-4 border-r border-slate-100" : ""
					}`}
				>
					{user ?
						<>
							{isHomeRoute && (
								<Link to={managementPath}>
									<motion.button
										whileHover={{ scale: 1.03 }}
										whileTap={{ scale: 0.97 }}
										className="flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-primary text-brand-primary rounded-xl text-sm font-black transition-all cursor-pointer hover:bg-brand-bg"
									>
										<LayoutDashboard className="w-4.5 h-4.5" />
										<span>Quản lý</span>
									</motion.button>
								</Link>
							)}
							<Link to="/my-listings?action=create">
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-black transition-all cursor-pointer shadow-lg shadow-brand-dark/20 hover:shadow-brand-dark/40"
								>
									<PlusCircle className="w-5 h-5" />
									<span>Đăng tin</span>
								</motion.button>
							</Link>
							{role !== "user" && (
								<>
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => setIsIncomeModalOpen(true)}
										className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
									>
										<PlusCircle className="w-3.5 h-3.5" />
										<span>Thu nhập</span>
									</motion.button>
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => setIsExpenseModalOpen(true)}
										className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
									>
										<MinusCircle className="w-3.5 h-3.5" />
										<span>Chi phí</span>
									</motion.button>
								</>
							)}
						</>
					:	<>
							<Link to="/login">
								<motion.button
									whileHover={{ scale: 1.03 }}
									whileTap={{ scale: 0.97 }}
									className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-black transition-all cursor-pointer hover:bg-slate-50"
								>
									Đăng nhập
								</motion.button>
							</Link>
							<Link to="/register">
								<motion.button
									whileHover={{ scale: 1.03 }}
									whileTap={{ scale: 0.97 }}
									className="px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-black transition-all cursor-pointer shadow-lg shadow-brand-dark/20 hover:shadow-brand-dark/40"
								>
									Đăng ký
								</motion.button>
							</Link>
						</>
					}
				</div>

				{/* Icons */}
				{user && (
					<div className="flex items-center gap-1.5 pt-0.5">
						<button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
							<Grid className="w-5 h-5" />
						</button>
						<button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all relative cursor-pointer">
							<Bell className="w-5 h-5" />
							{notificationCount > 0 && (
								<span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
							)}
						</button>
						<button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
							<Settings className="w-5 h-5" />
						</button>
					</div>
				)}

				{/* Profile */}
				{user ?
					<div
						className="relative pl-6 border-l border-slate-100"
						ref={dropdownRef}
					>
						<button
							onClick={() => setDropdownOpen(!dropdownOpen)}
							className="flex items-center gap-3 h-full cursor-pointer group"
						>
							<div className="text-right hidden sm:block">
								<p className="text-sm font-black text-slate-800 leading-tight truncate max-w-30">
									{user.user_metadata?.full_name || "Người dùng"}
								</p>
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
									{ROLE_LABELS[role] || role}
								</p>
							</div>
							<div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white ring-4 ring-teal-50 group-hover:ring-teal-100 transition-all shadow-sm">
								<span className="text-sm font-black italic">
									{(user.user_metadata?.full_name?.[0] || "U").toUpperCase()}
								</span>
							</div>
							<ChevronDown
								className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
							/>
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
				:	<div className="flex items-center gap-2 lg:hidden">
						<Link
							to="/login"
							className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
						>
							Đăng nhập
						</Link>
						<Link
							to="/register"
							className="px-3 py-2 rounded-lg bg-brand-dark text-white text-xs font-bold hover:bg-slate-800 transition-colors"
						>
							Đăng ký
						</Link>
					</div>
				}
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
