import React from 'react';

const AnimePage = ({ animeList, title, onClose, onAnimeClick }) => {
  return (
    <div className="anime-page">
      <div className="anime-page-header">
        <button className="back-btn" onClick={onClose}>
          <i className="fas fa-arrow-left"></i>
          <span>Back</span>
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      
      <div className="anime-page-content">
        <div className="anime-grid">
          {animeList.map((anime, index) => {
            const title = anime.title.english || anime.title.romaji || anime.title.native;
            const image = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium;
            const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
            const format = anime.format || 'TV';
            const genres = anime.genres ? anime.genres.slice(0, 2).join(', ') : 'Unknown';
            const year = anime.startDate?.year || 'Unknown';
            const isPremium = Math.random() > 0.7;
            const isCompleted = anime.status === 'FINISHED';
            
            return (
              <div key={index} className="crunchyroll-card" onClick={() => onAnimeClick(anime)}>
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
      </div>
    </div>
  );
};

export default AnimePage;