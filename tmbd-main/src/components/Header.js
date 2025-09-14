import React, { useState } from 'react';
import logo from '../logo/logo.png';

const Header = ({ searchQuery, onSearchChange, onSearchResults, searchResults, showSearchResults, onMyListClick, onTrendingClick, onLatestClick, onUpcomingClick, onActionClick, onResumeWatchingClick, showTrendingSection = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="netflix-header" id="header">
      <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="netflix-logo">
            <img src={logo} alt="Logo" className="logo-image" />
          </div>
          <nav className="hidden lg:flex space-x-6">
            <button className="nav-link" onClick={onLatestClick}>Latest Added</button>
            {showTrendingSection && (
              <button className="nav-link" onClick={onTrendingClick}>Trending</button>
            )}
            <button className="nav-link" onClick={onActionClick}>Action</button>
            <button className="nav-link" onClick={onMyListClick}>Watch List</button>
            <button className="nav-link" onClick={onResumeWatchingClick}>Continue Watching</button>
          </nav>
          <button 
            className="lg:hidden text-white hover:text-gray-300 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className="fas fa-bars text-lg"></i>
          </button>
        </div>
        
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="search-container">
            <button 
              className="search-toggle md:hidden"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            >
              <i className="fas fa-search"></i>
            </button>
            <div className={`search-wrapper ${isSearchExpanded ? 'show' : 'hidden md:block'}`}>
              <i className="fas fa-search search-icon"></i>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search anime..." 
                value={searchQuery}
                onChange={onSearchChange}
              />
              <div className={`search-results ${showSearchResults ? 'show' : ''}`}>
                {searchResults.map((anime, index) => {
                  const title = anime.title.english || anime.title.romaji || anime.title.native;
                  const year = anime.startDate?.year || 'Unknown';
                  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
                  const image = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium;
                  const format = anime.format || 'UNKNOWN';
                  const isMovie = format === 'MOVIE';
                  const episodeInfo = isMovie ? 
                    `${anime.duration || '?'} min` : 
                    `${anime.episodes || '?'} episodes`;

                  return (
                    <div key={index} className="search-item" onClick={() => onSearchResults(anime)}>
                      <img 
                        src={image} 
                        alt={title} 
                        onError={(e) => e.target.src = 'https://via.placeholder.com/60x80/2F2F2F/FFFFFF?text=No+Image'}
                      />
                      <div className="search-item-info">
                        <h4>{title}</h4>
                        <p>{year} • ★ {score} • {episodeInfo} • {format}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <button className="header-icon-btn">
            <i className="fas fa-bookmark"></i>
          </button>
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="mobile-menu lg:hidden">
          <nav className="flex flex-col space-y-2 px-4 pb-4">
            <button className="nav-link-mobile" onClick={onLatestClick}>Latest Added</button>
            {showTrendingSection && (
              <button className="nav-link-mobile" onClick={onTrendingClick}>Trending</button>
            )}
            <button className="nav-link-mobile" onClick={onActionClick}>Action</button>
            <button className="nav-link-mobile" onClick={onMyListClick}>Watch List</button>
            <button className="nav-link-mobile" onClick={onResumeWatchingClick}>Continue Watching</button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
