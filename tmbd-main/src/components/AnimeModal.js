import React, { useState, useEffect } from 'react';
import { getVideoUrl } from '../services/tmdbApi';

const AnimeModal = ({ anime, isOpen, onClose }) => {
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [currentServer, setCurrentServer] = useState('sub1');
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setShowVideo(false);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!anime || !isOpen) return null;

  const title = anime.title.english || anime.title.romaji || anime.title.native;
  const description = anime.description ? 
    anime.description.replace(/<[^>]*>/g, '').substring(0, 300) + '...' : 
    'No description available.';
  const bgImage = anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large;
  const totalEpisodes = anime.episodes || 24;

  const servers = [
    { id: 'sub1', name: 'SUB/DUB/MULTI-1', quality: 'HD', type: 'sub' },
    { id: 'hindi', name: 'Hindi/Multi', quality: 'HD', type: 'hindi' }
  ];

  const selectEpisode = (episodeNumber) => {
    setCurrentEpisode(episodeNumber);
    if (showVideo) loadVideo();
  };

  const selectServer = (serverId) => {
    setCurrentServer(serverId);
    if (showVideo) loadVideo();
  };

  const startWatching = () => {
    setShowVideo(true);
    loadVideo();
  };

  const loadVideo = () => {
    const animeId = anime.id;
    const episode = currentEpisode;
    
    // Use the centralized getVideoUrl function for consistency
    return getVideoUrl(animeId, 1, episode, currentServer);
  };

  const handleModalClick = (e) => {
    if (e.target.classList.contains('modal')) {
      onClose();
    }
  };

  return (
    <div className={`modal ${isOpen ? 'show' : ''}`} onClick={handleModalClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} title="Close">
          <i className="fas fa-times"></i>
        </button>
        <div 
          className="modal-header" 
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(20,20,20,1)), url('${bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="modal-info">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg mb-4 text-gray-300">{description}</p>
          
          <div className="flex items-center space-x-4 mb-6">
            <button className="netflix-btn" onClick={startWatching}>
              <i className="fas fa-play mr-2"></i>Play
            </button>
            <button className="netflix-btn-secondary">
              <i className="fas fa-plus mr-2"></i>My List
            </button>
            <button className="netflix-btn-secondary">
              <i className="fas fa-thumbs-up mr-2"></i>Like
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {showVideo && (
                <div className="video-player">
                  <iframe 
                    src={loadVideo()}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={`${title} Episode ${currentEpisode}`}
                  />
                </div>
              )}
              
              <h3 className="text-xl font-semibold mb-3">Episodes</h3>
              <div className="episode-grid">
                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(episodeNum => (
                  <button
                    key={episodeNum}
                    className={`episode-btn ${currentEpisode === episodeNum ? 'active' : ''}`}
                    onClick={() => selectEpisode(episodeNum)}
                  >
                    {episodeNum}
                  </button>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-6">Servers</h3>
              <div className="server-grid">
                {servers.map((server, index) => (
                  <button
                    key={server.id}
                    className={`server-btn ${currentServer === server.id ? 'active' : ''}`}
                    onClick={() => selectServer(server.id)}
                  >
                    {server.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400">Genres: </span>
                  <span>{anime.genres?.join(', ') || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status: </span>
                  <span>{anime.status || 'Unknown'}</span>
                </div>

                <div>
                  <span className="text-gray-400">Rating: </span>
                  <span>{anime.averageScore ? (anime.averageScore / 10).toFixed(1) + '/10' : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeModal;