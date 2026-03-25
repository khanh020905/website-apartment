import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { api } from './lib/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ContactPage from './pages/ContactPage';
import SearchPage from './pages/SearchPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import MyListingsPage from './pages/MyListingsPage';
import DashboardPage from './pages/DashboardPage';
import AdminVerificationPage from './pages/AdminVerificationPage';
import BuildingStatusPage from './pages/BuildingStatusPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import type { Listing } from '../../shared/types';

function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadListings = async () => {
      setLoading(true);
      const { data, error } = await api.get<{ listings: Listing[] }>('/api/search?limit=200');
      if (!mounted) return;

      if (error || !data) {
        setLoadError(error || 'Không thể tải danh sách tin đăng');
        setListings([]);
        setFilteredListings([]);
      } else {
        setLoadError(null);
        setListings(data.listings);
        setFilteredListings(data.listings);
      }
      setLoading(false);
    };

    loadListings();

    return () => {
      mounted = false;
    };
  }, []);

  const handleFilterChange = useCallback((filtered: Listing[]) => {
    setFilteredListings(filtered);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="flex flex-1 overflow-hidden"
    >
      <Sidebar listings={listings} onFilterChange={handleFilterChange} />
      {loading ? (
        <div className="flex-1 h-full flex items-center justify-center bg-slate-100 text-slate-500">
          Đang tải dữ liệu...
        </div>
      ) : loadError ? (
        <div className="flex-1 h-full flex items-center justify-center bg-slate-100 text-red-600 font-medium px-6 text-center">
          {loadError}
        </div>
      ) : (
        <MapView listings={filteredListings} />
      )}
    </motion.div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-white">
          <Routes>
            {/* QR Status page — no navbar, standalone  */}
            <Route path="/qr/:code" element={<BuildingStatusPage />} />

            {/* All other routes with navbar */}
            <Route path="*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/listings/:id" element={<ListingDetailPage />} />

                  {/* Authenticated routes */}
                  <Route path="/create-listing" element={<CreateListingPage />} />
                  <Route path="/my-listings" element={
                    <ProtectedRoute>
                      <MyListingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute roles={['landlord', 'broker', 'admin']}>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminVerificationPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
