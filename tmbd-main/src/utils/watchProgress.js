export const saveWatchProgress = (animeId, episode, timestamp = 0) => {
  const watchHistory = getWatchHistory();
  const animeKey = `anime_${animeId}`;
  
  watchHistory[animeKey] = {
    animeId,
    episode,
    timestamp,
    lastWatched: Date.now()
  };
  
  localStorage.setItem('animeWatchHistory', JSON.stringify(watchHistory));
};

export const getWatchProgress = (animeId) => {
  const watchHistory = getWatchHistory();
  return watchHistory[`anime_${animeId}`] || null;
};

export const getWatchHistory = () => {
  return JSON.parse(localStorage.getItem('animeWatchHistory') || '{}');
};

export const getRecentlyWatched = (limit = 10) => {
  const watchHistory = getWatchHistory();
  return Object.values(watchHistory)
    .sort((a, b) => b.lastWatched - a.lastWatched)
    .slice(0, limit);
};