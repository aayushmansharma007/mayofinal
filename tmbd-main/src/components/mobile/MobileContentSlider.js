import React, { useRef } from 'react';

const MobileContentSlider = ({ title, animeList, onCardClick }) => {
  const sliderRef = useRef(null);

  if (!animeList || animeList.length === 0) {
    return null;
  }

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="mobile-content-section">
      <div className="mobile-section-header">
        <div className="mobile-section-title-wrapper">
          <h2 className="mobile-section-title">{title}</h2>
          <div className="mobile-section-indicator">
            <div className="mobile-indicator-dot"></div>
            <span className="mobile-section-count">{animeList.length} shows</span>
          </div>
        </div>
      </div>
      
      <div className="mobile-content-slider" ref={sliderRef}>
        {animeList.map((anime, index) => {
          const animeTitle = anime.title.english || anime.title.romaji || anime.title.native;
          const image = anime.coverImage.large || anime.coverImage.medium || anime.coverImage.extraLarge;
          const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
          const genres = anime.genres?.slice(0, 2) || [];
          const year = anime.startDate?.year || 'N/A';
          const status = anime.status;
          
          return (
            <div 
              key={anime.id} 
              className="mobile-anime-card enhanced"
              onClick={() => onCardClick(anime)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mobile-card-image">
                <img 
                  src={image} 
                  alt={animeTitle}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/140x200/2F2F2F/FFFFFF?text=No+Image'}
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
                
                {/* Gradient Overlay */}
                <div className="mobile-card-gradient"></div>
                
                {/* Play Overlay */}
                <div className="mobile-card-overlay">
                  <div className="mobile-play-btn-card">
                    <i className="fas fa-play"></i>
                  </div>
                  <div className="mobile-overlay-info">
                    <div className="mobile-overlay-title">{animeTitle}</div>
                    <div className="mobile-overlay-meta">
                      <span>{year}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mobile-card-info">
                <h3 className="mobile-card-title">{animeTitle}</h3>
                <div className="mobile-card-meta">
                  <div className="mobile-card-rating">
                    <i className="fas fa-star"></i>
                    <span>{score}</span>
                  </div>
                  <div className="mobile-card-genres">
                    {genres.map((genre, idx) => (
                      <span key={idx} className="mobile-genre-tag">{genre}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileContentSlider;