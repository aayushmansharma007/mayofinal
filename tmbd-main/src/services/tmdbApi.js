const API_KEY = "a6042a94d5273c9abd084294d505c7b0";
const BASE_URL = "https://api.themoviedb.org/3";

// Bypass methods for India access
const BYPASS_METHODS = {
  // Alternative TMDB endpoints that might work in India
  ALTERNATIVE_ENDPOINTS: [
    "https://api.themoviedb.org/3",
    "https://api.tmdb.org/3", 
    "https://tmdb-api.herokuapp.com/3",
    "https://api.themoviedb.org/3"
  ],
  
  // Proxy servers for bypassing geo-restrictions
  PROXY_SERVERS: [
    "https://cors-anywhere.herokuapp.com/",
    "https://api.allorigins.win/raw?url=",
    "https://thingproxy.freeboard.io/fetch/",
    "https://corsproxy.io/?"
  ],
  
  // DNS-based bypass using different DNS servers
  DNS_BYPASS: {
    google: "8.8.8.8",
    cloudflare: "1.1.1.1", 
    openDNS: "208.67.222.222",
    quad9: "9.9.9.9"
  }
};

// User agents for request spoofing
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0"
];

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 300000; // 5 minutes

// Enhanced fetch function with bypass methods for India
const rateLimitedFetch = async (url, cacheKey) => {
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  // Try multiple bypass methods
  const bypassMethods = [
    // Method 1: Direct request with spoofed headers
    () => fetchWithSpoofedHeaders(url),
    
    // Method 2: Try alternative endpoints
    () => fetchWithAlternativeEndpoints(url),
    
    // Method 3: Use proxy servers
    () => fetchWithProxy(url),
    
    // Method 4: Use CORS proxy
    () => fetchWithCorsProxy(url),
    
    // Method 5: Fallback to original URL
    () => fetch(url)
  ];

  for (let i = 0; i < bypassMethods.length; i++) {
    try {
      console.log(`Trying bypass method ${i + 1} for: ${url}`);
      const response = await bypassMethods[i]();
      
      if (response && response.ok) {
        const data = await response.json();
        cache.set(cacheKey, { data, timestamp: Date.now() });
        console.log(`Success with method ${i + 1}`);
        updateBypassStatus(`Method ${i + 1}`, true);
        return data;
      }
    } catch (error) {
      console.log(`Method ${i + 1} failed:`, error.message);
      updateBypassStatus(`Method ${i + 1}`, false);
      continue;
    }
  }

  throw new Error(`All bypass methods failed for: ${url}`);
};

// Method 1: Fetch with spoofed headers to bypass geo-restrictions
const fetchWithSpoofedHeaders = async (url) => {
  const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  const headers = {
    'User-Agent': randomUserAgent,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
    'X-Forwarded-For': '8.8.8.8', // Spoof IP to appear from US
    'X-Real-IP': '8.8.8.8',
    'CF-IPCountry': 'US', // Cloudflare country header
    'CF-Ray': 'fake-ray-id',
    'X-Forwarded-Proto': 'https'
  };

  return fetch(url, {
    method: 'GET',
    headers: headers,
    mode: 'cors',
    credentials: 'omit'
  });
};

// Method 2: Try alternative TMDB endpoints
const fetchWithAlternativeEndpoints = async (originalUrl) => {
  const urlParts = originalUrl.split('/3/');
  if (urlParts.length < 2) return null;
  
  const endpoint = urlParts[1];
  
  for (const baseUrl of BYPASS_METHODS.ALTERNATIVE_ENDPOINTS) {
    try {
      const newUrl = `${baseUrl}/${endpoint}`;
      const response = await fetch(newUrl, {
        headers: {
          'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
          'Accept': 'application/json',
          'X-Forwarded-For': '8.8.8.8'
        }
      });
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      continue;
    }
  }
  
  return null;
};

// Method 3: Use proxy servers
const fetchWithProxy = async (url) => {
  for (const proxy of BYPASS_METHODS.PROXY_SERVERS) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      continue;
    }
  }
  
  return null;
};

// Method 4: Use CORS proxy with additional headers
const fetchWithCorsProxy = async (url) => {
  const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors-anywhere.herokuapp.com/'
  ];
  
  for (const proxy of corsProxies) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
          'Accept': 'application/json',
          'Origin': 'https://api.themoviedb.org',
          'Referer': 'https://api.themoviedb.org/'
        }
      });
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      continue;
    }
  }
  
  return null;
};

