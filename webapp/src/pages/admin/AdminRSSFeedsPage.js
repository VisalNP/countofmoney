// src/pages/admin/AdminRSSFeedsPage.js
import React, { useState, useEffect } from 'react';
import { getRSSFeeds, addRSSFeed, updateRSSFeed, deleteRSSFeed } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminRSSFeedsPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentFeed, setCurrentFeed] = useState({ id: null, name: '', url: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchFeeds = async () => {
    try { setIsLoading(true); setError(''); const data = await getRSSFeeds(); setFeeds(data || []); }
    catch (err) { setError(err.message || 'Failed to load RSS feeds.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchFeeds(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentFeed((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => { setCurrentFeed({ id: null, name: '', url: '' }); setIsEditing(false); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccessMessage('');
    if (!currentFeed.name || !currentFeed.url) { setError('Name and URL are required.'); return; }
    try {
      if (isEditing && currentFeed.id) {
        await updateRSSFeed(currentFeed.id, { name: currentFeed.name, url: currentFeed.url });
        setSuccessMessage(`RSS Feed '${currentFeed.name}' updated successfully!`);
      } else {
        await addRSSFeed({ name: currentFeed.name, url: currentFeed.url });
        setSuccessMessage(`RSS Feed '${currentFeed.name}' added successfully!`);
      }
      resetForm(); fetchFeeds();
    } catch (err) { setError(err.message || `Failed to ${isEditing ? 'update' : 'add'} RSS feed.`); }
  };

  const handleEdit = (feed) => { setIsEditing(true); setCurrentFeed({ id: feed._id, name: feed.name, url: feed.url }); setSuccessMessage(''); setError(''); };

  const handleDelete = async (feedId, feedName) => {
    if (window.confirm(`Are you sure you want to delete: ${feedName}?`)) {
      setError(''); setSuccessMessage('');
      try {
        await deleteRSSFeed(feedId);
        setSuccessMessage(`RSS Feed '${feedName}' deleted successfully!`);
        fetchFeeds(); if (currentFeed.id === feedId) resetForm();
      } catch (err) { setError(err.message || 'Failed to delete RSS feed.'); }
    }
  };
  
  const inputClass = "mt-1";
  const labelClass = "block text-sm font-medium text-g-secondary-text mb-1";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-g-primary-text mb-8">Manage RSS Feeds</h1>

      {successMessage && <p className="mb-4 text-sm text-green-400 bg-green-900 bg-opacity-30 p-3 rounded-md">{successMessage}</p>}
      {error && <p className="mb-4 text-sm text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-md">{error}</p>}

      <div className="bg-g-secondary-bg p-6 rounded-lg shadow-g-card mb-8">
        <h3 className="text-xl font-semibold text-g-primary-text mb-4">{isEditing ? 'Edit RSS Feed' : 'Add New RSS Feed'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>Name:</label>
            <input type="text" name="name" value={currentFeed.name} onChange={handleInputChange} required className={inputClass}/>
          </div>
          <div>
            <label htmlFor="url" className={labelClass}>URL:</label>
            <input type="url" name="url" value={currentFeed.url} onChange={handleInputChange} required className={inputClass}/>
          </div>
          <div className="flex space-x-3 pt-2">
            <button type="submit" className="btn btn-primary">{isEditing ? 'Update Feed' : 'Add Feed'}</button>
            {isEditing && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel Edit</button>}
          </div>
        </form>
      </div>

      <div className="bg-g-secondary-bg p-6 rounded-lg shadow-g-card">
        <h3 className="text-xl font-semibold text-g-primary-text mb-4">Configured RSS Feeds</h3>
        {isLoading ? ( <LoadingSpinner /> ) : 
         feeds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-g-border">
              <thead className="bg-g-hover-bg">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">URL</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-g-secondary-bg divide-y divide-g-border">
                {feeds.map((feed) => (
                  <tr key={feed._id} className="hover:bg-g-hover-bg transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-g-primary-text">{feed.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-g-secondary-text truncate max-w-xs" title={feed.url}>
                        <a href={feed.url} target="_blank" rel="noopener noreferrer" className="hover:text-g-accent-blue">{feed.url}</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleEdit(feed)} className="btn btn-ghost text-g-accent-blue hover:text-blue-400 px-2 py-1">Edit</button>
                      <button onClick={() => handleDelete(feed._id, feed.name)} className="btn btn-ghost text-red-400 hover:text-red-300 px-2 py-1">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-g-secondary-text">No RSS feeds currently configured.</p>
        )}
      </div>
    </div>
  );
};

export default AdminRSSFeedsPage;