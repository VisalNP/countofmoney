const Cryptocurrency = require('../models/Cryptocurrency');
const User = require('../models/User');
const coingeckoService = require('../services/coingeckoService');
const AppPreference = require('../models/AppPreference'); 
const addCryptocurrency = async (req, res) => {
  const { code, name, imageUrl, coingeckoId } = req.body;
  try {
    if (!code || !name || !coingeckoId) {
       return res.status(400).json({ message: 'Please provide code, name, and coingeckoId' });
    }
    const existingByCgId = await Cryptocurrency.findOne({ coingeckoId });
    if (existingByCgId) {
      return res.status(400).json({ message: `Cryptocurrency with CoinGecko ID '${coingeckoId}' already exists` });
    }
    const existingByCode = await Cryptocurrency.findOne({ code });
    if (existingByCode) {
        return res.status(400).json({ message: `Cryptocurrency with code (symbol) '${code}' already exists` });
    }
    const crypto = new Cryptocurrency({ code, name, imageUrl, coingeckoId });
    const createdCrypto = await crypto.save();
    res.status(201).json(createdCrypto);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Server error adding cryptocurrency' });
  }
};

const deleteCryptocurrency = async (req, res) => {
  try {
    const coingeckoIdToDelete = req.params.coingeckoId;
    const deleteResult = await Cryptocurrency.deleteOne({ coingeckoId: coingeckoIdToDelete });

    if (deleteResult.deletedCount === 1) {
      res.json({ message: `Cryptocurrency ${coingeckoIdToDelete} removed successfully` });
    } else {
      res.status(404).json({ message: `Cryptocurrency with CoinGecko ID '${coingeckoIdToDelete}' not found` });
    }
  } catch (error) {
    console.error(`Error deleting crypto ${coingeckoIdToDelete}:`, error);
    res.status(500).json({ message: 'Server error deleting cryptocurrency' });
  }
};

const getAllManagedCryptocurrencies = async (req, res) => {
   try {
       const cryptos = await Cryptocurrency.find({});
       res.json(cryptos);
   } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Server error fetching managed cryptocurrencies' });
   }
};

const getCryptocurrenciesList = async (req, res) => {
  try {
    const userCurrency = (req.user && req.user.defaultCurrency) ? req.user.defaultCurrency.toLowerCase() : 'eur';
    let localCryptosToQuery = [];
    let coingeckoIdsToFetchMarketDataFor = [];

    if (req.user && req.user.preferredCryptos && req.user.preferredCryptos.length > 0) {
      coingeckoIdsToFetchMarketDataFor = req.user.preferredCryptos;
      localCryptosToQuery = await Cryptocurrency.find({ coingeckoId: { $in: coingeckoIdsToFetchMarketDataFor } });
    } else {
      const popularListPref = await AppPreference.findOne({ key: 'popularCryptosList' });
      const nCryptoCountPref = await AppPreference.findOne({ key: 'anonymousHomepageCryptoCount' });

      let idsFromPopularList = [];
      if (popularListPref && popularListPref.value && Array.isArray(popularListPref.value) && popularListPref.value.length > 0) {
        idsFromPopularList = popularListPref.value; 

        if (nCryptoCountPref && nCryptoCountPref.value !== undefined) {
          const nValue = parseInt(nCryptoCountPref.value);
          if (!isNaN(nValue) && nValue >= 0) {
            idsFromPopularList = idsFromPopularList.slice(0, nValue);
          }
        }
      }

      if (idsFromPopularList.length > 0) {
        coingeckoIdsToFetchMarketDataFor = idsFromPopularList;
        localCryptosToQuery = await Cryptocurrency.find({ coingeckoId: { $in: coingeckoIdsToFetchMarketDataFor } });
      } else {
        localCryptosToQuery = await Cryptocurrency.find({}).limit(2);
        coingeckoIdsToFetchMarketDataFor = localCryptosToQuery.map(c => c.coingeckoId);
      }
    }

    if (coingeckoIdsToFetchMarketDataFor.length === 0) {
      return res.json([]);
    }

    const marketDataFromCoinGecko = await coingeckoService.getMarketDataForCoins(coingeckoIdsToFetchMarketDataFor, userCurrency);
    const localCryptoDetailsMap = new Map();
    localCryptosToQuery.forEach(lc => localCryptoDetailsMap.set(lc.coingeckoId, lc));
    const responseCryptos = coingeckoIdsToFetchMarketDataFor.map(cgId => {
      const localDetails = localCryptoDetailsMap.get(cgId);
      const cgMarketData = marketDataFromCoinGecko.find(cg => cg.id === cgId);

      if (!localDetails || !cgMarketData) {
        console.warn(`Data mismatch for ${cgId}: Local details found: ${!!localDetails}, CoinGecko market data found: ${!!cgMarketData}`);
        return null;
      }

      const openingPrice24h = cgMarketData.current_price / (1 + ((cgMarketData.price_change_percentage_24h_in_currency || cgMarketData.price_change_percentage_24h || 0) / 100));

      return {
        id: localDetails._id,
        coingeckoId: localDetails.coingeckoId,
        code: localDetails.code,
        fullName: localDetails.name,
        imageUrl: cgMarketData.image || localDetails.imageUrl, 
        currentPrice: cgMarketData.current_price,
        openingPrice: (cgMarketData.price_change_percentage_24h_in_currency !== undefined && cgMarketData.price_change_percentage_24h_in_currency !== null) ? (cgMarketData.current_price / (1 + (cgMarketData.price_change_percentage_24h_in_currency / 100))) : openingPrice24h,
        lowestPriceToday: cgMarketData.low_24h,
        highestPriceToday: cgMarketData.high_24h,
        currency: userCurrency,
        priceChangePercentage24h: cgMarketData.price_change_percentage_24h_in_currency || cgMarketData.price_change_percentage_24h
      };
    }).filter(Boolean);

    res.json(responseCryptos);

  } catch (error) {
    console.error('Error in getCryptocurrenciesList:', error);
    res.status(500).json({ message: 'Server error fetching cryptocurrency list' });
  }
};
const getCryptocurrencyDetailsById = async (req, res) => {
  try {
    const coingeckoId = req.params.cmid;
    if (!req.user || !req.user.defaultCurrency) {
        return res.status(401).json({ message: 'Not authorized or user profile incomplete' });
    }
    const userCurrency = req.user.defaultCurrency.toLowerCase();

    const cgDetails = await coingeckoService.getCoinDetails(coingeckoId);
    if (!cgDetails || !cgDetails.market_data) {
      return res.status(404).json({ message: 'Cryptocurrency details not found or incomplete on CoinGecko.' });
    }

    const localCrypto = await Cryptocurrency.findOne({ coingeckoId });
    if (!localCrypto) {
      return res.status(404).json({ message: `Cryptocurrency '${coingeckoId}' not managed by this platform.` });
    }
    
    const currentPriceData = cgDetails.market_data.current_price?.[userCurrency];
    const high24h = cgDetails.market_data.high_24h?.[userCurrency];
    const low24h = cgDetails.market_data.low_24h?.[userCurrency];
    const priceChange24h = cgDetails.market_data.price_change_percentage_24h_in_currency?.[userCurrency];
    
    if (currentPriceData === undefined) {
        return res.status(404).json({ message: `Price data not available for ${coingeckoId} in currency ${userCurrency}.` });
    }
    const openingPrice24h = currentPriceData / (1 + ((priceChange24h || 0) / 100));

    res.json({
      id: localCrypto._id,
      coingeckoId: cgDetails.id,
      code: cgDetails.symbol?.toUpperCase(),
      fullName: cgDetails.name,
      imageUrl: cgDetails.image?.large || localCrypto.imageUrl,
      description: cgDetails.description?.en?.split('. ')[0] + '.' || 'No description available.',
      currentPrice: currentPriceData,
      openingPrice: openingPrice24h,
      lowestPriceToday: low24h,
      highestPriceToday: high24h,
      marketCap: cgDetails.market_data.market_cap?.[userCurrency],
      totalSupply: cgDetails.market_data.total_supply,
      circulatingSupply: cgDetails.market_data.circulating_supply,
      priceChangePercentage24h: priceChange24h,
      currency: userCurrency,
    });

  } catch (error) {
    console.error(`Error in getCryptocurrencyDetailsById for ${req.params.cmid}:`, error);
    if (error.isAxiosError && error.response && error.response.status === 404) {
        return res.status(404).json({ message: `Cryptocurrency details not found for ID ${req.params.cmid} on CoinGecko.` });
    }
    res.status(500).json({ message: 'Server error fetching cryptocurrency details' });
  }
};

