import React, { useState, useEffect } from 'react';
import { getManagedCryptos, addManagedCrypto, deleteManagedCrypto } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminCryptosPage = () => {
  const [cryptos, setCryptos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newCrypto, setNewCrypto] = useState({ code: '', name: '', coingeckoId: '', imageUrl: '' });

  const fetchCryptos = async () => {
    try { setIsLoading(true); setError(''); const data = await getManagedCryptos(); setCryptos(data || []); }
    catch (err) { setError(err.message || 'Failed to load cryptocurrencies.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCryptos(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCrypto((prev) => ({ ...prev, [name]: value.trim() })); 
  };

  const handleAddCrypto = async (e) => {
    e.preventDefault(); setError(''); setSuccessMessage('');
    if (!newCrypto.code || !newCrypto.name || !newCrypto.coingeckoId) {
      setError('Code, Name, and CoinGecko ID are required.'); return;
    }
    try {
      await addManagedCrypto(newCrypto);
      setSuccessMessage(`Cryptocurrency '${newCrypto.name}' added successfully!`);
      setNewCrypto({ code: '', name: '', coingeckoId: '', imageUrl: '' });
      fetchCryptos();
    } catch (err) { setError(err.message || 'Failed to add cryptocurrency.'); }
  };

  const handleDeleteCrypto = async (coingeckoId, cryptoName) => {
    if (window.confirm(`Are you sure you want to delete ${cryptoName} (${coingeckoId})?`)) {
      setError(''); setSuccessMessage('');
      try {
        await deleteManagedCrypto(coingeckoId);
        setSuccessMessage(`Cryptocurrency '${cryptoName}' deleted successfully!`);
        fetchCryptos();
      } catch (err) { setError(err.message || 'Failed to delete cryptocurrency.'); }
    }
  };

  const inputClass = "mt-1";
  const labelClass = "block text-sm font-medium text-g-secondary-text mb-1";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-g-primary-text mb-8">Manage Cryptocurrencies</h1>

      {successMessage && <p className="mb-4 text-sm text-green-400 bg-green-900 bg-opacity-30 p-3 rounded-md">{successMessage}</p>}
      {error && <p className="mb-4 text-sm text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-md">{error}</p>}

      <div className="bg-g-secondary-bg p-6 rounded-lg shadow-g-card mb-8">
        <h3 className="text-xl font-semibold text-g-primary-text mb-4">Add New Cryptocurrency</h3>
        <form onSubmit={handleAddCrypto} className="space-y-4">
          <div>
            <label htmlFor="code" className={labelClass}>Code (Symbol, e.g., BTC):</label>
            <input type="text" name="code" value={newCrypto.code} onChange={handleInputChange} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="name" className={labelClass}>Name (e.g., Bitcoin):</label>
            <input type="text" name="name" value={newCrypto.name} onChange={handleInputChange} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="coingeckoId" className={labelClass}>CoinGecko ID (e.g., bitcoin):</label>
            <input type="text" name="coingeckoId" value={newCrypto.coingeckoId} onChange={handleInputChange} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="imageUrl" className={labelClass}>Image URL (Optional):</label>
            <input type="text" name="imageUrl" value={newCrypto.imageUrl} onChange={handleInputChange} className={inputClass} />
          </div>
          <button type="submit" className="btn btn-primary">Add Crypto</button>
        </form>
      </div>

      <div className="bg-g-secondary-bg p-6 rounded-lg shadow-g-card">
        <h3 className="text-xl font-semibold text-g-primary-text mb-4">Managed Cryptocurrencies</h3>
        {isLoading ? ( <LoadingSpinner /> ) : 
         cryptos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-g-border">
              <thead className="bg-g-hover-bg">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">Code</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">CoinGecko ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-g-secondary-bg divide-y divide-g-border">
                {cryptos.map((crypto) => (
                  <tr key={crypto._id} className="hover:bg-g-hover-bg transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {crypto.imageUrl && <img src={crypto.imageUrl} alt={crypto.name} className="w-8 h-8 rounded-full" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-g-primary-text">{crypto.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-g-secondary-text">{crypto.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-g-secondary-text">{crypto.coingeckoId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleDeleteCrypto(crypto.coingeckoId, crypto.name)} className="btn btn-ghost text-red-400 hover:text-red-300 px-2 py-1">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-g-secondary-text">No cryptocurrencies currently managed.</p>
        )}
      </div>
    </div>
  );
};

export default AdminCryptosPage;