// Method 5: DNS-based bypass utility
const getDNSBypassInstructions = () => {
  return {
    message: "For better TMDB access in India, try changing your DNS settings:",
    instructions: [
      "Windows: Control Panel > Network and Internet > Network Connections > Change adapter settings > Right-click your connection > Properties > Internet Protocol Version 4 (TCP/IPv4) > Properties > Use the following DNS server addresses",
      "Mac: System Preferences > Network > Advanced > DNS > Add DNS servers",
      "Android: Settings > Wi-Fi > Long press your network > Modify network > Advanced options > IP settings > Static > DNS 1 & DNS 2",
      "iOS: Settings > Wi-Fi > (i) next to your network > Configure DNS > Manual > Add servers"
    ],
    recommendedDNS: [
      "Google DNS: 8.8.8.8, 8.8.4.4",
      "Cloudflare DNS: 1.1.1.1, 1.0.0.1", 
      "OpenDNS: 208.67.222.222, 208.67.220.220",
      "Quad9: 9.9.9.9, 149.112.112.112"
    ]
  };
};

// Export DNS bypass instructions for user reference
export const getBypassInstructions = getDNSBypassInstructions;

// Bypass status tracking
let bypassStatus = {
  lastMethod: null,
  successCount: 0,
  failureCount: 0,
  isBlocked: false
};

// Get current bypass status
export const getBypassStatus = () => bypassStatus;

// Update bypass status
const updateBypassStatus = (method, success) => {
  bypassStatus.lastMethod = method;
  if (success) {
    bypassStatus.successCount++;
    bypassStatus.isBlocked = false;
  } else {
    bypassStatus.failureCount++;
    if (bypassStatus.failureCount > 3) {
      bypassStatus.isBlocked = true;
    }
  }
};

