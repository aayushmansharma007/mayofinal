import React, { useState, useRef, useEffect } from 'react';
import { forceUnlockBodyScroll } from '../../utils/scrollManager';

const MobileSearchEnhanced = ({ 
  searchQuery, 
  onSearchChange, 
  searchResults, 
  showSearchResults, 
  onSearchResultClick,
  onClose 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState(['Naruto', 'Attack on Titan', 'One Piece', 'Demon Slayer', 'My Hero Academia', 'Jujutsu Kaisen', 'Spy x Family', 'Chainsaw Man']);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Auto-expand when component mounts
    setIsExpanded(true);
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Reset selected index when search results change
    setSelectedIndex(-1);
  }, [searchResults]);

  // Simulate loading state for better UX
  useEffect(() => {
    if (searchQuery && searchQuery.length > 2) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleSearchFocus = () => {
    setIsExpanded(true);
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setTimeout(() => setIsExpanded(false), 200);
    }
  };

  const handleSearchSubmit = (query) => {
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      onSearchChange({ target: { value: query } });
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      setIsListening(true);
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onSearchChange({ target: { value: transcript } });
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      // Fallback for browsers without speech recognition
      alert('Voice search is not supported in your browser');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
      return;
    }

    if (!showSearchResults || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selectedAnime = searchResults[selectedIndex];
      const title = selectedAnime.title.english || selectedAnime.title.romaji || selectedAnime.title.native;
      handleSearchSubmit(title);
      onSearchResultClick(selectedAnime);
      onClose?.();
    }
  };

  const clearSearch = () => {
    onSearchChange({ target: { value: '' } });
    searchInputRef.current?.focus();
    setSelectedIndex(-1);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleResultClick = (anime, index) => {
    const title = anime.title.english || anime.title.romaji || anime.title.native;
    handleSearchSubmit(title);
    onSearchResultClick(anime);
    onClose?.();
  };

  const handleChipClick = async (search) => {
    // Set the search query
    onSearchChange({ target: { value: search } });
    
    // Add to recent searches
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    // Perform the search and handle the first result
    try {
      const query = `
        query {
          Page(page: 1, perPage: 1) {
            media(search: "${search.replace(/"/g, '\\"')}", type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                extraLarge
                large
                medium
              }
              bannerImage
              description
              episodes
              duration
              format
              status
              genres
              averageScore
              startDate {
                year
              }
            }
          }
        }
      `;

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const data = await response.json();
        const results = data.data?.Page?.media || [];
        
        if (results.length > 0) {
          // Navigate to the first result (most popular anime with that name)
          onSearchResultClick(results[0]);
          onClose?.();
        } else {
          // If no exact match found, just set the search query for manual search
          searchInputRef.current?.focus();
        }
      } else {
        // Fallback to just setting search query
        searchInputRef.current?.focus();
      }
    } catch (error) {
      console.error('Error searching for anime:', error);
      // Fallback to just setting search query
      searchInputRef.current?.focus();
    }
  };

  const getSearchSuggestions = () => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const allSuggestions = [...popularSearches, ...recentSearches];
    return allSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  };

  const suggestions = getSearchSuggestions();

  return (
    <div className={`mobile-search-enhanced ${isExpanded ? 'expanded' : ''}`}>
      <div className="mobile-search-header">
        <div className="mobile-search-input-container">
          <i className="fas fa-search mobile-search-icon-enhanced"></i>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search anime, characters, genres..."
            value={searchQuery}
            onChange={onSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyDown={handleKeyDown}
            className="mobile-search-input-enhanced"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {isLoading && (
            <div className="mobile-search-loading">
              <div className="mobile-loading-spinner"></div>
            </div>
          )}
          {searchQuery && !isLoading && (
            <button className="mobile-search-clear" onClick={clearSearch}>
              <i className="fas fa-times"></i>
            </button>
          )}
          {!searchQuery && !isLoading && (
            <button 
              className={`mobile-voice-search ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceSearch}
              title="Voice Search"
            >
              <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
            </button>
          )}
        </div>
        <button className="mobile-search-cancel" onClick={() => {
          forceUnlockBodyScroll();
          onClose();
        }}>
          Cancel
        </button>
      </div>

      <div className="mobile-search-content" ref={resultsRef}>
        {showSearchResults && searchResults.length > 0 ? (
          <div className="mobile-search-results-enhanced">
            <div className="mobile-search-section-header">
              <h3>Search Results</h3>
              <span className="mobile-results-count">{searchResults.length} results</span>
            </div>
            <div className="mobile-search-results-list">
              {searchResults.map((anime, index) => {
                const title = anime.title.english || anime.title.romaji || anime.title.native;
                const image = anime.coverImage.medium || anime.coverImage.large;
                const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
                const year = anime.startDate?.year || 'N/A';
                const status = anime.status;
                const episodes = anime.episodes || '?';
                const isSelected = index === selectedIndex;
                
                return (
                  <div
                    key={anime.id}
                    className={`mobile-search-result-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleResultClick(anime, index)}
                    onTouchStart={() => setSelectedIndex(index)}
                  >
                    <div className="mobile-result-image">
                      <img 
                        src={image} 
                        alt={title}
                        loading="lazy"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/60x80/2F2F2F/FFFFFF?text=No+Image'}
                      />
                      {status === 'RELEASING' && (
                        <div className="mobile-result-status releasing">
                          <i className="fas fa-circle"></i>
                        </div>
                      )}
                    </div>
                    <div className="mobile-result-info">
                      <h4 className="mobile-result-title">{title}</h4>
                      <div className="mobile-result-meta">
                        <span className="mobile-result-rating">
                          <i className="fas fa-star"></i>
                          {score}
                        </span>
                        <span className="mobile-result-year">{year}</span>
                        <span className="mobile-result-episodes">{episodes} eps</span>
                      </div>
                      <div className="mobile-result-genres">
                        {anime.genres?.slice(0, 2).map((genre, idx) => (
                          <span key={idx} className="mobile-result-genre">{genre}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mobile-result-action">
                      <i className="fas fa-play"></i>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : searchQuery ? (
          <div className="mobile-search-empty">
            <div className="mobile-empty-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>No results found</h3>
            <p>Try searching for different keywords</p>
            {suggestions.length > 0 && (
              <div className="mobile-search-suggestions">
                <div className="mobile-search-section">
                  <div className="mobile-search-section-header">
                    <h3>Did you mean?</h3>
                  </div>
                  <div className="mobile-search-chips">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="mobile-search-chip suggestion"
                        onClick={() => handleChipClick(suggestion)}
                      >
                        <i className="fas fa-lightbulb"></i>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="mobile-search-suggestions">
              <div className="mobile-search-section">
                <div className="mobile-search-section-header">
                  <h3>Try these instead</h3>
                </div>
                <div className="mobile-search-chips">
                  {popularSearches.slice(0, 4).map((search, idx) => (
                    <button
                      key={idx}
                      className="mobile-search-chip popular"
                      onClick={() => handleChipClick(search)}
                    >
                      <i className="fas fa-fire"></i>
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mobile-search-suggestions">
            {recentSearches.length > 0 && (
              <div className="mobile-search-section">
                <div className="mobile-search-section-header">
                  <h3>Recent Searches</h3>
                  <button className="mobile-clear-btn" onClick={clearRecentSearches}>
                    Clear
                  </button>
                </div>
                <div className="mobile-search-chips">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      className="mobile-search-chip recent"
                      onClick={() => handleChipClick(search)}
                    >
                      <i className="fas fa-history"></i>
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mobile-search-section">
              <div className="mobile-search-section-header">
                <h3>Popular Searches</h3>
              </div>
              <div className="mobile-search-chips">
                {popularSearches.map((search, idx) => (
                  <button
                    key={idx}
                    className="mobile-search-chip popular"
                    onClick={() => handleChipClick(search)}
                  >
                    <i className="fas fa-fire"></i>
                    {search}
                  </button>
                ))}
              </div>
            </div>

            <div className="mobile-search-section">
              <div className="mobile-search-section-header">
                <h3>Quick Categories</h3>
              </div>
              <div className="mobile-search-chips">
                {['Action', 'Romance', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi'].map((category, idx) => (
                  <button
                    key={idx}
                    className="mobile-search-chip category"
                    onClick={() => handleChipClick(category)}
                  >
                    <i className="fas fa-tag"></i>
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSearchEnhanced;