import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import GlobalModal from './components/GlobalModal';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SignupVerify from './pages/SignupVerify';
import UserDashboard from './pages/UserDashboard';
import UserWishlist from './pages/UserWishlist';
import UserBookings from './pages/UserBookings';
import UserReviews from './pages/UserReviews';
import UserProfile from './pages/UserProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

import Navbar from './components/Navbar';
import ListingsIndex from './pages/ListingsIndex';
import ShowListing from './pages/ShowListing';
import NewListing from './pages/admin/NewListing';
import EditListing from './pages/admin/EditListing';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmation from './pages/BookingConfirmation';

function AppRoutes() {
  const { user, loading } = useAuth();
  const { adminSettings } = usePreferences();
  const location = useLocation();

  useEffect(() => {
    if (adminSettings?.siteName) {
      document.title = adminSettings.siteName;
    }
  }, [adminSettings]);

  if (adminSettings?.maintenanceMode && !user?.isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
        textAlign: 'center',
        padding: '2rem',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🛠️</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.025em' }}>
          Under Maintenance
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '500px', lineHeight: 1.6, marginBottom: '2rem', marginLeft: 'auto', marginRight: 'auto' }}>
          We are currently performing scheduled maintenance to improve our platform. We'll be back shortly!
        </p>
        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Please contact support if you need immediate assistance.
        </div>
      </div>
    );
  }

  // Paths that should not show the standard Bootstrap navbar
  const isAdminRoute = location.pathname === '/admin-dashboard' || location.pathname.startsWith('/admin/');
  const isUserRoute = location.pathname === '/dashboard' || location.pathname.startsWith('/user/');
  const isBare = ['/', '/login', '/signup', '/signup/verify', '/confirmation'].includes(location.pathname) || 
                location.pathname.startsWith('/payment/') || isAdminRoute || isUserRoute;
  const showNavbar = !isBare;

  // Helpers: guards
  const adminGuard = (element) => {
    if (loading) return null;
    return user && user.isAdmin
      ? element
      : user
        ? <Navigate to="/dashboard" replace />
        : <Navigate to="/login" replace />;
  };

  const userGuard = (element) => {
    if (loading) return null;
    return user
      ? element
      : <Navigate to="/login" replace />;
  };

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* ── PUBLIC ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/verify" element={<SignupVerify />} />

        {/* ── USER DASHBOARD ── */}
        <Route path="/dashboard" element={userGuard(<UserDashboard />)} />
        <Route path="/user/wishlist" element={userGuard(<UserWishlist />)} />
        <Route path="/user/bookings" element={userGuard(<UserBookings />)} />
        <Route path="/user/reviews" element={userGuard(<UserReviews />)} />
        <Route path="/user/profile" element={userGuard(<UserProfile />)} />

        {/* ── ADMIN PAGES ── */}
        <Route path="/admin-dashboard" element={adminGuard(<AdminDashboard />)} />
        <Route path="/admin/listings" element={adminGuard(<AdminListings />)} />
        <Route path="/admin/bookings" element={adminGuard(<AdminBookings />)} />
        <Route path="/admin/users" element={adminGuard(<AdminUsers />)} />
        <Route path="/admin/analytics" element={adminGuard(<AdminAnalytics />)} />
        <Route path="/admin/settings" element={adminGuard(<AdminSettings />)} />

        {/* ── USER-ONLY LISTINGS ── */}
        <Route path="/listings" element={userGuard(<ListingsIndex />)} />
        <Route path="/listings/filter" element={userGuard(<ListingsIndex />)} />
        <Route path="/listings/search" element={userGuard(<ListingsIndex />)} />

        {/* ── ADMIN-ONLY LISTING MUTATIONS ── */}
        <Route
          path="/admin/listings/new"
          element={adminGuard(<NewListing />)}
        />
        <Route
          path="/admin/listings/:id/edit"
          element={adminGuard(<EditListing />)}
        />

        {/* ── USER-ONLY LISTING DETAIL ── */}
        <Route path="/listings/:id" element={userGuard(<ShowListing />)} />

        {/* ── PAYMENT & CONFIRMATION ── */}
        <Route path="/payment/:id" element={userGuard(<PaymentPage />)} />
        <Route path="/confirmation" element={userGuard(<BookingConfirmation />)} />

        {/* ── FALLBACK ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}



function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <ModalProvider>
          <Router>
            <GlobalModal />
            <AppRoutes />
          </Router>
        </ModalProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