// Filter out non-anime content
const filterAnimeContent = (shows) => {
  const animeKeywords = [
    'anime', 'manga', 'japanese', 'japan', 'otaku', 'shounen', 'shoujo', 'seinen', 'josei',
    'mecha', 'isekai', 'slice of life', 'magical girl', 'supernatural', 'fantasy', 'adventure',
    'demon', 'dragon', 'ninja', 'samurai', 'shinobi', 'hero', 'villain', 'magic', 'sword',
    'monster', 'ghost', 'spirit', 'angel', 'devil', 'school', 'high school', 'middle school',
    'club', 'sport', 'music', 'idol', 'cooking', 'food', 'romance', 'love', 'friendship',
    'battle', 'war', 'fight', 'power', 'energy', 'transformation', 'awakening', 'evolution',
    'destiny', 'prophecy', 'chosen one', 'legend', 'myth', 'ancient', 'future', 'space',
    'planet', 'world', 'dimension', 'portal', 'gate', 'summon', 'contract', 'pact'
  ];
  
  const nonAnimeKeywords = [
    'wednesday', 'addams', 'alien', 'terminal list', 'peacemaker', 'summer turned pretty',
    'riverdale', 'stranger things', 'outer banks', 'euphoria', 'bridgerton', 'witcher',
    'game of thrones', 'breaking bad', 'better call saul', 'walking dead', 'rick and morty',
    'office', 'workplace', 'reality tv', 'talk show', 'news', 'documentary', 'crime',
    'police', 'detective', 'lawyer', 'doctor', 'hospital', 'medical', 'legal', 'court',
    'sitcom', 'comedy', 'drama', 'thriller', 'horror', 'romance', 'western', 'historical',
    'biography', 'war', 'sport', 'music', 'variety', 'game show', 'reality', 'documentary',
    'summer', 'turned', 'pretty', 'dexter', 'resurrection', 'runarounds', 'marvel', 'zombies',
    'live action', 'live-action', 'american', 'british', 'european', 'hollywood', 'netflix',
    'hbo', 'amazon', 'disney', 'warner', 'paramount', 'universal', 'sony', 'fox'
  ];

  const filtered = shows.filter(show => {
    const title = (show.name || '').toLowerCase();
    const overview = (show.overview || '').toLowerCase();
    const originalName = (show.original_name || '').toLowerCase();
    
    // Check if it contains non-anime keywords (exclude these)
    const hasNonAnimeKeywords = nonAnimeKeywords.some(keyword => 
      title.includes(keyword) || overview.includes(keyword) || originalName.includes(keyword)
    );
    
    if (hasNonAnimeKeywords) {
      return false;
    }
    
    // Check if it has anime-like characteristics
    const hasAnimeKeywords = animeKeywords.some(keyword => 
      title.includes(keyword) || overview.includes(keyword) || originalName.includes(keyword)
    );
    
    // Check if it's Japanese animation or has anime-like characteristics
    const isJapaneseAnimation = show.origin_country && show.origin_country.includes('JP');
    const hasAnimationGenre = show.genre_ids && show.genre_ids.includes(16);
    
    // Additional checks for anime-like content
    const hasAnimeStyleTitle = /[a-zA-Z]+:\s*[a-zA-Z]+/.test(title) || // Pattern like "Title: Subtitle"
                               /[a-zA-Z]+\s+[a-zA-Z]+/.test(title) || // Multiple word titles
                               /[a-zA-Z]+[0-9]+/.test(title); // Titles with numbers
    
    const hasAnimeStyleOverview = overview.includes('episode') || 
                                 overview.includes('season') || 
                                 overview.includes('series') ||
                                 overview.includes('adventure') ||
                                 overview.includes('journey') ||
                                 overview.includes('quest') ||
                                 overview.includes('battle') ||
                                 overview.includes('power') ||
                                 overview.includes('magic') ||
                                 overview.includes('world') ||
                                 overview.includes('dimension');
    
    // More strict filtering - prioritize Japanese animation and anime-like content
    if (isJapaneseAnimation) {
      return true;
    }
    
    // For non-Japanese content, be extremely strict
    if (hasAnimeKeywords) {
      // Must also pass additional checks
      const hasJapaneseOrigin = originalName.includes('japanese') || 
                               originalName.includes('anime') || 
                               originalName.includes('manga');
      const hasAnimeStyle = hasAnimeStyleTitle || hasAnimeStyleOverview;
      
      if (!hasJapaneseOrigin && !hasAnimeStyle) {
        return false;
      }
    }
    
    // For non-Japanese animation, be extremely strict
    if (hasAnimationGenre) {
      // Must have multiple anime-like characteristics AND be clearly anime
      const characteristics = [hasAnimeStyleTitle, hasAnimeStyleOverview, hasAnimeKeywords];
      const characteristicCount = characteristics.filter(Boolean).length;
      
      // Must have at least 3 characteristics and be clearly anime
      if (characteristicCount < 3) return false;
      
      // Additional check: must not look like western animation
      const looksLikeWesternAnimation = title.includes('marvel') || 
                                       title.includes('dc') || 
                                       title.includes('disney') || 
                                       title.includes('pixar') || 
                                       title.includes('dreamworks') ||
                                       title.includes('netflix') ||
                                       title.includes('hbo') ||
                                       title.includes('amazon');
      
      if (looksLikeWesternAnimation) return false;
      
      return !hasNonAnimeKeywords;
    }
    
    return false;
  });
  
  return filtered;
};

// Transform TMDB TV show to anime-like format
const transformTMDBToAnime = (show) => ({
  id: show.id,
  title: {
    english: show.name,
    romaji: show.original_name,
    native: show.original_name
  },
  coverImage: {
    extraLarge: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
    large: show.poster_path ? `https://image.tmdb.org/t/p/w342${show.poster_path}` : null,
    medium: show.poster_path ? `https://image.tmdb.org/t/p/w185${show.poster_path}` : null
  },
  bannerImage: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null,
  description: show.overview,
  episodes: show.number_of_episodes || null,
  status: show.status === 'Ended' ? 'FINISHED' : 'RELEASING',
  genres: show.genre_ids?.map(id => getGenreName(id)) || show.genres?.map(g => g.name) || [],
  averageScore: show.vote_average ? Math.round(show.vote_average * 10) : null,
  popularity: show.popularity,
  startDate: {
    year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
  }
});

// Genre mapping for TMDB
const genreMap = {
  16: 'Animation',
  10759: 'Action & Adventure',
  35: 'Comedy',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  9648: 'Mystery',
  10765: 'Sci-Fi & Fantasy',
  10762: 'Kids',
  10764: 'Reality',
  10767: 'Talk'
};

const getGenreName = (id) => genreMap[id] || 'Unknown';

