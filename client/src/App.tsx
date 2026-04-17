import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import { api } from "./lib/api";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import ListingInfoPanel from "./components/ListingInfoPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ContactPage from "./pages/ContactPage";

import ListingDetailPage from "./pages/ListingDetailPage";
import CreateListingPage from "./pages/CreateListingPage";
import MyListingsPage from "./pages/MyListingsPage";
import DashboardPage from "./pages/DashboardPage";
import CustomerPage from "./pages/CustomerPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import VehiclePage from "./pages/VehiclePage";
import BookingPage from "./pages/BookingPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import AppointmentPage from "./pages/AppointmentPage";
import AdminVerificationPage from "./pages/AdminVerificationPage";
import BuildingStatusPage from "./pages/BuildingStatusPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PricingPage from "./pages/PricingPage";
import ProfilePage from "./pages/ProfilePage";

// PMS Pages
import InvoicesPage from "./pages/InvoicesPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProofOfPaymentPage from "./pages/ProofOfPaymentPage";
import TransactionConfigPage from "./pages/TransactionConfigPage";

import ContractsPage from "./pages/ContractsPage";
import ContractTemplatesPage from "./pages/ContractTemplatesPage";
import BatchInvoicesPage from "./pages/BatchInvoicesPage";

import IncidentsPage from "./pages/IncidentsPage";
import IncidentTypesPage from "./pages/IncidentTypesPage";


// Reports
import OccupancyReportPage from "./pages/OccupancyReportPage";
import CustomerReportPage from "./pages/CustomerReportPage";
import RevenueReportPage from "./pages/RevenueReportPage";
import OwnerReportPage from "./pages/OwnerReportPage";

// Management
import BusinessInfoPage from "./pages/BusinessInfoPage";
import LocationsPage from "./pages/LocationsPage";
import UsersPage from "./pages/UsersPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import ApiManagementPage from "./pages/ApiManagementPage";
import BrokerCartPage from "./pages/BrokerCartPage";
import Storefront from "./pages/Storefront";
import BuildingDetailPage from "./pages/BuildingDetailPage";

import type { Listing, Amenity } from "../../shared/types";
import AppSidebar from "./components/AppSidebar";
import { BuildingProvider } from "./contexts/BuildingContext";
import { applyBusinessThemeFromSettings, applyDefaultAppTheme } from "./lib/brandTheme";
import { ToastProvider } from "./components/Toast";


function HomePage() {
	const [listings, setListings] = useState<Listing[]>([]);
	const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
	const [amenities, setAmenities] = useState<Amenity[]>([]);
	const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		const loadData = async () => {
			setLoading(true);
			const [listingsRes, amenitiesRes] = await Promise.all([
				api.get<{ listings: Listing[] }>("/api/search?limit=200"),
				api.get<{ amenities: Amenity[] }>("/api/search/amenities"),
			]);

			if (!mounted) return;

			if (listingsRes.error || !listingsRes.data) {
				setLoadError(listingsRes.error || "Không thể tải danh sách tin đăng");
			} else {
				setLoadError(null);
				// Explicitly sort by creation date (newest first)
				const sorted = (listingsRes.data.listings || []).sort((a, b) => 
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				);
				setListings(sorted);
				setFilteredListings(sorted);
			}

			if (amenitiesRes.data) {
				setAmenities(amenitiesRes.data.amenities);
			}



			setLoading(false);
		};

		loadData();

		return () => {
			mounted = false;
		};
	}, []);

	const handleFilterChange = useCallback((filtered: Listing[]) => {
		setFilteredListings(filtered);
	}, []);
	const handleSelectListing = useCallback((listingId: string | null) => {
		setSelectedListingId((current) => {
			if (listingId === null) return null;
			return current === listingId ? null : listingId;
		});
	}, []);

	useEffect(() => {
		if (!selectedListingId) return;
		if (!filteredListings.some((listing) => listing.id === selectedListingId)) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSelectedListingId(null);
		}
	}, [filteredListings, selectedListingId]);

	const selectedListing = useMemo(
		() => filteredListings.find((listing) => listing.id === selectedListingId) || null,
		[filteredListings, selectedListingId],
	);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3, delay: 0.15 }}
			className="relative flex flex-1 h-full overflow-hidden bg-brand-bg"
		>
			<div className="absolute inset-0 z-0">
				{loading ?
					<div className="h-full flex items-center justify-center bg-slate-100 text-slate-500">
						<div className="flex flex-col items-center gap-3">
							<div className="w-10 h-10 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin" />
							<p className="text-sm font-medium">Đang tải dữ liệu bản đồ...</p>
						</div>
					</div>
				: loadError ?
					<div className="h-full flex items-center justify-center bg-slate-100 text-red-600 font-medium px-6 text-center">
						{loadError}
					</div>
				:	<MapView
						listings={filteredListings}
						selectedListingId={selectedListingId}
						onSelectListing={handleSelectListing}
					/>
				}
			</div>

			<aside className="absolute inset-y-0 left-0 z-[1100] w-[430px] max-w-[calc(100vw-1rem)]">
				{selectedListing ?
					<ListingInfoPanel
						listing={selectedListing}
						listings={filteredListings}
						onClose={() => setSelectedListingId(null)}
						onSelectListing={handleSelectListing}
					/>
				:	<Sidebar
						listings={listings}
						amenities={amenities}
						onFilterChange={handleFilterChange}
						selectedListingId={selectedListingId}
						onSelectListing={handleSelectListing}
					/>
				}
			</aside>
		</motion.div>
	);
}

