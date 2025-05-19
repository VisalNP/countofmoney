import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
  const linkStyle = "block p-4 bg-g-secondary-bg hover:bg-g-hover-bg rounded-lg shadow-md transition-colors duration-150 mb-4 text-g-primary-text text-lg";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-g-primary-text mb-8 text-center">Admin Dashboard</h1>
      <nav className="space-y-4">
        <Link to="/admin/cryptos" className={linkStyle}>
          Manage Cryptocurrencies
        </Link>
        <Link to="/admin/rss-feeds" className={linkStyle}>
          Manage RSS Feeds
        </Link>
        <Link to="/admin/preferences" className={linkStyle}>
          Manage Application Preferences
        </Link>
      </nav>
    </div>
  );
};
export default AdminDashboardPage;