import React, { useState, useEffect, useRef, useCallback } from 'react';
import { saveWatchProgress, getWatchProgress } from '../utils/watchProgress';
import { getVideoUrl } from '../services/tmdbApi';

const VideoPlayer = ({ anime, isOpen, onClose, recommendations = [], onRecommendationClick, startEpisode = 1, fetchEpisodes }) => {
  const [currentEpisode, setCurrentEpisode] = useState(startEpisode);
  const [currentServer, setCurrentServer] = useState('sub1');
  const [isInMyList, setIsInMyList] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [nextEpisodeDuration, setNextEpisodeDuration] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [episodeInput, setEpisodeInput] = useState('');
  const episodesListRef = useRef(null);
  const episodesCache = useRef(new Map());

  // Memoize episodes to prevent unnecessary re-renders
  const memoizedEpisodes = useCallback(() => {
    return episodes;
  }, [episodes]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      checkIfInMyList();
      
      if (startEpisode > 1) {
        setCurrentEpisode(startEpisode);
      } else {
        const progress = getWatchProgress(anime?.id);
        if (progress) {
          setCurrentEpisode(progress.episode);
        }
      }
      
      // Check if episodes are already cached
      if (anime?.id && episodesCache.current.has(anime.id)) {
        setEpisodes(episodesCache.current.get(anime.id));
        setLoadingEpisodes(false);
        // Restore scroll position if available
        setTimeout(() => {
          if (episodesListRef.current) {
            episodesListRef.current.scrollTop = scrollPosition;
          }
        }, 100);
      } else if (anime?.id && fetchEpisodes) {
        setLoadingEpisodes(true);
        fetchEpisodes(anime.id).then(episodeData => {
          setEpisodes(episodeData);
          // Cache the episodes
          episodesCache.current.set(anime.id, episodeData);
          setLoadingEpisodes(false);
          // Fetch duration for next episode
          fetchNextEpisodeDuration(episodeData, currentEpisode);
        }).catch(error => {
          console.error('Failed to fetch episodes:', error);
          setLoadingEpisodes(false);
        });
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, anime, startEpisode, fetchEpisodes]);

  // Save scroll position when scrolling
  const handleScroll = useCallback((e) => {
    setScrollPosition(e.target.scrollTop);
  }, []);

  // Scroll to current episode when it changes
  useEffect(() => {
    if (episodesListRef.current && episodes.length > 0) {
      const currentEpisodeElement = episodesListRef.current.querySelector(`[data-episode="${currentEpisode}"]`);
      if (currentEpisodeElement) {
        currentEpisodeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentEpisode, episodes.length]);

  const checkIfInMyList = () => {
    const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
    setIsInMyList(myList.some(item => item.id === anime?.id));
  };

  useEffect(() => {
    if (anime?.id && currentEpisode) {
      saveWatchProgress(anime.id, currentEpisode);
      // Fetch duration for next episode when current episode changes
      if (episodes.length > 0) {
        fetchNextEpisodeDuration(episodes, currentEpisode);
      }
    }
  }, [anime?.id, currentEpisode, episodes]);

  const fetchNextEpisodeDuration = async (episodeList, current) => {
    const nextEpisodeNumber = current + 1;
    const nextEpisode = episodeList.find(ep => ep.episodeNumber === nextEpisodeNumber);
    
    if (!nextEpisode) {
      setNextEpisodeDuration(null);
      return;
    }

    try {
      // Mock API call - replace with actual video duration API
      const response = await fetch(`https://api.example.com/video-duration/${anime.id}/${nextEpisodeNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        setNextEpisodeDuration(data.duration);
      } else {
        // Fallback: Generate realistic duration (20-25 minutes for anime)
        const minutes = Math.floor(Math.random() * 5) + 20; // 20-24 minutes
        const seconds = Math.floor(Math.random() * 60); // 0-59 seconds
        setNextEpisodeDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    } catch (error) {
      console.error('Failed to fetch next episode duration:', error);
      // Fallback duration
      const minutes = Math.floor(Math.random() * 5) + 20;
      const seconds = Math.floor(Math.random() * 60);
      setNextEpisodeDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  };

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
    anime.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 
    'No description available.';
  
  console.log('VideoPlayer Debug:', { title, totalEpisodes, currentEpisode });

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

  return (
    <div className="youtube-video-player">
      {/* Header */}
      <div className="youtube-player-header">
        <button className="back-button" onClick={onClose}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="header-content">
          <h1 className="video-title">{title} - Episode {currentEpisode}</h1>
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={toggleMyList}>
            <i className={`fas ${isInMyList ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
          </button>
          <button className="header-btn">
            <i className="fas fa-share"></i>
          </button>
          <button className="header-btn">
            <i className="fas fa-ellipsis-h"></i>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="youtube-main-content">
        {/* Left Side - Video Player */}
        <div className="youtube-video-section">
          <div className="video-container">
            <iframe 
              src={getCurrentVideoUrl()}
              allowFullScreen
              webkitAllowFullScreen
              mozAllowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              title={`${title} Episode ${currentEpisode}`}
              className="video-iframe"
              frameBorder="0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          
          {/* Video Info */}
          <div className="video-info">
            <h2 className="video-title-main">{title}</h2>
            <div className="video-meta">
              <span className="episode-info">Episode {currentEpisode} of {totalEpisodes}</span>
              <div className="video-actions">
                <button className={`action-btn ${isInMyList ? 'active' : ''}`} onClick={toggleMyList}>
                  <i className="fas fa-plus"></i>
                  {isInMyList ? 'Remove from List' : 'Add to List'}
                </button>
                <button className="action-btn download-btn" onClick={() => {
                  const downloadUrl = `https://dl.animeplex.fun/${anime.id}-${currentEpisode}`;
                  window.open(downloadUrl, '_blank');
                }}>
                  <i className="fas fa-download"></i>
                  Download
                </button>
                <button className="action-btn">
                  <i className="fas fa-thumbs-up"></i>
                  Like
                </button>
                <button className="action-btn">
                  <i className="fas fa-share"></i>
                  Share
                </button>
              </div>
            </div>
            <div className="video-description">
              <p>{description}</p>
              <div className="video-tags">
                {anime.genres?.slice(0, 3).map((genre, index) => (
                  <span key={index} className="tag">{genre}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Server Selection */}
          <div className="server-section">
            <h3 className="server-title">Choose Server</h3>
            
            <div className="server-group">
              <h4 className="server-group-title">CHOOSE SERVER</h4>
              <div className="server-buttons">
                {servers.map((server) => (
                  <button
                    key={server.id}
                    className={`server-button ${currentServer === server.id ? 'active' : ''}`}
                    onClick={() => setCurrentServer(server.id)}
                  >
                    <span className="server-name">{server.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Episodes List */}
        <div className="youtube-episodes-sidebar">
          <div className="episodes-header">
            <h3>Next Episodes</h3>
            <span className="episodes-count">{episodes.length || 37} episodes</span>
          </div>
          
          <div className="episode-input-section">
            <form onSubmit={handleEpisodeInputSubmit} className="episode-input-form">
              <input
                type="number"
                value={episodeInput}
                onChange={(e) => setEpisodeInput(e.target.value)}
                placeholder={`Go to episode (1-${totalEpisodes})`}
                min="1"
                max={totalEpisodes}
                className="episode-input"
              />
              <button type="submit" className="episode-go-btn">
                <i className="fas fa-play"></i>
              </button>
            </form>
          </div>
          

          
          <div className="episodes-list" ref={episodesListRef} onScroll={handleScroll}>
            {loadingEpisodes ? (
              <div style={{padding: '2rem', textAlign: 'center', color: 'white'}}>
                Loading episodes...
              </div>
            ) : (
              episodes.map(episode => {
                const isActive = currentEpisode === episode.episodeNumber;
                const isNext = episode.episodeNumber === currentEpisode + 1;
                return (
                  <div
                    key={episode.episodeNumber}
                    data-episode={episode.episodeNumber}
                    className={`episode-item ${isActive ? 'active' : ''} ${isNext ? 'next' : ''}`}
                    onClick={() => setCurrentEpisode(episode.episodeNumber)}
                  >
                                         <div className="episode-thumbnail">
                       <img 
                         src={episode.thumbnail || anime.bannerImage || anime.coverImage?.large} 
                         alt={episode.title}
                         onError={(e) => e.target.src = 'https://via.placeholder.com/120x68/FF6600/FFFFFF?text=EP+' + episode.episodeNumber}
                         loading="lazy"
                       />
                      <div className="episode-duration">
                        {isNext && nextEpisodeDuration ? nextEpisodeDuration : episode.duration}
                      </div>
                      {isActive && (
                        <div className="play-indicator">
                          <i className="fas fa-play"></i>
                        </div>
                      )}
                      {isNext && (
                        <div className="next-indicator">
                          UP NEXT
                        </div>
                      )}
                    </div>
                    <div className="episode-details">
                      <h4 className="episode-title">{episode.episodeNumber}. {episode.title}</h4>
                      <p className="episode-description">
                        {title} - Episode {episode.episodeNumber}
                      </p>
                      <div className="episode-meta">
                        <span className="episode-views">{episode.views}</span>
                        <span className="episode-date">•</span>
                        <span className="episode-date">{episode.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
