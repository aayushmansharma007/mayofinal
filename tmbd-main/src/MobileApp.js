import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MobileApp.css';
import { forceUnlockBodyScroll } from './utils/scrollManager';
import MobileHeader from './components/mobile/MobileHeader';
import MobileHeroBanner from './components/mobile/MobileHeroBanner';
import MobileContentSlider from './components/mobile/MobileContentSlider';
import MobileVideoPlayer from './components/mobile/MobileVideoPlayer';
import MobileBottomNav from './components/mobile/MobileBottomNav';
import MobileAnimePage from './components/mobile/MobileAnimePage';
import MobileResumeWatching from './components/mobile/MobileResumeWatching';
import {
  fetchTrendingAnime,
  fetchPopularAnime,
  fetchLatestAnime,
  fetchUpcomingAnime,
  fetchAdultContent,
  searchAnime as tmdbSearchAnime,
  fetchEpisodes as tmdbFetchEpisodes
} from './services/vercelApi';

const MobileApp = () => {
  const [featuredAnime, setFeaturedAnime] = useState(null);
  const [heroAnimeList, setHeroAnimeList] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [latestAnime, setLatestAnime] = useState([]);
  const [hentaiContent, setHentaiContent] = useState([]);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [videoAnime, setVideoAnime] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showMyList, setShowMyList] = useState(false);
  const [myAnimeList, setMyAnimeList] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [showResumeWatching, setShowResumeWatching] = useState(false);
  const [allAnime, setAllAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

















  const loadContent = useCallback(async () => {
    setIsLoading(true);
    
    const fetchWithRetry = async (fetchFn, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const result = await fetchFn();
          return result || [];
        } catch (error) {
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    };

    try {
      const [trending, popular, upcoming, latest, hentai] = await Promise.allSettled([
        fetchWithRetry(() => fetchTrendingAnime()),
        fetchWithRetry(() => fetchPopularAnime()),
        fetchWithRetry(() => fetchUpcomingAnime()),
        fetchWithRetry(() => fetchLatestAnime()),
        fetchWithRetry(() => fetchAdultContent())
      ]);
      
      setTrendingAnime(trending.status === 'fulfilled' ? trending.value : []);
      setPopularAnime(popular.status === 'fulfilled' ? popular.value : []);
      setUpcomingAnime(upcoming.status === 'fulfilled' ? upcoming.value : []);
      setLatestAnime(latest.status === 'fulfilled' ? latest.value : []);
      setHentaiContent(hentai.status === 'fulfilled' ? hentai.value : []);

      const allAnimeData = [
        ...(trending.status === 'fulfilled' ? trending.value : []),
        ...(popular.status === 'fulfilled' ? popular.value : []),
        ...(latest.status === 'fulfilled' ? latest.value : [])
      ];
      setAllAnime(allAnimeData);
      
      const shortNameAnime = allAnimeData.filter(anime => {
        const title = anime.title.english || anime.title.romaji || anime.title.native;
        return title && title.length <= 15;
      });
      
      if (shortNameAnime.length > 0) {
        setHeroAnimeList(shortNameAnime);
        setFeaturedAnime(shortNameAnime[Math.floor(Math.random() * shortNameAnime.length)]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setShowSearchResults(false);
      return;
    }

    try {
      const results = await tmdbSearchAnime(query);
      setSearchResults(results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handlePlayClick = (anime) => {
    // Ensure we're not in a locked scroll state
    forceUnlockBodyScroll();
    setVideoAnime(anime);
    setIsVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setVideoAnime(null);
    // Ensure body scroll is restored when video player closes
    setTimeout(() => {
      forceUnlockBodyScroll();
    }, 100);
  };

  const handleMyListClick = () => {
    const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
    setMyAnimeList(myList);
    setCurrentPage('mylist');
    setActiveTab('mylist');
    // Ensure scroll is unlocked when navigating
    forceUnlockBodyScroll();
  };

  const handleRemoveFromMyList = (animeId) => {
    const updatedList = myAnimeList.filter(anime => anime.id !== animeId);
    localStorage.setItem('myAnimeList', JSON.stringify(updatedList));
    setMyAnimeList(updatedList);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(tab);
    // Ensure scroll is unlocked when changing tabs
    forceUnlockBodyScroll();
  };

  const handleResumeWatchingClick = () => {
    setShowResumeWatching(true);
    setCurrentPage('resume');
    setActiveTab('resume');
    // Ensure scroll is unlocked when navigating
    forceUnlockBodyScroll();
  };

  const handleResumeAnimeClick = (anime, episode) => {
    setVideoAnime({ ...anime, startEpisode: episode });
    setIsVideoPlayerOpen(true);
    setShowResumeWatching(false);
  };

  const handleRemoveFromResumeWatching = (animeId) => {
    const watchHistory = JSON.parse(localStorage.getItem('animeWatchHistory') || '{}');
    delete watchHistory[`anime_${animeId}`];
    localStorage.setItem('animeWatchHistory', JSON.stringify(watchHistory));
  };

  useEffect(() => {
    loadContent();
    // Ensure scroll is unlocked after content loads
    setTimeout(() => {
      forceUnlockBodyScroll();
    }, 100);
  }, [loadContent]);

  // Ensure body scroll is properly restored when component mounts
  useEffect(() => {
    // Force unlock body scroll on mount to ensure proper scrolling
    forceUnlockBodyScroll();
    
    // Add a periodic check to ensure scroll is never permanently locked
    const scrollCheckInterval = setInterval(() => {
      if (!isVideoPlayerOpen) {
        forceUnlockBodyScroll();
      }
    }, 2000);
    
    return () => {
      clearInterval(scrollCheckInterval);
      forceUnlockBodyScroll();
    };
  }, [isVideoPlayerOpen]);

  useEffect(() => {
    let heroRotationInterval;
    if (heroAnimeList.length > 0) {
      heroRotationInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * heroAnimeList.length);
        setFeaturedAnime(heroAnimeList[randomIndex]);
      }, 5000);
    }

    return () => {
      if (heroRotationInterval) {
        clearInterval(heroRotationInterval);
      }
    };
  }, [heroAnimeList]);

  if (isVideoPlayerOpen) {
    return (
      <MobileVideoPlayer 
        anime={videoAnime}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
        recommendations={trendingAnime}
        onRecommendationClick={handlePlayClick}
        startEpisode={videoAnime?.startEpisode || 1}
        fetchEpisodes={tmdbFetchEpisodes}
      />
    );
  }

  if (currentPage === 'trending') {
    return (
      <MobileAnimePage 
        animeList={trendingAnime}
        title="Trending Anime"
        onClose={() => {
          setCurrentPage('home'); 
          setActiveTab('home');
          forceUnlockBodyScroll();
        }}
        onAnimeClick={handlePlayClick}
      />
    );
  }

  if (currentPage === 'latest') {
    return (
      <MobileAnimePage 
        animeList={latestAnime}
        title="Latest Added Anime"
        onClose={() => {
          setCurrentPage('home'); 
          setActiveTab('home');
          forceUnlockBodyScroll();
        }}
        onAnimeClick={handlePlayClick}
      />
    );
  }

  if (currentPage === 'upcoming') {
    return (
      <MobileAnimePage 
        animeList={upcomingAnime}
        title="Upcoming Anime"
        onClose={() => {
          setCurrentPage('home'); 
          setActiveTab('home');
          forceUnlockBodyScroll();
        }}
        onAnimeClick={handlePlayClick}
      />
    );
  }



  if (showResumeWatching) {
    return (
      <MobileResumeWatching 
        onClose={() => {
          setShowResumeWatching(false); 
          setCurrentPage('home'); 
          setActiveTab('home');
          forceUnlockBodyScroll();
        }}
        onAnimeClick={handleResumeAnimeClick}
        onRemoveAnime={handleRemoveFromResumeWatching}
        allAnime={allAnime}
      />
    );
  }

  return (
    <div className="mobile-app">
      <MobileHeader 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        onSearchResultClick={handlePlayClick}
      />
      
      {currentPage === 'home' && (
        <>
          <MobileHeroBanner 
            featuredAnime={featuredAnime}
            onPlayClick={handlePlayClick}
          />
          
          <main className="mobile-main">
            {isLoading ? (
              <div className="mobile-loading">
                <div className="loading-spinner">⟳</div>
                <span>Loading anime...</span>
              </div>
            ) : (
              <>
                <MobileContentSlider 
                  title="Popular Near You"
                  animeList={popularAnime}
                  onCardClick={handlePlayClick}
                />
                
                <MobileContentSlider 
                  title="Trending Now"
                  animeList={trendingAnime}
                  onCardClick={handlePlayClick}
                />
                
                <MobileContentSlider 
                  title="Latest Added"
                  animeList={latestAnime}
                  onCardClick={handlePlayClick}
                />
                
                <MobileContentSlider 
                  title="Hentai Collection"
                  animeList={hentaiContent}
                  onCardClick={handlePlayClick}
                />
              </>
            )}
          </main>
        </>
      )}

      {currentPage === 'mylist' && (
        <div className="mobile-page enhanced">
          <div className="mobile-page-header enhanced">
            <div className="mobile-header-left">
              <button className="mobile-back-btn" onClick={() => {
                setCurrentPage('home'); 
                setActiveTab('home');
                forceUnlockBodyScroll();
              }}>
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="mobile-page-title-section">
                <h2>My List</h2>
                <span className="mobile-page-count">{myAnimeList.length} anime</span>
              </div>
            </div>
            {myAnimeList.length > 0 && (
              <div className="mobile-sort-dropdown">
                <select>
                  <option value="recent">Recently Added</option>
                  <option value="title">Title</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            )}
          </div>
          <div className="mobile-page-content">
            {myAnimeList.length === 0 ? (
              <div className="empty-state enhanced">
                <div className="empty-state-icon">
                  <i className="fas fa-bookmark"></i>
                </div>
                <h3>Your list is empty</h3>
                <p>Add some anime to get started!</p>
                <div className="empty-state-suggestions">
                  <span>Try browsing:</span>
                  <div className="suggestion-tags">
                    <span className="suggestion-tag" onClick={() => {
                      setCurrentPage('trending'); 
                      setActiveTab('trending');
                      forceUnlockBodyScroll();
                    }}>Trending</span>
                    <span className="suggestion-tag" onClick={() => {
                      setCurrentPage('latest'); 
                      setActiveTab('latest');
                      forceUnlockBodyScroll();
                    }}>Latest</span>
                    <span className="suggestion-tag" onClick={() => {
                      setCurrentPage('action'); 
                      setActiveTab('action');
                      forceUnlockBodyScroll();
                    }}>Action</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mobile-anime-grid enhanced">
                {myAnimeList.map((anime, index) => {
                  const title = anime.title.english || anime.title.romaji || anime.title.native;
                  const image = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium;
                  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
                  const genres = anime.genres?.slice(0, 2) || [];
                  const year = anime.startDate?.year || 'N/A';
                  const episodes = anime.episodes || '?';
                  const status = anime.status;
                  
                  return (
                    <div 
                      key={index} 
                      className="mobile-anime-card enhanced grid-card"
                      onClick={() => handlePlayClick(anime)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="mobile-card-image">
                        <img 
                          src={image} 
                          alt={title}
                          onError={(e) => e.target.src = 'https://via.placeholder.com/150x200/2F2F2F/FFFFFF?text=No+Image'}
                        />
                        
                        {/* Status Badge */}
                        {status === 'RELEASING' && (
                          <div className="mobile-status-badge releasing">
                            <i className="fas fa-circle"></i>
                            <span>ONGOING</span>
                          </div>
                        )}
                        {status === 'FINISHED' && (
                          <div className="mobile-status-badge finished">
                            <i className="fas fa-check-circle"></i>
                            <span>COMPLETE</span>
                          </div>
                        )}
                        
                        {/* Quality Badge */}
                        <div className="mobile-quality-badge">
                          <span>HD</span>
                        </div>
                        
                        {/* Rating Badge */}
                        <div className="mobile-rating-badge">
                          <i className="fas fa-star"></i>
                          <span>{score}</span>
                        </div>
                        
                        {/* Gradient Overlay */}
                        <div className="mobile-card-gradient"></div>
                        
                        {/* Play Overlay */}
                        <div className="mobile-card-overlay">
                          <div className="mobile-play-btn-card">
                            <i className="fas fa-play"></i>
                          </div>
                          <div className="mobile-overlay-info">
                            <div className="mobile-overlay-title">{title}</div>
                            <div className="mobile-overlay-meta">
                              <span>{year}</span>
                              <span>•</span>
                              <span>{episodes} eps</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <button 
                          className="mobile-remove-btn enhanced"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromMyList(anime.id);
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      
                      <div className="mobile-card-info">
                        <h3 className="mobile-card-title">{title}</h3>
                        <div className="mobile-card-meta">
                          <div className="mobile-card-rating">
                            <i className="fas fa-star"></i>
                            <span>{score}</span>
                          </div>
                          <div className="mobile-card-year">{year}</div>
                        </div>
                        <div className="mobile-card-genres">
                          {genres.map((genre, idx) => (
                            <span key={idx} className="mobile-genre-tag">{genre}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onMyListClick={handleMyListClick}
        onResumeWatchingClick={handleResumeWatchingClick}
        onTrendingClick={() => {
          setCurrentPage('trending'); 
          setActiveTab('trending');
          forceUnlockBodyScroll();
        }}
        onLatestClick={() => {
          setCurrentPage('latest'); 
          setActiveTab('latest');
          forceUnlockBodyScroll();
        }}
      />
    </div>
  );
};

export default MobileApp;