const getCryptocurrencyHistory = async (req, res) => {
  try {
    const coingeckoId = req.params.cmid;
    const period = req.params.period.toLowerCase();
    if (!req.user || !req.user.defaultCurrency) {
        return res.status(401).json({ message: 'Not authorized or user profile incomplete' });
    }
    const userCurrency = req.user.defaultCurrency.toLowerCase();
    let historyData;

    switch (period) {
      case 'daily':
        const dailyOhlcRaw = await coingeckoService.getCoinMarketChart(coingeckoId, userCurrency, '90', 'ohlc');
        if (dailyOhlcRaw && dailyOhlcRaw.length > 0) {
            historyData = dailyOhlcRaw.slice(-60);
        } else {
            historyData = [];
        }
        break;
      case 'hourly':
        const hourlyRawPrices = await coingeckoService.getCoinMarketChart(coingeckoId, userCurrency, '2', 'prices_hourly');
        historyData = aggregateToOHLC(hourlyRawPrices, 48, 60 * 60 * 1000);
        break;
      case 'minute':
        const minuteRawPrices = await coingeckoService.getCoinMarketChart(coingeckoId, userCurrency, '1', 'prices');
        const twoHoursAgoMs = Date.now() - (2 * 60 * 60 * 1000);
        const relevantMinutePrices = minuteRawPrices ? minuteRawPrices.filter(p => p[0] >= twoHoursAgoMs) : [];
        historyData = aggregateToOHLC(relevantMinutePrices, 60, 60 * 1000);
        break;
      default:
        return res.status(400).json({ message: 'Invalid period. Must be daily, hourly, or minute.' });
    }
    res.json(historyData);
  } catch (error) {
    console.error(`Error in getCryptocurrencyHistory for ${req.params.cmid}, period ${req.params.period}:`, error);
    if (error.isAxiosError && error.response && error.response.status === 404) {
        return res.status(404).json({ message: `Cryptocurrency history not found for ID ${req.params.cmid} on CoinGecko.` });
    }
    res.status(500).json({ message: 'Server error fetching cryptocurrency history' });
  }
};

function aggregateToOHLC(prices, numPeriodsTarget, periodDurationMs) {
    if (!prices || prices.length === 0) return [];
    const ohlcData = [];
    const sortedPrices = prices.sort((a, b) => a[0] - b[0]);
    const firstTs = sortedPrices[0][0];
    const lastTs = sortedPrices[sortedPrices.length - 1][0];
    
    let bucketDurationMs = periodDurationMs;
    
    let currentBucketStartTs = firstTs;
    let priceIndex = 0;
    for (let i = 0; i < numPeriodsTarget && priceIndex < sortedPrices.length; i++) {
        const currentBucketEndTs = currentBucketStartTs + bucketDurationMs;
        const pricesInBucket = [];
        while (priceIndex < sortedPrices.length && sortedPrices[priceIndex][0] < currentBucketEndTs) {
            if (sortedPrices[priceIndex][0] >= currentBucketStartTs) {
                 pricesInBucket.push(sortedPrices[priceIndex][1]);
            }
            priceIndex++;
        }

        if (pricesInBucket.length > 0) {
            const open = pricesInBucket[0];
            const close = pricesInBucket[pricesInBucket.length - 1];
            const high = Math.max(...pricesInBucket);
            const low = Math.min(...pricesInBucket);
            ohlcData.push([Math.floor(currentBucketStartTs), open, high, low, close]);
        }
        currentBucketStartTs = currentBucketEndTs;
        if (currentBucketStartTs > lastTs && ohlcData.length >= numPeriodsTarget) break;
    }
    return ohlcData.slice(0, numPeriodsTarget);
}


module.exports = {
  addCryptocurrency,
  deleteCryptocurrency,
  getAllManagedCryptocurrencies,
  getCryptocurrenciesList,
  getCryptocurrencyDetailsById,
  getCryptocurrencyHistory,
};