function AppFrame({ children }: { children: ReactNode }) {
	const location = useLocation();
	const isMapHome = location.pathname === "/";

	return (
		<>
			{!isMapHome && <AppSidebar />}
			<div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
				<Navbar />
				<main className={`flex-1 ${isMapHome ? "overflow-hidden" : "overflow-y-auto"}`}>
					{children}
				</main>
			</div>
		</>
	);
}

function App() {
	useEffect(() => {
		let mounted = true;

		const syncTheme = async () => {
			const token = localStorage.getItem("access_token");
			if (!token) {
				applyDefaultAppTheme();
				return;
			}

			const { data } = await api.get<{ settings?: { primary_color?: string; text_color?: string } }>(
				"/api/business-settings",
			);
			if (!mounted) return;
			if (data?.settings) {
				applyBusinessThemeFromSettings(data.settings);
				return;
			}
			applyDefaultAppTheme();
		};

		const onThemeUpdated = (event: Event) => {
			const detail = (event as CustomEvent<{ settings?: { primary_color?: string; text_color?: string } }>)
				.detail;
			if (detail?.settings) {
				applyBusinessThemeFromSettings(detail.settings);
				return;
			}
			syncTheme();
		};

		syncTheme();
		window.addEventListener("business-theme-updated", onThemeUpdated as EventListener);
		window.addEventListener("storage", syncTheme);

		return () => {
			mounted = false;
			window.removeEventListener("business-theme-updated", onThemeUpdated as EventListener);
			window.removeEventListener("storage", syncTheme);
		};
	}, []);

	return (
		<Router>
			<AuthProvider>
				<BuildingProvider>
                    <ToastProvider>
					<div className="h-screen w-screen flex overflow-hidden font-sans bg-white">
						<Routes>
							{/* QR Status page — no navbar/sidebar, standalone  */}
							<Route
								path="/qr/:code"
								element={
									<div className="h-full w-full overflow-y-auto overflow-x-hidden bg-slate-50">
										<BuildingStatusPage />
									</div>
								}
							/>

							{/* All other routes with layout */}
							<Route
								path="*"
								element={
									<AppFrame>
												<Routes>
													<Route
														path="/"
														element={<HomePage />}
													/>
													<Route
														path="/register"
														element={<RegisterPage />}
													/>
													<Route
														path="/login"
														element={<LoginPage />}
													/>
													<Route
														path="/contact"
														element={<ContactPage />}
													/>

													<Route
														path="/forgot-password"
														element={<ForgotPasswordPage />}
													/>

													<Route
														path="/pricing"
														element={<PricingPage />}
													/>
													<Route
														path="/listings/:id"
														element={<ListingDetailPage />}
													/>
													<Route
														path="/store/:brokerId"
														element={
															<Storefront />
														}
													/>

													{/* Authenticated routes */}
													<Route
														path="/create-listing"
														element={
															<ProtectedRoute>
																<CreateListingPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/profile"
														element={
															<ProtectedRoute>
																<ProfilePage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/my-listings"
														element={
															<ProtectedRoute>
																<MyListingsPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/dashboard"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<DashboardPage />
															</ProtectedRoute>
														}
													/>

													{/* ── CUSTOMERS ── */}
													<Route
														path="/customers"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<CustomerPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/customers/:id/show"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<CustomerDetailPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/vehicles"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<VehiclePage />
															</ProtectedRoute>
														}
													/>

													{/* ── RESERVATIONS / BOOKINGS ── */}
													<Route
														path="/reservations"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<BookingPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/reservation-history"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<BookingHistoryPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/visitTours"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<AppointmentPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/broker/cart"
														element={
															<ProtectedRoute roles={["broker", "admin"]}>
																<BrokerCartPage />
															</ProtectedRoute>
														}
													/>

													{/* ── PAYMENTS ── */}
													<Route
														path="/invoices"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<InvoicesPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/invoices/batch-create"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<BatchInvoicesPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/transactions"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<TransactionsPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/proof-of-payment"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<ProofOfPaymentPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/transaction-config"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<TransactionConfigPage />
															</ProtectedRoute>
														}
													/>

													{/* ── CONTRACTS ── */}
													<Route
														path="/contracts"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<ContractsPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/contract-templates"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<ContractTemplatesPage />
															</ProtectedRoute>
														}
													/>

													{/* ── MAINTENANCE / INCIDENTS ── */}
													<Route
														path="/incidents"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<IncidentsPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/incident-types"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<IncidentTypesPage />
															</ProtectedRoute>
														}
													/>


													{/* ── REPORTS ── */}
													<Route
														path="/operation/occupancy-rate"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<OccupancyReportPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/customer-report"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<CustomerReportPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/revenues"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<RevenueReportPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/for-owner"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<OwnerReportPage />
															</ProtectedRoute>
														}
													/>

													{/* ── SETTINGS / MANAGEMENT ── */}
													<Route
														path="/business-information"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<BusinessInfoPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/locations"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<LocationsPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/locations/:id"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<BuildingDetailPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/users"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<UsersPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/integrations"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<IntegrationsPage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/api-management"
														element={
															<ProtectedRoute roles={["landlord", "broker", "admin"]}>
																<ApiManagementPage />
															</ProtectedRoute>
														}
													/>

													{/* ── ADMIN ── */}
													<Route
														path="/admin"
														element={
															<ProtectedRoute roles={["admin"]}>
																<AdminVerificationPage />
															</ProtectedRoute>
														}
													/>
												</Routes>
									</AppFrame>
								}
							/>
						</Routes>
					</div>
                    </ToastProvider>
				</BuildingProvider>
			</AuthProvider>
		</Router>
	);
}

export default App;
