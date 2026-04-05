import { useState, useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import { api } from "./lib/api";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ContactPage from "./pages/ContactPage";
import SearchPage from "./pages/SearchPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import CreateListingPage from "./pages/CreateListingPage";
import CreateBuildingPage from "./pages/CreateBuildingPage";
import MyListingsPage from "./pages/MyListingsPage";
import DashboardPage from "./pages/DashboardPage";
import CustomerPage from "./pages/CustomerPage";
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
import ContractsPage from "./pages/ContractsPage";
import IncidentsPage from "./pages/IncidentsPage";
import AssetsPage from "./pages/AssetsPage";
import EventsPage from "./pages/EventsPage";
import ReportsPage from "./pages/ReportsPage";
import BusinessSettingsPage from "./pages/BusinessSettingsPage";
import type { Listing, Amenity } from "../../shared/types";

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
				setListings(listingsRes.data.listings);
				setFilteredListings(listingsRes.data.listings);
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

	useEffect(() => {
		if (filteredListings.length === 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSelectedListingId(null);
			return;
		}
		if (
			!selectedListingId ||
			!filteredListings.some((listing) => listing.id === selectedListingId)
		) {
			setSelectedListingId(filteredListings[0].id);
		}
	}, [filteredListings, selectedListingId]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3, delay: 0.15 }}
			className="flex flex-1 overflow-hidden"
		>
			<Sidebar
				listings={listings}
				amenities={amenities}
				onFilterChange={handleFilterChange}
				selectedListingId={selectedListingId}
				onSelectListing={setSelectedListingId}
			/>
			{loading ?
				<div className="flex-1 h-full flex items-center justify-center bg-slate-100 text-slate-500">
					<div className="flex flex-col items-center gap-3">
						<div className="w-10 h-10 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin" />
						<p className="text-sm font-medium">Đang tải dữ liệu bản đồ...</p>
					</div>
				</div>
			: loadError ?
				<div className="flex-1 h-full flex items-center justify-center bg-slate-100 text-red-600 font-medium px-6 text-center">
					{loadError}
				</div>
			:	<MapView
					listings={filteredListings}
					selectedListingId={selectedListingId}
					onSelectListing={setSelectedListingId}
				/>
			}
		</motion.div>
	);
}

import AppSidebar from "./components/AppSidebar";

import { BuildingProvider } from "./contexts/BuildingContext";

function App() {
	return (
		<Router>
			<AuthProvider>
				<BuildingProvider>
					<div className="h-screen w-screen flex overflow-hidden font-sans bg-white">
					<Routes>
						{/* QR Status page — no navbar/sidebar, standalone  */}
						<Route
							path="/qr/:code"
							element={<BuildingStatusPage />}
						/>

						{/* All other routes with layout */}
						<Route
							path="*"
							element={
								<>
									<AppSidebar />
									<div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
										<Navbar />
										<main className="flex-1 overflow-y-auto">
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
													path="/search"
													element={<SearchPage />}
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

												{/* Authenticated routes */}
												<Route
													path="/create-building"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<CreateBuildingPage />
														</ProtectedRoute>
													}
												/>
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
												{/* Legacy route kept for compatibility */}
												<Route
													path="/customers/vehicles"
													element={<Navigate to="/vehicles" replace />}
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
												{/* PMS-style routes */}
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
												{/* Extra services / utilities — placeholder */}
												<Route
													path="/extra-services"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BookingPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/utilities"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BookingPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/messages"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<AppointmentPage />
														</ProtectedRoute>
													}
												/>
												{/* Legacy bookings routes kept for compatibility */}
												<Route path="/bookings" element={<Navigate to="/reservations" replace />} />
												<Route path="/bookings/history" element={<Navigate to="/reservation-history" replace />} />
												<Route path="/bookings/appointments" element={<Navigate to="/visitTours" replace />} />

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
													path="/transactions"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<InvoicesPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/proof-of-payment"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<InvoicesPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/transaction-config"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<InvoicesPage />
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
															<ContractsPage />
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
															<IncidentsPage />
														</ProtectedRoute>
													}
												/>

												{/* ── ASSETS ── */}
												<Route
													path="/assets/id-base"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<AssetsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/assets/quantity-base"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<AssetsPage />
														</ProtectedRoute>
													}
												/>

												{/* ── COMMUNITY ── */}
												<Route
													path="/events"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<EventsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/posts"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<EventsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/blogs"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<EventsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/blogs/:id"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<EventsPage />
														</ProtectedRoute>
													}
												/>

												{/* ── REPORTS ── */}
												<Route
													path="/operation/occupancy-rate"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<ReportsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/customer-report"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<ReportsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/revenues"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<ReportsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/for-owner"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<ReportsPage />
														</ProtectedRoute>
													}
												/>

												{/* ── SETTINGS / MANAGEMENT ── */}
												<Route
													path="/business-information"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BusinessSettingsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/locations"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BusinessSettingsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/services"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BusinessSettingsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/users"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BusinessSettingsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/roles"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BusinessSettingsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/integrations"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BusinessSettingsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/api-management"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BusinessSettingsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/asset-groups"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BusinessSettingsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/asset-types"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BusinessSettingsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/suppliers"
													element={
														<ProtectedRoute roles={["landlord", "broker", "admin"]}>
															<BusinessSettingsPage />
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
										</main>
									</div>
								</>
							}
						/>
					</Routes>
				</div>
			</BuildingProvider>
		</AuthProvider>
	</Router>
);
}

export default App;
