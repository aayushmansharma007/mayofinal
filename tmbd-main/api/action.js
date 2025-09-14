export default async function handler(req, res) {
  try {
    const API_KEY = "a6042a94d5273c9abd084294d505c7b0";
    const url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16,10759&sort_by=vote_average.desc&vote_average.gte=7`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching action anime:', error);
    res.status(500).json({ error: 'Failed to fetch action anime' });
  }
}

