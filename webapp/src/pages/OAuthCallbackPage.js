import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { storeTokenAndDecodeUser, fetchUserProfile } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const oauthError = params.get('oauth_error');

    if (oauthError) {
        console.error("OAuth Error:", oauthError);
        navigate('/login', { state: { error: `OAuth failed: ${oauthError}` } });
    } else if (token) {
      storeTokenAndDecodeUser(token);
      navigate('/'); 
    } else {
      console.error("OAuth callback called without a token.");
      navigate('/login', { state: { error: 'OAuth process failed to return a token.' } });
    }
  }, [location, navigate, storeTokenAndDecodeUser]);

  return (
    <div>
      <p>Processing authentication...</p>
    </div>
  );
};

export default OAuthCallbackPage;