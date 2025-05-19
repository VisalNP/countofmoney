import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCryptoDetails, getCryptoHistory } from '../services/cryptoService';
import LoadingSpinner from '../components/LoadingSpinner';

const CryptoDetailPage = () => {
  const { coingeckoId } = useParams();
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoadingDetails(true);
        setError('');
        const data = await getCryptoDetails(coingeckoId);
        setDetails(data);
      } catch (err) {
        setError(err.message || `Failed to load details for ${coingeckoId}.`);
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    };
    if (coingeckoId) {
      fetchDetails();
    }
  }, [coingeckoId]);

  useEffect(() => {
    if (!coingeckoId || !details) return;

    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        setError('');
        const historyData = await getCryptoHistory(coingeckoId, selectedPeriod);
        setHistory(historyData || []);
      } catch (err) {
        setError(err.message || `Failed to load ${selectedPeriod} history for ${coingeckoId}.`);
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [coingeckoId, selectedPeriod, details]); 

  if (loadingDetails) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  if (error && !details) return <p className="text-center text-red-400 mt-10">{error}</p>;
  if (!details) return <p className="text-center text-g-secondary-text mt-10">Cryptocurrency not found.</p>;

  const detailItemClass = "py-2 sm:grid sm:grid-cols-3 sm:gap-4";
  const detailLabelClass = "text-sm font-medium text-g-secondary-text";
  const detailValueClass = "mt-1 text-sm text-g-primary-text sm:mt-0 sm:col-span-2";

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="mb-4">
        <Link to="/" className="btn btn-secondary text-sm">← Back to Dashboard</Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-g-border">
        <img 
            src={details.imageUrl} 
            alt={details.fullName} 
            className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg" 
        />
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-g-primary-text mb-1">{details.fullName} ({details.code})</h1>
            <p className="text-lg text-g-secondary-text">
                {details.currentPrice?.toLocaleString(undefined, { style: 'currency', currency: details.currency?.toUpperCase() || 'USD', minimumFractionDigits: 2, maximumFractionDigits: details.currentPrice > 1 ? 2 : 8  })}
            </p>
        </div>
      </div>

      <div className="bg-g-secondary-bg shadow-g-card rounded-lg p-6">
        <h2 className="text-xl font-semibold text-g-primary-text mb-4">Key Information</h2>
        <dl className="divide-y divide-g-border">
          <div className={detailItemClass}>
            <dt className={detailLabelClass}>24h Price Change</dt>
            <dd className={`${detailValueClass} ${ (details.priceChangePercentage24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {details.priceChangePercentage24h?.toFixed(2)}%
            </dd>
          </div>
          <div className={detailItemClass}>
            <dt className={detailLabelClass}>24h High</dt>
            <dd className={detailValueClass}>{details.highestPriceToday?.toLocaleString(undefined, { style: 'currency', currency: details.currency?.toUpperCase() || 'USD' })}</dd>
          </div>
          <div className={detailItemClass}>
            <dt className={detailLabelClass}>24h Low</dt>
            <dd className={detailValueClass}>{details.lowestPriceToday?.toLocaleString(undefined, { style: 'currency', currency: details.currency?.toUpperCase() || 'USD' })}</dd>
          </div>
          <div className={detailItemClass}>
            <dt className={detailLabelClass}>Market Cap</dt>
            <dd className={detailValueClass}>{details.marketCap?.toLocaleString(undefined, { style: 'currency', currency: details.currency?.toUpperCase() || 'USD' })}</dd>
          </div>
          <div className={detailItemClass}>
            <dt className={detailLabelClass}>Total Supply</dt>
            <dd className={detailValueClass}>{details.totalSupply?.toLocaleString() || 'N/A'}</dd>
          </div>
          <div className={detailItemClass}>
            <dt className={detailLabelClass}>Circulating Supply</dt>
            <dd className={detailValueClass}>{details.circulatingSupply?.toLocaleString() || 'N/A'}</dd>
          </div>
        </dl>
      </div>
      
      {details.description && (
        <div className="bg-g-secondary-bg shadow-g-card rounded-lg p-6">
            <h2 className="text-xl font-semibold text-g-primary-text mb-4">About {details.fullName}</h2>
            <p className="text-g-secondary-text text-sm leading-relaxed">{details.description}</p>
        </div>
      )}


            <div className="bg-g-secondary-bg shadow-g-card rounded-lg p-6">
        <h2 className="text-xl font-semibold text-g-primary-text mb-4">Price History</h2>
        <div className="mb-4 flex space-x-2">
          {['daily', 'hourly', 'minute'].map((periodOption) => (
            <button
              key={periodOption}
              onClick={() => setSelectedPeriod(periodOption)}
              className={`btn text-sm px-3 py-1 ${selectedPeriod === periodOption ? 'btn-primary' : 'btn-secondary'}`}
              disabled={loadingHistory}
            >
              {periodOption.charAt(0).toUpperCase() + periodOption.slice(1)}
            </button>
          ))}
        </div>

        {error && !loadingHistory && <p className="text-red-400 mb-4">{error}</p>}
        {loadingHistory && <div className="flex justify-center py-4"><LoadingSpinner /></div>}
        
        {!loadingHistory && history.length > 0 ? (
          <div className="bg-g-primary-bg p-4 rounded-md max-h-96 overflow-y-auto">
            <pre className="text-xs text-g-secondary-text whitespace-pre-wrap break-all">
              {JSON.stringify(history, null, 2)}
            </pre>
          </div>
        ) : (
          !loadingHistory && !error && <p className="text-g-secondary-text">No history data available for the selected period.</p>
        )}
      </div>
    </div>
  );
};

export default CryptoDetailPage;