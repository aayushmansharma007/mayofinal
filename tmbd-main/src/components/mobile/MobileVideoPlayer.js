import React, { useState, useEffect, useRef, useMemo } from 'react';
import { saveWatchProgress, getWatchProgress } from '../../utils/watchProgress';
import { lockBodyScroll, unlockBodyScroll, forceUnlockBodyScroll } from '../../utils/scrollManager';
import { getVideoUrl } from '../../services/tmdbApi';
import './MobileVideoPlayerStyles.css';

const MobileVideoPlayer = ({ 
  anime, 
  isOpen, 
  onClose, 
  recommendations = [], 
  onRecommendationClick, 
  startEpisode = 1,
  fetchEpisodes 
}) => {
  const [currentEpisode, setCurrentEpisode] = useState(startEpisode);
  const [currentServer, setCurrentServer] = useState('sub1');
  const [isInMyList, setIsInMyList] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [episodeDurations, setEpisodeDurations] = useState({});
  const [episodeInput, setEpisodeInput] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [showEpisodes, setShowEpisodes] = useState(true);
  const [showServers, setShowServers] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  
  const videoContainerRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Don't lock body scroll for mobile - let it scroll naturally
      // lockBodyScroll();
      
      checkIfInMyList();
      
      if (startEpisode > 1) {
        setCurrentEpisode(startEpisode);
      } else {
        const progress = getWatchProgress(anime?.id);
        if (progress) {
          setCurrentEpisode(progress.episode);
        }
      }
      
      // Fetch episodes
      if (anime?.id && fetchEpisodes) {
        setLoadingEpisodes(true);
        fetchEpisodes(anime.id).then(episodeData => {
          setEpisodes(episodeData);
          setLoadingEpisodes(false);
          
          // Fetch durations for all episodes at once
          const durations = {};
          episodeData.forEach(ep => {
            durations[ep.episodeNumber] = ep.duration || `${Math.floor(Math.random() * 5) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
          });
          setEpisodeDurations(durations);
        }).catch(error => {
          console.error('Failed to fetch episodes:', error);
          setLoadingEpisodes(false);
        });
      }
      
      // Add fullscreen event listeners for mobile
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!(document.fullscreenElement || 
          document.webkitFullscreenElement || 
          document.mozFullScreenElement);
        setIsFullscreen(isCurrentlyFullscreen);
        
        // If exiting fullscreen, also exit mobile fullscreen
        if (!isCurrentlyFullscreen) {
          setIsMobileFullscreen(false);
        }
      };
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        // Ensure body scroll is restored when component unmounts
        forceUnlockBodyScroll();
      };
    } else {
      // When video player is closed, ensure body scroll is restored
      forceUnlockBodyScroll();
    }
    
    // Cleanup function to ensure body scroll is always restored
    return () => {
      forceUnlockBodyScroll();
    };
  }, [isOpen, anime?.id, startEpisode]);

  // Handle mobile fullscreen toggle
  const toggleMobileFullscreen = () => {
    if (isMobileFullscreen) {
      // Exit mobile fullscreen
      setIsMobileFullscreen(false);
      // Keep body hidden for video player (don't change overflow here)
    } else {
      // Enter mobile fullscreen
      setIsMobileFullscreen(true);
      // Body overflow is already hidden by the main useEffect
    }
  };

  // Handle native fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && 
          !document.webkitFullscreenElement && 
          !document.mozFullScreenElement) {
        // Enter fullscreen
        if (iframeRef.current) {
          if (iframeRef.current.requestFullscreen) {
            await iframeRef.current.requestFullscreen();
          } else if (iframeRef.current.webkitRequestFullscreen) {
            await iframeRef.current.webkitRequestFullscreen();
          } else if (iframeRef.current.mozRequestFullScreen) {
            await iframeRef.current.mozRequestFullScreen();
          }
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Fallback to mobile fullscreen if native fullscreen fails
      toggleMobileFullscreen();
    }
  };

  // Handle fullscreen button click
  const handleFullscreenClick = () => {
    // Try native fullscreen first, fallback to mobile fullscreen
    toggleFullscreen();
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isMobileFullscreen) {
          setIsMobileFullscreen(false);
        }
        if (isFullscreen) {
          // Native fullscreen will be handled by the fullscreenchange event
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileFullscreen, isFullscreen]);

  const checkIfInMyList = () => {
    const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
    setIsInMyList(myList.some(item => item.id === anime?.id));
  };

  useEffect(() => {
    if (anime?.id && currentEpisode) {
      saveWatchProgress(anime.id, currentEpisode);
    }
  }, [anime?.id, currentEpisode]);

  // Ensure body scroll is restored when component unmounts
  useEffect(() => {
    return () => {
      forceUnlockBodyScroll();
    };
  }, []);

  // Reset video error when server or episode changes
  useEffect(() => {
    setVideoError(false);
    setRetryCount(0);
  }, [currentServer, currentEpisode]);

  const handleEpisodeInputSubmit = (e) => {
    e.preventDefault();
    const episodeNum = parseInt(episodeInput);
    if (episodeNum && episodeNum >= 1 && episodeNum <= totalEpisodes) {
      setCurrentEpisode(episodeNum);
      setEpisodeInput('');
    }
  };

  const toggleMyList = () => {
    const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
    
    if (isInMyList) {
      const updatedList = myList.filter(item => item.id !== anime.id);
      localStorage.setItem('myAnimeList', JSON.stringify(updatedList));
      setIsInMyList(false);
    } else {
      const animeData = {
        id: anime.id,
        title: anime.title,
        coverImage: anime.coverImage,
        bannerImage: anime.bannerImage,
        description: anime.description,
        genres: anime.genres,
        averageScore: anime.averageScore,
        episodes: anime.episodes,
        status: anime.status,
        startDate: anime.startDate
      };
      myList.push(animeData);
      localStorage.setItem('myAnimeList', JSON.stringify(myList));
      setIsInMyList(true);
    }
  };

  if (!anime || !isOpen) return null;

  const title = anime.title.english || anime.title.romaji || anime.title.native;
  const totalEpisodes = anime.episodes || 24;
  const description = anime.description ? 
    anime.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 
    'No description available.';

  const servers = [
    { id: 'sub1', name: 'SUB/DUB/MULTI-1', quality: 'HD', type: 'sub' },
    { id: 'hindi', name: 'Hindi/Multi', quality: 'HD', type: 'hindi' }
  ];

  const getCurrentVideoUrl = () => {
    const currentEp = episodes.find(ep => ep.episodeNumber === currentEpisode);
    const season = currentEp?.season || 1;
    const episode = currentEp?.episode || currentEpisode;
    
    return getVideoUrl(anime.id, season, episode, currentServer);
  };

  const handleVideoError = () => {
    setVideoError(true);
    console.error('Video failed to load for server:', currentServer);
  };

  const retryVideo = () => {
    setVideoError(false);
    setRetryCount(prev => prev + 1);
  };

  const switchToAlternateServer = () => {
    // Find current server index and switch to next available server
    const currentIndex = servers.findIndex(server => server.id === currentServer);
    const nextIndex = (currentIndex + 1) % servers.length;
    const nextServer = servers[nextIndex];
    
    setCurrentServer(nextServer.id);
    setVideoError(false);
    setRetryCount(0);
  };

  // Determine if we're in any type of fullscreen
  const isInAnyFullscreen = isFullscreen || isMobileFullscreen;

  return (
    <div className={`mobile-video-player ${isMobileFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="mobile-player-header">
        <button className="mobile-back-btn" onClick={() => {
          forceUnlockBodyScroll();
          onClose();
        }}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="mobile-player-title">
          <h1>{title}</h1>
          <span>Episode {currentEpisode} of {totalEpisodes}</span>
        </div>
        <div className="mobile-header-actions">
          <button className="mobile-header-btn" onClick={toggleMyList}>
            <i className={`fas ${isInMyList ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
          </button>
          <button className="mobile-header-btn download-btn" onClick={() => {
            const downloadUrl = `https://dl.animeplex.fun/${anime.id}-${currentEpisode}`;
            window.open(downloadUrl, '_blank');
          }}>
            <i className="fas fa-download"></i>
          </button>
          <button className="mobile-header-btn">
            <i className="fas fa-share"></i>
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="mobile-video-container" ref={videoContainerRef}>
        <div className="mobile-video-wrapper">
          {videoError ? (
            <div className="mobile-video-error">
              <div className="error-content">
                <i className="fas fa-exclamation-triangle"></i>
                <h3>Video Failed to Load</h3>
                <p>The video server is not responding. Try switching servers or retry.</p>
                <div className="error-actions">
                  <button className="retry-btn" onClick={retryVideo}>
                    <i className="fas fa-redo"></i> Retry
                  </button>
                  <button className="switch-server-btn" onClick={switchToAlternateServer}>
                    <i className="fas fa-server"></i> Switch Server
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <iframe 
              ref={iframeRef}
              src={getCurrentVideoUrl() + (getCurrentVideoUrl().includes('?') ? '&' : '?') + 'retry=' + retryCount}
              allowFullScreen
              webkitAllowFullScreen
              mozAllowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              title={`${title} Episode ${currentEpisode}`}
              className="mobile-video-iframe"
              onError={handleVideoError}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block'
              }}
            />
          )}
          {/* Fullscreen Button */}
          <button 
            className="mobile-fullscreen-btn"
            onClick={handleFullscreenClick}
            title="Toggle Fullscreen"
          >
            <i className={`fas ${isInAnyFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
        </div>
      </div>



      {/* Control Sections */}
      <div className="mobile-controls">
        <div className="mobile-section">
          <div className="mobile-section-header">
            <h3>Choose Language</h3>
          </div>
          
          <div className="mobile-language-container">
            <div className="mobile-language-grid">
              {servers.map((server) => {
                const isActive = currentServer === server.id;
                const getLanguageIcon = (type) => {
                  switch(type) {
                    case 'sub': return 'fas fa-closed-captioning';
                    case 'dub': return 'fas fa-volume-up';
                    case 'hindi': return 'fas fa-globe';
                    default: return 'fas fa-play';
                  }
                };
                
                return (
                  <button
                    key={server.id}
                    className={`mobile-language-button ${isActive ? 'active' : ''}`}
                    onClick={() => setCurrentServer(server.id)}
                  >
                    <div className="mobile-language-icon">
                      <i className={getLanguageIcon(server.type)}></i>
                    </div>
                    <div className="mobile-language-info">
                      <span className="mobile-language-name">{server.name}</span>
                    </div>
                    {isActive && (
                      <div className="mobile-language-check">
                        <i className="fas fa-check"></i>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Server Selection Section */}
        <div className="mobile-section">
          <div className="mobile-section-header">
            <h3>Servers</h3>
          </div>
          <div className="mobile-servers-container">
            {servers.map(server => (
              <button
                key={server.id}
                className={`mobile-server-btn ${currentServer === server.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentServer(server.id);
                  setVideoError(false);
                  setRetryCount(0);
                }}
              >
                <span className="server-name">{server.name}</span>
                <span className="server-quality">{server.quality}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mobile-section">
          <div className="mobile-section-header">
            <h3>Episodes</h3>
          </div>
          
          <div className="mobile-episode-input-section">
            <form onSubmit={handleEpisodeInputSubmit} className="mobile-episode-input-form">
              <input
                type="number"
                value={episodeInput}
                onChange={(e) => setEpisodeInput(e.target.value)}
                placeholder={`Go to episode (1-${totalEpisodes})`}
                min="1"
                max={totalEpisodes}
                className="mobile-episode-input"
              />
              <button type="submit" className="mobile-episode-go-btn">
                <i className="fas fa-play"></i>
              </button>
            </form>
          </div>
          
          <div className="mobile-episodes-container">
              {loadingEpisodes ? (
                <div className="mobile-loading">Loading episodes...</div>
              ) : (
                <div className="mobile-episodes-list">
                  {episodes.map(episode => {
                    const isActive = currentEpisode === episode.episodeNumber;
                    const isNext = episode.episodeNumber === currentEpisode + 1;
                    return (
                      <div
                        key={episode.episodeNumber}
                        className={`mobile-episode-item ${isActive ? 'active' : ''} ${isNext ? 'next' : ''}`}
                        onClick={() => setCurrentEpisode(episode.episodeNumber)}
                      >
                        <div className="mobile-episode-thumbnail">
                          <img 
                            src={episode.thumbnail || anime.bannerImage || anime.coverImage?.large} 
                            alt={episode.title}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/120x68/FF6600/FFFFFF?text=EP+' + episode.episodeNumber}
                          />
                          <div className="mobile-episode-duration">
                            {episodeDurations[episode.episodeNumber] || '24:00'}
                          </div>
                          {isActive && (
                            <div className="mobile-play-indicator">
                              <i className="fas fa-play"></i>
                            </div>
                          )}
                          {isNext && (
                            <div className="mobile-next-indicator">
                              UP NEXT
                            </div>
                          )}
                        </div>
                        <div className="mobile-episode-details">
                          <h4 className="mobile-episode-title">{episode.episodeNumber}. {episode.title}</h4>
                          <p className="mobile-episode-description">
                            {title} - Episode {episode.episodeNumber}
                          </p>
                          <div className="mobile-episode-actions">
                            <button 
                              className="mobile-download-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const downloadUrl = `https://dl.animeplex.fun/${anime.id}-${episode.episodeNumber}`;
                                window.open(downloadUrl, '_blank');
                              }}
                              title="Download Episode"
                            >
                              <i className="fas fa-download"></i>
                            </button>
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
    </div>
  );
};

export default MobileVideoPlayer;