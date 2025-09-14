import React from 'react';

const ContentCard = ({ anime, onClick }) => {
  const title = anime.title.english || anime.title.romaji || anime.title.native;
  const image = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium;
  const year = anime.startDate?.year || 'Unknown';
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
  const status = anime.status || 'Unknown';
  const genres = anime.genres ? anime.genres.slice(0, 2).join(', ') : 'Unknown';
  const format = anime.format || 'TV';
  const isCompleted = status === 'FINISHED';
  const isPremium = Math.random() > 0.7; // Simulate premium content

  return (
    <div className="crunchyroll-card fade-in" onClick={() => onClick(anime)}>
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
};

export default ContentCard;