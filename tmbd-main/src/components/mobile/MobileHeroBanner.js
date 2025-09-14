import React from 'react';

const MobileHeroBanner = ({ featuredAnime, onPlayClick }) => {
  if (!featuredAnime) {
    return (
      <div className="mobile-hero-banner" style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)' }}>
        <div className="mobile-hero-overlay"></div>
        <div className="mobile-hero-content">
          <h1 className="mobile-hero-title">Loading...</h1>
        </div>
      </div>
    );
  }

  const title = featuredAnime.title.english || featuredAnime.title.romaji || featuredAnime.title.native;
  const bannerImage = featuredAnime.bannerImage || featuredAnime.coverImage?.extraLarge;
  const score = featuredAnime.averageScore ? (featuredAnime.averageScore / 10).toFixed(1) : 'N/A';
  const genres = featuredAnime.genres?.slice(0, 3).join(' • ') || 'Anime';
  
  const description = featuredAnime.description
    ? featuredAnime.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
    : 'An amazing anime series waiting to be discovered.';

  return (
    <div 
      className="mobile-hero-banner"
      style={{ 
        backgroundImage: bannerImage ? `url(${bannerImage})` : 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
      }}
    >
      <div className="mobile-hero-overlay"></div>
      <div className="mobile-hero-content">
        <h1 className="mobile-hero-title">{title}</h1>
        
        <div className="mobile-hero-meta">
          <div className="mobile-rating-badge">★ {score}</div>
          <div className="mobile-hero-genres">{genres}</div>
        </div>
        
        <p className="mobile-hero-description">{description}</p>
        
        <div className="mobile-hero-actions">
          <button 
            className="mobile-play-btn"
            onClick={() => onPlayClick(featuredAnime)}
          >
            <i className="fas fa-play"></i>
            Watch Now
          </button>
          
          <button className="mobile-info-btn">
            <i className="fas fa-info"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileHeroBanner;