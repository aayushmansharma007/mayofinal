import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import ContentSlider from './components/ContentSlider';
import AnimeModal from './components/AnimeModal';
import VideoPlayer from './components/VideoPlayer';
import AnimePage from './components/AnimePage';
import ResumeWatching from './components/ResumeWatching';
import {
  fetchTrendingAnime,
  fetchPopularAnime,
  fetchActionAnime,
  fetchLatestAnime,
  fetchUpcomingAnime,
  fetchAdultContent,
  searchAnime as tmdbSearchAnime,
  fetchEpisodes as tmdbFetchEpisodes,
  fetchFallbackAnime,
  getManualFallbackAnime
} from './services/vercelApi';

const App = () => {
  const [featuredAnime, setFeaturedAnime] = useState(null);
  const [heroAnimeList, setHeroAnimeList] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [actionAnime, setActionAnime] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [latestAnime, setLatestAnime] = useState([]);
  const [hentaiContent, setHentaiContent] = useState([]);
  const [showTrendingSection, setShowTrendingSection] = useState(false); // Set to false to hide trending
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [videoAnime, setVideoAnime] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMyList, setShowMyList] = useState(false);
  const [myAnimeList, setMyAnimeList] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [showResumeWatching, setShowResumeWatching] = useState(false);
  const [allAnime, setAllAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(true);



















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
      const [trending, popular, action, upcoming, latest, hentai] = await Promise.allSettled([
        showTrendingSection ? fetchWithRetry(() => fetchTrendingAnime()) : Promise.resolve([]),
        fetchWithRetry(() => fetchPopularAnime()),
        fetchWithRetry(() => fetchActionAnime()),
        fetchWithRetry(() => fetchUpcomingAnime()),
        fetchWithRetry(() => fetchLatestAnime()),
        fetchWithRetry(() => fetchAdultContent())
      ]);
      
      // Check if we have enough anime content, if not, use fallback
      let trendingData = showTrendingSection && trending.status === 'fulfilled' ? trending.value : [];
      let popularData = popular.status === 'fulfilled' ? popular.value : [];
      let actionData = action.status === 'fulfilled' ? action.value : [];
      let latestData = latest.status === 'fulfilled' ? latest.value : [];
      
      // If any category has less than 3 items, try to get more content
      if (trendingData.length < 3 || popularData.length < 3 || actionData.length < 3 || latestData.length < 3) {
        try {
          const fallbackData = await fetchFallbackAnime();
          if (fallbackData.length > 0) {
            // Distribute fallback data to categories that need it
            if (trendingData.length < 3) {
              trendingData = [...trendingData, ...fallbackData.slice(0, 3 - trendingData.length)];
            }
            if (popularData.length < 3) {
              popularData = [...popularData, ...fallbackData.slice(0, 3 - popularData.length)];
            }
            if (actionData.length < 3) {
              actionData = [...actionData, ...fallbackData.slice(0, 3 - actionData.length)];
            }
            if (latestData.length < 3) {
              latestData = [...latestData, ...fallbackData.slice(0, 3 - latestData.length)];
            }
          }
        } catch (error) {
          console.error('Error fetching fallback content:', error);
        }
        
        // If we still don't have enough content, use manual fallback
        if (trendingData.length < 3 || popularData.length < 3 || actionData.length < 3 || latestData.length < 3) {
          const manualFallback = getManualFallbackAnime();
          if (trendingData.length < 3) {
            trendingData = [...trendingData, ...manualFallback.slice(0, 3 - trendingData.length)];
          }
          if (popularData.length < 3) {
            popularData = [...popularData, ...manualFallback.slice(0, 3 - popularData.length)];
          }
          if (actionData.length < 3) {
            actionData = [...actionData, ...manualFallback.slice(0, 3 - actionData.length)];
          }
          if (latestData.length < 3) {
            latestData = [...latestData, ...manualFallback.slice(0, 3 - latestData.length)];
          }
        }
      }
      
      setTrendingAnime(trendingData);
      setPopularAnime(popularData);
      setActionAnime(actionData);
      setUpcomingAnime(upcoming.status === 'fulfilled' ? upcoming.value : []);
      setLatestAnime(latestData);
      setHentaiContent(hentai.status === 'fulfilled' ? hentai.value : []);

      const allAnimeData = [
        ...(showTrendingSection ? trendingData : []),
        ...popularData,
        ...actionData,
        ...latestData
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

  const handleSearchResultClick = (anime) => {
    setVideoAnime(anime);
    setIsVideoPlayerOpen(true);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleCardClick = (anime) => {
    setSelectedAnime(anime);
    setIsModalOpen(true);
  };

  const handleCloseAnimeModal = () => {
    setIsModalOpen(false);
    setSelectedAnime(null);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setVideoAnime(null);
  };

  const handlePlayClick = (anime) => {
    setVideoAnime(anime);
    setIsVideoPlayerOpen(true);
  };

  const handleInfoClick = (anime) => {
    setSelectedAnime(anime);
    setIsModalOpen(true);
  };

  const handleMyListClick = () => {
    const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
    setMyAnimeList(myList);
    setShowMyList(true);
  };

  const handleCloseMyList = () => {
    setShowMyList(false);
  };

  const handleRemoveFromMyList = (animeId) => {
    const updatedList = myAnimeList.filter(anime => anime.id !== animeId);
    localStorage.setItem('myAnimeList', JSON.stringify(updatedList));
    setMyAnimeList(updatedList);
  };

  const handleTrendingClick = () => {
    if (showTrendingSection) {
      setCurrentPage('trending');
    }
  };
  const handleLatestClick = () => setCurrentPage('latest');
  const handleUpcomingClick = () => setCurrentPage('upcoming');
  const handleActionClick = () => setCurrentPage('action');
  const handleClosePage = () => setCurrentPage(null);
  
  const handleResumeWatchingClick = () => {
    setShowResumeWatching(true);
  };
  
  const handleCloseResumeWatching = () => {
    setShowResumeWatching(false);
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
  }, [loadContent]);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const header = document.getElementById('header');
    if (header) {
      if (isScrolled) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }, [isScrolled]);



  if (isVideoPlayerOpen) {
    return (
      <VideoPlayer 
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

  if (currentPage === 'trending' && showTrendingSection) {
    return (
      <AnimePage 
        animeList={trendingAnime}
        title="Trending Anime"
        onClose={handleClosePage}
        onAnimeClick={handlePlayClick}
      />
    );
  }

  if (currentPage === 'latest') {
    return (
      <AnimePage 
        animeList={latestAnime}
        title="Latest Added Anime"
        onClose={handleClosePage}
        onAnimeClick={handlePlayClick}
      />
    );
  }

  if (currentPage === 'upcoming') {
    return (
      <AnimePage 
        animeList={upcomingAnime}
        title="Upcoming Anime"
        onClose={handleClosePage}
        onAnimeClick={handlePlayClick}
      />
    );
  }

  if (currentPage === 'action') {
    return (
      <AnimePage 
        animeList={actionAnime}
        title="Action Anime"
        onClose={handleClosePage}
        onAnimeClick={handlePlayClick}
      />
    );
  }
  
  if (showResumeWatching) {
    return (
      <ResumeWatching 
        onClose={handleCloseResumeWatching}
        onAnimeClick={handleResumeAnimeClick}
        onRemoveAnime={handleRemoveFromResumeWatching}
        allAnime={allAnime}
      />
    );
  }

  return (
    <div className="App">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchResults={handleSearchResultClick}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        onMyListClick={handleMyListClick}
        onTrendingClick={handleTrendingClick}
        onLatestClick={handleLatestClick}
        onUpcomingClick={handleUpcomingClick}
        onActionClick={handleActionClick}
        onResumeWatchingClick={handleResumeWatchingClick}
        showTrendingSection={showTrendingSection}
      />
      
      <HeroBanner 
        featuredAnime={featuredAnime}
        onPlayClick={handlePlayClick}
        onInfoClick={handleInfoClick}
      />
      
      <main className="pb-16">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'white' }}>
            <div className="loading-spinner" style={{ fontSize: '2rem' }}>⟳</div>
            <span style={{ marginLeft: '1rem' }}>Loading anime...</span>
          </div>
        ) : (
          <>
            <ContentSlider 
              title="Popular Near You"
              animeList={popularAnime}
              onCardClick={handlePlayClick}
            />
            
            {showTrendingSection && (
              <ContentSlider 
                title="Trending Now"
                animeList={trendingAnime}
                onCardClick={handlePlayClick}
              />
            )}
            
            <ContentSlider 
              title="Action Anime"
              animeList={actionAnime}
              onCardClick={handlePlayClick}
            />
            
            <ContentSlider 
              title="Latest Added Anime"
              animeList={latestAnime}
              onCardClick={handlePlayClick}
            />
            
            <ContentSlider 
              title="Hentai Collection"
              animeList={hentaiContent}
              onCardClick={handlePlayClick}
            />
          </>
        )}
      </main>
      
      <AnimeModal 
        anime={selectedAnime}
        isOpen={isModalOpen}
        onClose={handleCloseAnimeModal}
      />
      
      {showMyList && (
        <div className="modal show">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseMyList}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-info">
              <h2 className="text-3xl font-bold mb-4">My List</h2>
              {myAnimeList.length === 0 ? (
                <p className="text-lg text-gray-300">Your list is empty. Add some anime to get started!</p>
              ) : (
                <div className="recommendations-grid">
                  {myAnimeList.map((anime, index) => {
                    const title = anime.title.english || anime.title.romaji || anime.title.native;
                    const image = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium;
                    const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
                    
                    return (
                      <div 
                        key={index} 
                        className="recommendation-card"
                        onClick={() => {
                          handlePlayClick(anime);
                          handleCloseMyList();
                        }}
                      >
                        <div className="rec-image-container">
                          <img 
                            src={image} 
                            alt={title}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/150x200/2F2F2F/FFFFFF?text=No+Image'}
                          />
                          <div className="rec-overlay">
                            <div className="rec-play-btn">
                              <i className="fas fa-play"></i>
                            </div>
                          </div>
                          <button 
                            className="remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromMyList(anime.id);
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="rec-info">
                          <div className="rec-title">{title}</div>
                          <div className="rec-meta">
                            <span className="rec-rating">★ {score}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default App;