// Fetch detailed anime information including episode count
const fetchAnimeDetails = async (animeId) => {
  try {
    const url = `${BASE_URL}/tv/${animeId}?api_key=${API_KEY}`;
    const data = await rateLimitedFetch(url, `details_${animeId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching details for anime ${animeId}:`, error);
    return null;
  }
};

// Enhanced transform function that includes detailed episode information
const transformTMDBToAnimeWithDetails = async (show) => {
  const baseAnime = transformTMDBToAnime(show);
  
  // If we already have episode count, return as is
  if (show.number_of_episodes) {
    return baseAnime;
  }
  
  // Fetch detailed information to get episode count
  try {
    const details = await fetchAnimeDetails(show.id);
    if (details && details.number_of_episodes) {
      baseAnime.episodes = details.number_of_episodes;
    } else {
      // Try to get episode count from seasons
      if (details && details.seasons && details.seasons.length > 0) {
        let totalEpisodes = 0;
        for (const season of details.seasons) {
          if (season.episode_count) {
            totalEpisodes += season.episode_count;
          }
        }
        if (totalEpisodes > 0) {
          baseAnime.episodes = totalEpisodes;
        }
      }
    }
  } catch (error) {
    console.error(`Failed to fetch episode details for ${show.name}:`, error);
  }
  
  return baseAnime;
};

// Fetch anime by different categories with better filtering
export const fetchTrendingAnime = async () => {
  // Try multiple approaches to get anime content
  const urls = [
    `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&with_genres=16`,
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=anime&with_genres=16`,
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=japanese&with_genres=16`
  ];
  
  try {
    const responses = await Promise.allSettled(
      urls.map(url => rateLimitedFetch(url, `trending_${url.split('?')[1]}`))
    );
    
    const allResults = [];
    responses.forEach(response => {
      if (response.status === 'fulfilled' && response.value.results) {
        allResults.push(...response.value.results);
      }
    });
    
    const filteredShows = filterAnimeContent(allResults);
    
    // Transform shows with detailed episode information
    const animeWithDetails = await Promise.allSettled(
      filteredShows.map(show => transformTMDBToAnimeWithDetails(show))
    );
    
    return animeWithDetails
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    return [];
  }
};

