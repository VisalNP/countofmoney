// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const { token, setUser: setAuthUser, storeTokenAndDecodeUser, fetchUserProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    nickname: '', email: '', defaultCurrency: 'EUR', preferredCryptos: [], pressKeywords: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [preferredCryptosStr, setPreferredCryptosStr] = useState('');
  const [pressKeywordsStr, setPressKeywordsStr] = useState('');

  useEffect(() => {
    const fetchUserProfileOnMount = async () => {
      try {
        setLoading(true); setError('');
        const data = await getProfile();
        setProfileData({
          nickname: data.nickname || '', email: data.email || '',
          defaultCurrency: data.defaultCurrency || 'EUR',
          preferredCryptos: data.preferredCryptos || [],
          pressKeywords: data.pressKeywords || [],
        });
        setPreferredCryptosStr((data.preferredCryptos || []).join(', '));
        setPressKeywordsStr((data.pressKeywords || []).join(', '));
      } catch (err) {
        setError(err.message || 'Failed to load profile.'); console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) { fetchUserProfileOnMount(); }
    else { setError("Not authenticated."); setLoading(false); }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePreferredCryptosChange = (e) => setPreferredCryptosStr(e.target.value);
  const handlePressKeywordsChange = (e) => setPressKeywordsStr(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccessMessage('');
    const preferredCryptosArray = preferredCryptosStr.split(',').map(item => item.trim()).filter(Boolean);
    const pressKeywordsArray = pressKeywordsStr.split(',').map(item => item.trim()).filter(Boolean);
    const dataToUpdate = { ...profileData, preferredCryptos: preferredCryptosArray, pressKeywords: pressKeywordsArray };

    try {
      const responseData = await updateProfile(dataToUpdate);
      setSuccessMessage('Profile updated successfully!');
      if (responseData.token && responseData._id) {
        storeTokenAndDecodeUser(responseData.token);
        const { token: receivedToken, ...userDataFromResponse } = responseData;
        setAuthUser(userDataFromResponse);
        setProfileData({
            nickname: userDataFromResponse.nickname || '', email: userDataFromResponse.email || '',
            defaultCurrency: userDataFromResponse.defaultCurrency || 'EUR',
            preferredCryptos: userDataFromResponse.preferredCryptos || [],
            pressKeywords: userDataFromResponse.pressKeywords || [],
        });
        setPreferredCryptosStr((userDataFromResponse.preferredCryptos || []).join(', '));
        setPressKeywordsStr((userDataFromResponse.pressKeywords || []).join(', '));
      } else {
        console.warn("Profile updated, but token/user structure in response was unexpected. Re-fetching profile.");
        const freshProfile = await getProfile(); 
        setAuthUser(freshProfile); 
        setProfileData({ 
            nickname: freshProfile.nickname || '', email: freshProfile.email || '',
            defaultCurrency: freshProfile.defaultCurrency || 'EUR',
            preferredCryptos: freshProfile.preferredCryptos || [],
            pressKeywords: freshProfile.pressKeywords || [],
        });
        setPreferredCryptosStr((freshProfile.preferredCryptos || []).join(', '));
        setPressKeywordsStr((freshProfile.pressKeywords || []).join(', '));
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.'); console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-g-secondary-bg p-6 sm:p-8 rounded-xl shadow-g-dialog">
        <h2 className="text-2xl font-bold text-g-primary-text mb-6 text-center">User Profile</h2>
        
        {error && <p className="mb-4 text-center text-sm text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-md">{error}</p>}
        {successMessage && <p className="mb-4 text-center text-sm text-green-400 bg-green-900 bg-opacity-30 p-3 rounded-md">{successMessage}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-g-secondary-text mb-1">Nickname</label>
            <input type="text" id="nickname" name="nickname" value={profileData.nickname} onChange={handleChange} className="mt-1 block w-full"/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-g-secondary-text mb-1">Email</label>
            <input type="email" id="email" name="email" value={profileData.email} onChange={handleChange} className="mt-1 block w-full"/>
          </div>
          <div>
            <label htmlFor="defaultCurrency" className="block text-sm font-medium text-g-secondary-text mb-1">Default Currency (e.g., EUR, USD)</label>
            <input type="text" id="defaultCurrency" name="defaultCurrency" value={profileData.defaultCurrency} onChange={handleChange} maxLength="3" style={{ textTransform: 'uppercase' }} className="mt-1 block w-full"/>
          </div>
          <div>
            <label htmlFor="preferredCryptosStr" className="block text-sm font-medium text-g-secondary-text mb-1">Preferred Cryptos (CoinGecko IDs, comma-separated)</label>
            <textarea id="preferredCryptosStr" name="preferredCryptosStr" value={preferredCryptosStr} onChange={handlePreferredCryptosChange} rows="3" placeholder="e.g., bitcoin,ethereum,solana" className="mt-1 block w-full"/>
            <p className="mt-1 text-xs text-g-tertiary-text">Enter CoinGecko IDs like 'bitcoin', 'ethereum', not symbols like BTC.</p>
          </div>
          <div>
            <label htmlFor="pressKeywordsStr" className="block text-sm font-medium text-g-secondary-text mb-1">Press Review Keywords (comma-separated)</label>
            <textarea id="pressKeywordsStr" name="pressKeywordsStr" value={pressKeywordsStr} onChange={handlePressKeywordsChange} rows="3" placeholder="e.g., bitcoin news,ethereum price,defi regulation" className="mt-1 block w-full"/>
          </div>
          <div className="pt-2">
            <button type="submit" className="btn btn-primary w-full flex justify-center">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;