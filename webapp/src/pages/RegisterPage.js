// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(nickname, email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-g-secondary-bg p-8 sm:p-10 rounded-xl shadow-g-dialog">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-g-primary-text">
            Create your account
          </h2>
        </div>
        {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Nickname Input */}
          <div>
            <label htmlFor="nickname" className="sr-only">Nickname</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              autoComplete="nickname"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 focus:z-10 sm:text-sm" // Base styles from index.css will apply
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength="6"
              className="appearance-none rounded-md relative block w-full px-3 py-2 focus:z-10 sm:text-sm"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full group relative flex justify-center"
            >
              Create Account
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-g-secondary-text">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-g-accent-blue hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;