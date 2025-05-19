const axios = require('axios');
require('dotenv').config();

const COINGECKO_BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

const coingeckoApi = axios.create({
  baseURL: COINGECKO_BASE_URL,
});

const addApiKeyToParams = (params = {}) => {
  if (API_KEY && (COINGECKO_BASE_URL.includes('api.coingecko.com') && !COINGECKO_BASE_URL.includes('pro-api'))) {
      return { ...params, x_cg_demo_api_key: API_KEY };
  }
  return params;
};

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getFromCache = (key) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
};

const setToCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const getMarketDataForCoins = async (cryptoIds, vsCurrency = 'eur') => {
  if (!cryptoIds || cryptoIds.length === 0) return [];
  const idsString = cryptoIds.join(',');
  const cacheKey = `marketData-${idsString}-${vsCurrency}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for: ${cacheKey}`);
    return cachedData;
  }
  console.log(`Cache miss for: ${cacheKey}. Fetching from CoinGecko...`);

  try {
    const response = await coingeckoApi.get('/coins/markets', {
      params: addApiKeyToParams({
        vs_currency: vsCurrency,
        ids: idsString,
        order: 'market_cap_desc',
        per_page: cryptoIds.length,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h',
      }),
    });
    setToCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching market data from CoinGecko:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getCoinDetails = async (cryptoId) => {
  const cacheKey = `coinDetails-${cryptoId}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for: ${cacheKey}`);
    return cachedData;
  }
  console.log(`Cache miss for: ${cacheKey}. Fetching from CoinGecko...`);

  try {
    const response = await coingeckoApi.get(`/coins/${cryptoId}`, {
      params: addApiKeyToParams({
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      }),
    });
    const data = response.data;
    setToCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching coin details for ${cryptoId} from CoinGecko:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const getCoinMarketChart = async (cryptoId, vsCurrency = 'eur', daysQueryParam = '1', internalIntervalType = 'prices') => {
  let endpointParams = {
    vs_currency: vsCurrency,
    days: daysQueryParam,
  };
  let chartPathSegment = 'market_chart';

  if (internalIntervalType === 'ohlc') {
    chartPathSegment = 'ohlc';
  } else if (internalIntervalType === 'prices_hourly') {
    chartPathSegment = 'market_chart';
  } else {
    chartPathSegment = 'market_chart';
  }

  const cacheKey = `cgChart-${cryptoId}-${vsCurrency}-${daysQueryParam}-${internalIntervalType}`;

  console.log(`Cache miss for: ${cacheKey}. Fetching from CoinGecko /coins/${cryptoId}/${chartPathSegment} with params:`, endpointParams);

  try {
    const response = await coingeckoApi.get(`/coins/${cryptoId}/${chartPathSegment}`, {
      params: addApiKeyToParams(endpointParams),
    });

    let resultData;
    if (internalIntervalType === 'ohlc') {
        resultData = response.data;
    } else {
        resultData = response.data.prices;
    }
    setToCache(cacheKey, resultData);
    return resultData;
  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`Error fetching ${cacheKey} from CoinGecko:`, errorMsg);
    throw error;
  }
};

module.exports = {
  getMarketDataForCoins,
  getCoinDetails,
  getCoinMarketChart,
};