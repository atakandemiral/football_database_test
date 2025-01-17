class PlayerService {
  // Transfermarkt URL'lerini validate etmek için regex
  urlPattern = /^https?:\/\/(www\.)?transfermarkt\.(com|com\.tr)\/.*\/profil\/spieler\/\d+$/;

  validateTransfermarktUrl(url) {
    return this.urlPattern.test(url);
  }

  extractPlayerIdFromUrl(url) {
    const matches = url.match(/\/spieler\/(\d+)$/);
    return matches ? matches[1] : null;
  }

  async searchPlayers(query) {
    // URL kontrolü yap
    if (query.startsWith('http')) {
      if (!this.validateTransfermarktUrl(query)) {
        throw new Error('Geçersiz Transfermarkt URL\'i');
      }
      const playerId = this.extractPlayerIdFromUrl(query);
      return this.getPlayerDetails(playerId);
    }
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      return await response.json();
    } catch (error) {
      console.error('Error searching players:', error);
      throw error;
    }
  }

  async getSimilarPlayers(playerId) {
    try {
      const response = await fetch(`/api/player/${playerId}/similar`);
      if (!response.ok) throw new Error('Failed to fetch similar players');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching similar players:', error);
      throw error;
    }
  }

  async getPlayerDetails(playerId) {
    try {
      const response = await fetch(`/api/player/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch player details');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching player details:', error);
      throw error;
    }
  }
}

export const playerService = new PlayerService();
