import React from 'react';

const HeroBanner = ({ featuredAnime, onPlayClick, onInfoClick }) => {
  if (!featuredAnime) return null;

  const title = featuredAnime.title.english || featuredAnime.title.romaji || featuredAnime.title.native;
  const description = featuredAnime.description ? 
    featuredAnime.description.replace(/<[^>]*>/g, '').substring(0, 300) + '...' : 
    'No description available.';
  const bannerImage = featuredAnime.bannerImage || featuredAnime.coverImage.extraLarge || featuredAnime.coverImage.large;
  const score = featuredAnime.averageScore ? (featuredAnime.averageScore / 10).toFixed(1) : 'N/A';
  const year = featuredAnime.startDate?.year || 'Unknown';
  const episodes = featuredAnime.episodes || '?';
  const genres = featuredAnime.genres ? featuredAnime.genres.slice(0, 3).join(', ') : 'Unknown';

  const bannerStyle = {
    backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url('${bannerImage}')`
  };

  return (
    <section className="crunchyroll-hero-banner" style={bannerStyle}>
      <div className="hero-content-wrapper">
        <div className="hero-left-content">
          <div className="anime-logo">
            <h1 className="hero-anime-title">{title}</h1>
          </div>
          
          <div className="anime-metadata">
            <div className="metadata-row">
              <span className="rating-badge">U/A 16+</span>
              <span className="metadata-item">• Dubbed</span>
            </div>
            
            <div className="rating-row">
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i 
                    key={star} 
                    className={`fas fa-star ${star <= Math.round(score / 2) ? 'filled' : ''}`}
                  ></i>
                ))}
              </div>
              <span className="average-rating">Average Rating: {score} ({featuredAnime.popularity || '0'})</span>
            </div>
          </div>

          <p className="hero-anime-description">{description}</p>

          <div className="hero-actions">
            <button className="start-watching-btn" onClick={() => onPlayClick(featuredAnime)}>
              <i className="fas fa-play"></i>
              START WATCHING S1 E1
            </button>
            <button className="add-to-list-btn" onClick={() => onInfoClick(featuredAnime)}>
              <i className="fas fa-bookmark"></i>
            </button>
            <button className="share-btn">
              <i className="fas fa-plus"></i>
            </button>
            <button className="more-btn">
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>

          <div className="anime-info-tags">
            <span className="info-tag">Audio: English, हिंदी, தமிழ், తెలుగు</span>
            <span className="info-tag">Content Advisory: U/A 16+ Violence</span>
            <span className="info-tag">©{year} {featuredAnime.studios?.[0]?.name || 'STUDIO'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
