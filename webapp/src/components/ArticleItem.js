import React from 'react';

const ArticleItem = ({ article }) => {
  if (!article) return null;
  const truncateSummary = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    const trimmedString = text.substr(0, maxLength);
    return trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))) + "...";
  };

  return (
    <div className="p-8 border-b border-g-border last:border-b-0 hover:bg-g-hover-bg rounded-md transition-colors duration-150">
      <h3 className="text-lg font-semibold">
        <a 
          href={article.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-g-primary-text hover:text-g-accent-blue transition-colors"
        >
          {article.title}
        </a>
      </h3>
      {article.summary && (
        <p className="text-sm text-g-secondary-text">
          {truncateSummary(article.summary, 150)}
        </p>
      )}
      <div className="flex items-center text-xs text-g-tertiary-text">
        <span>Source: {article.sourceName}</span>
        <span className="mx-2">|</span>
        <span>Published: {new Date(article.pubDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default ArticleItem;