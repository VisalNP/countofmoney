import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-secondary-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-accent-blue hover:text-blue-400 font-bold text-xl mr-6">
              Welcome to your Dashboard
            </Link>
            {isAuthenticated && user?.isAdmin && (
              <Link
                to="/admin"
                className="text-secondary-text hover:text-primary-text px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </Link>
            )}
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                {user && <span className="text-secondary-text mr-4">Hello, {user.nickname || user.email}</span>}
                <Link
                  to="/profile"
                  className="text-secondary-text hover:text-primary-text px-3 py-2 rounded-md text-sm font-medium mr-2"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm" 
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-secondary-text hover:text-primary-text px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-4 btn-primary text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;