export const fetchPopularAnime = async () => {
  // Try multiple approaches to get anime content
  const urls = [
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&sort_by=popularity.desc&vote_average.gte=7`,
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=popular anime&with_genres=16`,
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=best anime&with_genres=16`
  ];
  
  try {
    const responses = await Promise.allSettled(
      urls.map(url => rateLimitedFetch(url, `popular_${url.split('?')[1]}`))
    );
    
    const allResults = [];
    responses.forEach(response => {
      if (response.status === 'fulfilled' && response.value.results) {
        allResults.push(...response.value.results);
      }
    });
    
    const filteredShows = filterAnimeContent(allResults);
    
    // Transform shows with detailed episode information
    const animeWithDetails = await Promise.allSettled(
      filteredShows.map(show => transformTMDBToAnimeWithDetails(show))
    );
    
    return animeWithDetails
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  } catch (error) {
    console.error('Error fetching popular anime:', error);
    return [];
  }
};

export const fetchActionAnime = async () => {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16,10759&sort_by=vote_average.desc&vote_average.gte=7`;
  const data = await rateLimitedFetch(url, 'action_anime');
  const filteredShows = filterAnimeContent(data.results || []);
  
  const animeWithDetails = await Promise.allSettled(
    filteredShows.map(show => transformTMDBToAnimeWithDetails(show))
  );
  
  return animeWithDetails
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
};

export const fetchLatestAnime = async () => {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&sort_by=first_air_date.desc&first_air_date.gte=${new Date().getFullYear()}-01-01`;
  const data = await rateLimitedFetch(url, 'latest_anime');
  const filteredShows = filterAnimeContent(data.results || []);
  
  const animeWithDetails = await Promise.allSettled(
    filteredShows.map(show => transformTMDBToAnimeWithDetails(show))
  );
  
  return animeWithDetails
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
};

export const fetchUpcomingAnime = async () => {
  const nextYear = new Date().getFullYear() + 1;
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&sort_by=popularity.desc&first_air_date.gte=${nextYear}-01-01`;
  const data = await rateLimitedFetch(url, 'upcoming_anime');
  const filteredShows = filterAnimeContent(data.results || []);
  
  const animeWithDetails = await Promise.allSettled(
    filteredShows.map(show => transformTMDBToAnimeWithDetails(show))
  );
  
  return animeWithDetails
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
};

export const fetchAdultContent = async () => {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&sort_by=popularity.desc&include_adult=true`;
  const data = await rateLimitedFetch(url, 'adult_anime');
  const filteredShows = filterAnimeContent(data.results || []);
  return filteredShows.map(transformTMDBToAnime);
};

// Search anime with better filtering
export const searchAnime = async (query) => {
  const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&with_genres=16`;
  const data = await rateLimitedFetch(url, `search_${query}`);
  const filteredShows = filterAnimeContent(data.results || []);
  
  const animeWithDetails = await Promise.allSettled(
    filteredShows.map(show => transformTMDBToAnimeWithDetails(show))
  );
  
  return animeWithDetails
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
};

// Fallback function to ensure we have anime content
export const fetchFallbackAnime = async () => {
  // Try to get more anime by using different genre combinations
  const urls = [
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16,14&sort_by=popularity.desc`, // Animation + Fantasy
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16,10765&sort_by=popularity.desc`, // Animation + Sci-Fi
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16,18&sort_by=popularity.desc`, // Animation + Drama
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16,35&sort_by=popularity.desc` // Animation + Comedy
  ];
  
  try {
    const responses = await Promise.allSettled(
      urls.map(url => rateLimitedFetch(url, `fallback_${url.split('?')[1]}`))
    );
    
    const allResults = [];
    responses.forEach(response => {
      if (response.status === 'fulfilled' && response.value.results) {
        allResults.push(...response.value.results);
      }
    });
    
    const filteredShows = filterAnimeContent(allResults);
    
    // If we still don't have enough content, add some known anime keywords to search
    if (filteredShows.length < 5) {
      const animeSearchTerms = ['anime', 'manga', 'japanese animation', 'shounen', 'mecha'];
      const searchPromises = animeSearchTerms.map(term => 
        rateLimitedFetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(term)}&with_genres=16`, `search_${term}`)
      );
      
      try {
        const searchResponses = await Promise.allSettled(searchPromises);
        searchResponses.forEach(response => {
          if (response.status === 'fulfilled' && response.value.results) {
            allResults.push(...response.value.results);
          }
        });
        
        const additionalFiltered = filterAnimeContent(allResults);
        return additionalFiltered.map(transformTMDBToAnime);
      } catch (searchError) {
        console.error('Error in additional anime search:', searchError);
      }
    }
    
    return filteredShows.map(transformTMDBToAnime);
  } catch (error) {
    console.error('Error fetching fallback anime:', error);
    return [];
  }
};

// Fetch episodes for a specific anime
export const fetchEpisodes = async (animeId) => {
  try {
    // Get TV show details first
    const showUrl = `${BASE_URL}/tv/${animeId}?api_key=${API_KEY}`;
    const showData = await rateLimitedFetch(showUrl, `show_${animeId}`);
    
    const episodeCount = showData.number_of_episodes || null;
    const seasons = showData.number_of_seasons || 1;
    
    // Generate episodes based on seasons
    const episodes = [];
    for (let season = 1; season <= seasons; season++) {
      try {
        const seasonUrl = `${BASE_URL}/tv/${animeId}/season/${season}?api_key=${API_KEY}`;
        const seasonData = await rateLimitedFetch(seasonUrl, `season_${animeId}_${season}`);
        
        seasonData.episodes?.forEach((episode, index) => {
          const minutes = Math.floor(Math.random() * 5) + 20;
          const seconds = Math.floor(Math.random() * 60);
          const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          episodes.push({
            episodeNumber: episodes.length + 1,
            title: episode.name || `Episode ${episodes.length + 1}`,
            thumbnail: episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : showData.backdrop_path ? `https://image.tmdb.org/t/p/w300${showData.backdrop_path}` : null,
            duration: duration,
            views: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}M views`,
            uploadDate: `${Math.floor(Math.random() * 30) + 1} days ago`,
            season: season,
            episode: episode.episode_number
          });
        });
      } catch (error) {
        console.error(`Error fetching season ${season}:`, error);
      }
    }
    
    // If no episodes found, generate default episodes
    if (episodes.length === 0 && episodeCount) {
      return Array.from({ length: episodeCount }, (_, i) => {
        const minutes = Math.floor(Math.random() * 5) + 20;
        const seconds = Math.floor(Math.random() * 60);
        const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        return {
          episodeNumber: i + 1,
          title: `Episode ${i + 1}`,
          thumbnail: showData.backdrop_path ? `https://image.tmdb.org/t/p/w300${showData.backdrop_path}` : null,
          duration: duration,
          views: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}M views`,
          uploadDate: `${Math.floor(Math.random() * 30) + 1} days ago`,
          season: 1,
          episode: i + 1
        };
      });
    }
    
    return episodes;
  } catch (error) {
    console.error('Error fetching episodes:', error);
    // Return empty array if we can't fetch episodes
    return [];
  }
};

// Get video URLs for different servers
export const getVideoUrl = (animeId, season, episode, serverType = 'sub') => {
  const baseParams = `id=${animeId}&season=${season}&episode=${episode}&t=${Date.now()}`;
  
  switch (serverType) {
    case 'sub1':
      return `https://api.cinepapa.com/TA/?id=${animeId}&season=${season}&episode=${episode}`;
    case 'hindi':
    case 'multi':
      return `https://api.flixindia.xyz/anime/${animeId}/${season}/${episode}`;
    case 'sub':
    case 'dub':
    default:
      return `https://api.cinepapa.com/TA/?id=${animeId}&season=${season}&episode=${episode}`;
  }
};

