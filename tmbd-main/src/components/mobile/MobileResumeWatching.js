import React, { useState, useEffect } from 'react';

const MobileResumeWatching = ({ onClose, onAnimeClick, onRemoveAnime, allAnime }) => {
  const [resumeList, setResumeList] = useState([]);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const watchHistory = JSON.parse(localStorage.getItem('animeWatchHistory') || '{}');
    let resumeData = Object.values(watchHistory).map(item => {
      const anime = allAnime.find(a => a.id === item.animeId);
      return {
        ...item,
        anime: anime
      };
    }).filter(item => item.anime);
    
    // Sort based on selection
    if (sortBy === 'recent') {
      resumeData.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'progress') {
      resumeData.sort((a, b) => {
        const progressA = (a.episodeNumber / (a.anime.episodes || 1)) * 100;
        const progressB = (b.episodeNumber / (b.anime.episodes || 1)) * 100;
        return progressB - progressA;
      });
    } else if (sortBy === 'title') {
      resumeData.sort((a, b) => {
        const titleA = a.anime.title.english || a.anime.title.romaji || a.anime.title.native;
        const titleB = b.anime.title.english || b.anime.title.romaji || b.anime.title.native;
        return titleA.localeCompare(titleB);
      });
    }
    
    setResumeList(resumeData);
  }, [allAnime, sortBy]);

  const handleRemove = (animeId) => {
    onRemoveAnime(animeId);
    const updatedList = resumeList.filter(item => item.animeId !== animeId);
    setResumeList(updatedList);
  };

  const formatLastWatched = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  };

  const calculateProgress = (current, total) => {
    if (!total || total === 0) return 0;
    return Math.min((current / total) * 100, 100);
  };

  return (
    <div className="mobile-resume-page enhanced">
      <div className="mobile-page-header enhanced">
        <div className="mobile-header-left">
          <button className="mobile-back-btn" onClick={onClose}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="mobile-page-title-section">
            <h2>Continue Watching</h2>
            <span className="mobile-page-count">{resumeList.length} anime</span>
          </div>
        </div>
        <div className="mobile-sort-dropdown">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Recently Watched</option>
            <option value="progress">Progress</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>
      
      <div className="mobile-page-content">
        {resumeList.length === 0 ? (
          <div className="empty-state enhanced">
            <div className="empty-state-icon">
              <i className="fas fa-play-circle"></i>
            </div>
            <h3>No anime to resume</h3>
            <p>Start watching some anime to see them here!</p>
            <div className="empty-state-suggestions">
              <span>Try browsing:</span>
              <div className="suggestion-tags">
                <span className="suggestion-tag">Trending</span>
                <span className="suggestion-tag">Popular</span>
                <span className="suggestion-tag">Latest</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mobile-resume-grid enhanced">
            {resumeList.map((item, index) => {
              const title = item.anime.title.english || item.anime.title.romaji || item.anime.title.native;
              const image = item.anime.coverImage.extraLarge || item.anime.coverImage.large || item.anime.coverImage.medium;
              const score = item.anime.averageScore ? (item.anime.averageScore / 10).toFixed(1) : 'N/A';
              const totalEpisodes = item.anime.episodes || 0;
              const progress = calculateProgress(item.episodeNumber, totalEpisodes);
              const lastWatched = formatLastWatched(item.timestamp);
              
              return (
                <div 
                  key={item.animeId} 
                  className="mobile-resume-card enhanced"
                  onClick={() => onAnimeClick(item.anime, item.episodeNumber)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mobile-card-image">
                    <img 
                      src={image} 
                      alt={title}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/140x200/2F2F2F/FFFFFF?text=No+Image'}
                    />
                    
                    {/* Progress Bar */}
                    <div className="mobile-progress-bar">
                      <div 
                        className="mobile-progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Episode Badge */}
                    <div className="mobile-episode-badge">
                      <i className="fas fa-play"></i>
                      <span>EP {item.episodeNumber}</span>
                    </div>
                    
                    {/* Continue Badge */}
                    <div className="mobile-continue-badge">
                      <i className="fas fa-redo"></i>
                      <span>CONTINUE</span>
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className="mobile-card-gradient"></div>
                    
                    {/* Play Overlay */}
                    <div className="mobile-card-overlay">
                      <div className="mobile-play-btn-card large">
                        <i className="fas fa-play"></i>
                      </div>
                      <div className="mobile-overlay-info">
                        <div className="mobile-overlay-title">{title}</div>
                        <div className="mobile-overlay-meta">
                          <span>Episode {item.episodeNumber}</span>
                          {totalEpisodes > 0 && (
                            <>
                              <span>•</span>
                              <span>{Math.round(progress)}% complete</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button 
                      className="mobile-remove-btn enhanced"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.animeId);
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
                      <div className="mobile-card-episode">Ep {item.episodeNumber}/{totalEpisodes || '?'}</div>
                    </div>
                    <div className="mobile-card-progress-info">
                      <span className="mobile-progress-text">{Math.round(progress)}% watched</span>
                      <span className="mobile-last-watched">{lastWatched}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileResumeWatching;