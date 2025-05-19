import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/users/auth/google`;
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-g-secondary-bg p-8 sm:p-10 rounded-xl shadow-g-dialog">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-g-primary-text">
            Sign in to your account
          </h2>
        </div>
        {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary w-full group relative flex justify-center" 
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-g-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-g-secondary-bg text-g-secondary-text">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              className="btn btn-secondary w-full inline-flex justify-center items-center"
            >
              <svg className="w-5 h-5 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10c5.286 0 9.634-4.018 9.968-9.168A10.005 10.005 0 0010 0zm3.909 11.455c-.227.682-.728 1.227-1.364 1.591a4.005 4.005 0 01-2.681.227 4.005 4.005 0 01-2.455-2.045A4.091 4.091 0 0110 6.545c.614 0 1.2.125 1.727.352.528.227.978.568 1.319.995l-1.182 1.182c-.25-.273-.557-.489-.909-.625a1.914 1.914 0 00-1.955.091 1.91 1.91 0 00-1.045 2.545c.16.727.76 1.284 1.487 1.409a1.905 1.905 0 001.955-.091c.477-.273.818-.727.955-1.227H10v-1.818h3.909v1.818z" clipRule="evenodd" />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-g-secondary-text">
          Not a member?{' '}
          <Link to="/register" className="font-medium text-g-accent-blue hover:underline">
            Start your journey
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;