// Get fallback video URL when primary fails
export const getFallbackVideoUrl = (animeId, season, episode, serverType = 'sub') => {
  const baseParams = `id=${animeId}&season=${season}&episode=${episode}&t=${Date.now()}&fallback=true`;
  
  switch (serverType) {
    case 'sub1':
      return `https://api.cinepapa.com/TA/?id=${animeId}&season=${season}&episode=${episode}&fallback=true`;
    case 'hindi':
    case 'multi':
      return `https://api.flixindia.xyz/anime/${animeId}/${season}/${episode}?fallback=true`;
    case 'sub':
    case 'dub':
    default:
      return `https://api.cinepapa.com/TA/?id=${animeId}&season=${season}&episode=${episode}&fallback=true`;
  }
};

// Manual fallback with popular anime titles if API fails completely
export const getManualFallbackAnime = () => {
  const fallbackAnime = [
    {
      id: 'fallback_1',
      title: {
        english: 'Dragon Ball Z',
        romaji: 'Dragon Ball Z',
        native: 'ドラゴンボールZ'
      },
      coverImage: {
        extraLarge: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
        large: 'https://image.tmdb.org/t/p/w342/placeholder.jpg',
        medium: 'https://image.tmdb.org/t/p/w185/placeholder.jpg'
      },
      bannerImage: null,
      description: 'The adventures of Goku and his friends as they protect Earth from various threats.',
      episodes: 291,
      status: 'FINISHED',
      genres: ['Action', 'Adventure', 'Fantasy'],
      averageScore: 85,
      popularity: 100,
      startDate: { year: 1989 }
    },
    {
      id: 'fallback_2',
      title: {
        english: 'Naruto',
        romaji: 'Naruto',
        native: 'ナルト'
      },
      coverImage: {
        extraLarge: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
        large: 'https://image.tmdb.org/t/p/w342/placeholder.jpg',
        medium: 'https://image.tmdb.org/t/p/w185/placeholder.jpg'
      },
      bannerImage: null,
      description: 'A young ninja seeks to become the strongest ninja in his village.',
      episodes: 220,
      status: 'FINISHED',
      genres: ['Action', 'Adventure', 'Fantasy'],
      averageScore: 82,
      popularity: 95,
      startDate: { year: 2002 }
    },
    {
      id: 'fallback_3',
      title: {
        english: 'One Piece',
        romaji: 'One Piece',
        native: 'ワンピース'
      },
      coverImage: {
        extraLarge: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
        large: 'https://image.tmdb.org/t/p/w342/placeholder.jpg',
        medium: 'https://image.tmdb.org/t/p/w185/placeholder.jpg'
      },
      bannerImage: null,
      description: 'A pirate crew searches for the ultimate treasure in a world of adventure.',
      episodes: 1000,
      status: 'RELEASING',
      genres: ['Action', 'Adventure', 'Comedy'],
      averageScore: 88,
      popularity: 98,
      startDate: { year: 1999 }
    }
  ];
  
  return fallbackAnime;
};