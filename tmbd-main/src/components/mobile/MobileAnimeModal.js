import React from 'react';

const MobileAnimeModal = ({ anime, isOpen, onClose, onPlay, onAddToList }) => {
  if (!isOpen || !anime) return null;

  const title = anime.title.english || anime.title.romaji || anime.title.native;
  const bannerImage = anime.bannerImage || anime.coverImage?.extraLarge;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
  const year = anime.startDate?.year || 'Unknown';
  const genres = anime.genres?.slice(0, 4) || [];
  
  const description = anime.description
    ? anime.description.replace(/<[^>]*>/g, '').substring(0, 300) + '...'
    : 'An amazing anime series waiting to be discovered.';

  const handleAddToList = () => {
    const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
    const isAlreadyInList = myList.some(item => item.id === anime.id);
    
    if (!isAlreadyInList) {
      myList.push(anime);
      localStorage.setItem('myAnimeList', JSON.stringify(myList));
      
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = 'mobile-toast success show';
      toast.textContent = 'Added to My List';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
    }
    
    if (onAddToList) onAddToList();
  };

  return (
    <div className="mobile-anime-modal">
      <div 
        className="mobile-modal-header"
        style={{ 
          backgroundImage: bannerImage ? `url(${bannerImage})` : 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
        }}
      >
        <div className="mobile-modal-overlay"></div>
        <button className="mobile-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="mobile-modal-content">
          <h1 className="mobile-modal-title">{title}</h1>
          
          <div className="mobile-modal-meta">
            <div className="mobile-modal-rating">★ {score}</div>
            <div className="mobile-modal-year">{year}</div>
          </div>
          
          <p className="mobile-modal-description">{description}</p>
          
          <div className="mobile-modal-actions">
            <button 
              className="mobile-modal-play"
              onClick={() => onPlay(anime)}
            >
              <i className="fas fa-play"></i>
              Watch Now
            </button>
            
            <button 
              className="mobile-modal-list"
              onClick={handleAddToList}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mobile-modal-info">
        {genres.length > 0 && (
          <div className="mobile-modal-genres">
            <h4>Genres</h4>
            <div className="mobile-genre-tags">
              {genres.map((genre, index) => (
                <span key={index} className="mobile-genre-tag">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mobile-modal-stats">
          <h4>Details</h4>
          <div className="mobile-stats-grid">
            <div className="mobile-stat">
              <span className="mobile-stat-label">Status:</span>
              <span className="mobile-stat-value">{anime.status || 'Unknown'}</span>
            </div>
            <div className="mobile-stat">
              <span className="mobile-stat-label">Score:</span>
              <span className="mobile-stat-value">★ {score}</span>
            </div>
            <div className="mobile-stat">
              <span className="mobile-stat-label">Year:</span>
              <span className="mobile-stat-value">{year}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAnimeModal;