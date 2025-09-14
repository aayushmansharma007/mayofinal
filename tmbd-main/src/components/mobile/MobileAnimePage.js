import React, { useState, useEffect } from 'react';

const MobileAnimePage = ({ animeList, title, onClose, onAnimeClick }) => {
  const [sortBy, setSortBy] = useState('popularity');
  const [filterBy, setFilterBy] = useState('all');
  const [sortedList, setSortedList] = useState(animeList);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = [...animeList];
    
    // Apply filters
    if (filterBy !== 'all') {
      filtered = filtered.filter(anime => {
        if (filterBy === 'completed') return anime.status === 'FINISHED';
        if (filterBy === 'ongoing') return anime.status === 'RELEASING';
        if (filterBy === 'upcoming') return anime.status === 'NOT_YET_RELEASED';
        return true;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return (b.averageScore || 0) - (a.averageScore || 0);
      if (sortBy === 'year') return (b.startDate?.year || 0) - (a.startDate?.year || 0);
      if (sortBy === 'title') {
        const titleA = a.title.english || a.title.romaji || a.title.native;
        const titleB = b.title.english || b.title.romaji || b.title.native;
        return titleA.localeCompare(titleB);
      }
      return (b.popularity || 0) - (a.popularity || 0);
    });
    
    setSortedList(filtered);
  }, [animeList, sortBy, filterBy]);

  return (
    <div className="mobile-anime-page enhanced">
      <div className="mobile-page-header enhanced">
        <div className="mobile-header-left">
          <button className="mobile-back-btn" onClick={onClose}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="mobile-page-title-section">
            <h2>{title}</h2>
            <span className="mobile-page-count">{sortedList.length} anime</span>
          </div>
        </div>
        <button 
          className="mobile-filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <i className="fas fa-filter"></i>
        </button>
      </div>
      
      {showFilters && (
        <div className="mobile-filters-panel">
          <div className="mobile-filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="year">Year</option>
              <option value="title">Title</option>
            </select>
          </div>
          <div className="mobile-filter-group">
            <label>Filter:</label>
            <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="mobile-page-content">
        <div className="mobile-anime-grid enhanced">
          {sortedList.map((anime, index) => {
            const animeTitle = anime.title.english || anime.title.romaji || anime.title.native;
            const image = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium;
            const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
            const genres = anime.genres?.slice(0, 2) || [];
            const year = anime.startDate?.year || 'N/A';
            const episodes = anime.episodes || '?';
            const status = anime.status;
            
            return (
              <div 
                key={anime.id} 
                className="mobile-anime-card enhanced grid-card"
                onClick={() => onAnimeClick(anime)}
                style={{ animationDelay: `${index * 0.05}s` }}
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
                  {status === 'NOT_YET_RELEASED' && (
                    <div className="mobile-status-badge upcoming">
                      <i className="fas fa-clock"></i>
                      <span>UPCOMING</span>
                    </div>
                  )}
                  
                  {/* Quality Badge */}
                  <div className="mobile-quality-badge">
                    <span>HD</span>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="mobile-rating-badge">
                    <i className="fas fa-star"></i>
                    <span>{score}</span>
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
                        <span>•</span>
                        <span>{episodes} eps</span>
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
                    <div className="mobile-card-year">{year}</div>
                  </div>
                  <div className="mobile-card-genres">
                    {genres.map((genre, idx) => (
                      <span key={idx} className="mobile-genre-tag">{genre}</span>
                    ))}
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

export default MobileAnimePage;