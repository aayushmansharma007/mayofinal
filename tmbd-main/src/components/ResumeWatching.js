import React, { useState, useEffect } from 'react';
import { getRecentlyWatched } from '../utils/watchProgress';

const ResumeWatching = ({ onClose, onAnimeClick, onRemoveAnime, allAnime }) => {
  const [recentlyWatched, setRecentlyWatched] = useState([]);

  useEffect(() => {
    const watchHistory = getRecentlyWatched();
    const animeWithDetails = watchHistory.map(progress => {
      const anime = allAnime.find(a => a.id === progress.animeId);
      return anime ? { ...anime, progress } : null;
    }).filter(Boolean);
    
    setRecentlyWatched(animeWithDetails);
  }, [allAnime]);

  return (
    <div className="anime-page">
      <div className="anime-page-header">
        <button className="back-btn" onClick={onClose}>
          <i className="fas fa-arrow-left"></i>
          <span>Back</span>
        </button>
        <h1 className="page-title">Resume Watching</h1>
      </div>
      
      <div className="anime-page-content">
        {recentlyWatched.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-gray-300">No recently watched anime found.</p>
            <p className="text-gray-400">Start watching some anime to see them here!</p>
          </div>
        ) : (
          <div className="anime-grid">
            {recentlyWatched.map((anime, index) => {
              const title = anime.title.english || anime.title.romaji || anime.title.native;
              const image = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium;
              const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
              const episodes = anime.episodes || '?';
              const format = anime.format || 'TV';
              const genres = anime.genres ? anime.genres.slice(0, 2).join(', ') : 'Unknown';
              const year = anime.startDate?.year || 'Unknown';
              const isPremium = Math.random() > 0.7;
              const isCompleted = anime.status === 'FINISHED';
              
              return (
                <div key={index} className="crunchyroll-card" onClick={() => onAnimeClick(anime, anime.progress.episode)}>
                  <div className="crunchyroll-card-image">
                    <img 
                      src={image} 
                      alt={title}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/300x400/2F2F2F/FFFFFF?text=No+Image'}
                    />
                    
                    {/* Premium Badge */}
                    {isPremium && (
                      <div className="crunchyroll-premium-badge">
                        <i className="fas fa-crown"></i>
                        PREMIUM
                      </div>
                    )}
                    
                    {/* Resume Progress Badge */}
                    <div className="crunchyroll-episode-badge" style={{background: 'var(--crunchyroll-orange)', color: 'white'}}>
                      Episode {anime.progress.episode}
                    </div>
                    
                    {/* Remove Button */}
                    <button 
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAnime(anime.id);
                        setRecentlyWatched(prev => prev.filter(a => a.id !== anime.id));
                      }}
                      style={{position: 'absolute', top: '8px', right: '8px', zIndex: 10}}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                    
                    {/* Play Overlay */}
                    <div className="crunchyroll-play-overlay">
                      <div className="crunchyroll-play-btn">
                        <i className="fas fa-play"></i>
                      </div>
                      <div className="crunchyroll-overlay-content">
                        <h3 className="crunchyroll-overlay-title">{title}</h3>
                        <p className="crunchyroll-overlay-meta">{format} • {year}</p>
                        <div className="crunchyroll-overlay-genres">{genres}</div>
                        <div className="crunchyroll-overlay-rating">
                          <i className="fas fa-star"></i>
                          {score}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Info */}
                  <div className="crunchyroll-card-info">
                    <h3 className="crunchyroll-card-title">{title}</h3>
                    <div className="crunchyroll-card-meta">
                      <span className="crunchyroll-card-type">{format}</span>
                      <span className="crunchyroll-card-status">{isCompleted ? 'Complete' : 'Ongoing'}</span>
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

export default ResumeWatching;