import React from 'react';
import { Link } from 'react-router-dom';

const CryptoCard = ({ crypto }) => {
  if (!crypto) return null;

  const priceChangeColor = (crypto.priceChangePercentage24h || 0) >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-g-secondary-bg p-4 rounded-lg shadow-g-card m-2 flex flex-col items-center text-center w-full sm:w-52 transform hover:scale-105 transition-transform duration-200 ease-in-out">
      <img 
        src={crypto.imageUrl} 
        alt={crypto.fullName} 
        className="w-16 h-16 mb-3 rounded-full" 
      />
      <h4 className="text-lg font-semibold text-g-primary-text mb-1 truncate w-full" title={crypto.fullName}>
        {crypto.fullName}
      </h4>
      <p className="text-sm text-g-secondary-text mb-2">({crypto.code})</p>
      <p className="text-xl font-bold text-g-primary-text mb-1">
        {crypto.currentPrice?.toLocaleString(undefined, { style: 'currency', currency: crypto.currency?.toUpperCase() || 'USD', minimumFractionDigits: 2, maximumFractionDigits: crypto.currentPrice > 1 ? 2 : 6 })}
      </p>
      <p className={`text-sm font-medium mb-3 ${priceChangeColor}`}>
        24h: {crypto.priceChangePercentage24h?.toFixed(2)}%
      </p>
      <Link 
        to={`/crypto/${crypto.coingeckoId}`}
        className="btn btn-secondary w-full text-sm py-1" 
      >
        View Details
      </Link>
    </div>
  );
};

export default CryptoCard;