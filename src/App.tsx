import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import CoverPage from './pages/CoverPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import ConfessionPage from './pages/ConfessionPage';
import ConfessionListPage from './pages/ConfessionListPage';
import DebateSpacePage from './pages/DebateSpacePage';
import DebateDetailPage from './pages/DebateDetailPage';
import DailyLifePage from './pages/DailyLifePage';
import NewsPage from './pages/NewsPage';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';
import WelcomeModal from './components/WelcomeModal';
import FriendsPage from './pages/FriendsPage';
import FollowingPage from './pages/FollowPage';
import FansPage from './pages/FansPage';
import LikesPage from './pages/LikesPage';
import SettingsPage from './pages/SettingsPage';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/cover" replace />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setShowWelcomeModal(true);
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/cover" element={<CoverPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Navigation />
            <HomePage />
            {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
          </ProtectedRoute>
        } />
        <Route path="/confession" element={
          <ProtectedRoute>
            <Navigation />
            <ConfessionPage />
          </ProtectedRoute>
        } />
        <Route path="/confession-list" element={
          <ProtectedRoute>
            <Navigation />
            <ConfessionListPage />
          </ProtectedRoute>
        } />
        <Route path="/debate" element={
          <ProtectedRoute>
            <Navigation />
            <DebateSpacePage />
          </ProtectedRoute>
        } />
        <Route path="/debate/:id" element={
          <ProtectedRoute>
            <Navigation />
            <DebateDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/daily" element={
          <ProtectedRoute>
            <Navigation />
            <DailyLifePage />
          </ProtectedRoute>
        } />
        <Route path="/news" element={
          <ProtectedRoute>
            <Navigation />
            <NewsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Navigation />
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/friends" element={
          <ProtectedRoute>
            <Navigation />
            <FriendsPage />
          </ProtectedRoute>
        } />
        <Route path="/following" element={<FollowingPage />} />
        <Route path="/fans" element={<FansPage />} />
        <Route path="/likes" element={<LikesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/cover"} replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;