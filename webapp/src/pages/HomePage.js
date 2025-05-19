import React, { useState, useEffect } from 'react';
import { getCryptosList } from '../services/cryptoService';
import { getArticlesList } from '../services/articleService';
import CryptoCard from '../components/CryptoCard';
import ArticleItem from '../components/ArticleItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const [cryptos, setCryptos] = useState([]);
  const [articlesData, setArticlesData] = useState({ articles: [], currentPage: 1, totalPages: 1 });
  const [loadingCryptos, setLoadingCryptos] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [cryptoError, setCryptoError] = useState('');
  const [articleError, setArticleError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoadingCryptos(true);
        setCryptoError('');
        const data = await getCryptosList();
        setCryptos(data || []);
      } catch (error) {
        setCryptoError(error.message || 'Failed to load cryptocurrencies.');
        console.error(error);
      } finally {
        setLoadingCryptos(false);
      }
    };

    const fetchArticles = async () => {
      try {
        setLoadingArticles(true);
        setArticleError('');
        const data = await getArticlesList(1, isAuthenticated ? 10 : (articlesData.articles.length || 10)); 
        setArticlesData(data || { articles: [], currentPage: 1, totalPages: 1 });
      } catch (error) {
        setArticleError(error.message || 'Failed to load articles.');
        console.error(error);
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchCryptos();
    fetchArticles();
  }, [isAuthenticated]); 

  return (
    <div className="space-y-12"> 
      <section>
        <h2 className="text-2xl font-bold text-g-primary-text mb-6">Cryptocurrencies</h2>
        {loadingCryptos && <LoadingSpinner />}
        {cryptoError && <p className="text-red-400">{cryptoError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"> 
          {!loadingCryptos && cryptos.length > 0 && cryptos.map((crypto) => (
            <CryptoCard key={crypto.coingeckoId || crypto.id} crypto={crypto} />
          ))}
        </div>
        {!loadingCryptos && cryptos.length === 0 && !cryptoError && <p className="text-g-secondary-text">No cryptocurrencies to display.</p>}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-g-primary-text mb-6">Latest Articles</h2>
        {loadingArticles && <LoadingSpinner />}
        {articleError && <p className="text-red-400">{articleError}</p>}
        <div className="bg-g-secondary-bg p-1 rounded-lg shadow-g-card"> 
          {!loadingArticles && articlesData.articles.length > 0 && articlesData.articles.map((article) => (
            <ArticleItem key={article.id || article.link} article={article} />
          ))}
        </div>
        {!loadingArticles && articlesData.articles.length === 0 && !articleError && <p className="text-g-secondary-text">No articles to display.</p>}
      </section>
    </div>
  );
};

export default HomePage;