import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import ContactPage from './pages/ContactPage';
import { mockListings } from './data/mockListings';
import type { Listing } from './data/mockListings';

function HomePage() {
  const [filteredListings, setFilteredListings] = useState<Listing[]>(mockListings);

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
      <Sidebar listings={mockListings} onFilterChange={handleFilterChange} />
      <MapView listings={filteredListings} />
    </motion.div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
