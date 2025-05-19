// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import ProfilePage from './pages/ProfilePage';
import CryptoDetailPage from './pages/CryptoDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCryptosPage from './pages/admin/AdminCryptosPage';
import AdminRSSFeedsPage from './pages/admin/AdminRSSFeedsPage';
import AdminPreferencesPage from './pages/admin/AdminPreferencesPage';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/crypto/:coingeckoId" element={<CryptoDetailPage />} />
          </Route>
          <Route path="/admin" element={<AdminProtectedRoute />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="cryptos" element={<AdminCryptosPage />} />
            <Route path="rss-feeds" element={<AdminRSSFeedsPage />} />
            <Route path="preferences" element={<AdminPreferencesPage />} />
          </Route>
          <Route path="*" element={<div><h2>404 - Page Not Found</h2></div>} />
        </Routes>
      </div>
    </>
  );
}

export default App;