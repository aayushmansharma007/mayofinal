export default async function handler(req, res) {
  try {
    const API_KEY = "a6042a94d5273c9abd084294d505c7b0";
    
    // Try multiple approaches to get anime content
    const urls = [
      `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&with_genres=16`,
      `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=anime&with_genres=16`,
      `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=japanese&with_genres=16`
    ];
    
    const responses = await Promise.allSettled(
      urls.map(url => fetch(url))
    );
    
    const allResults = [];
    responses.forEach(response => {
      if (response.status === 'fulfilled' && response.value.ok) {
        response.value.json().then(data => {
          if (data.results) {
            allResults.push(...data.results);
          }
        });
      }
    });
    
    // Wait for all JSON parsing to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    res.status(200).json({ results: allResults });
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    res.status(500).json({ error: 'Failed to fetch trending anime' });
  }
}

