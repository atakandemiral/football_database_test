class StorageService {
  constructor() {
    this.baseUrl = '/api/storage';
    this.localStorageKeys = {
      favorites: 'football_app_favorites',
      teamFormation: 'football_app_formation',
      preferences: 'football_app_preferences'
    };
  }

  // Favori oyuncular için metodlar
  async getFavorites(userId) {
    // Önce yerel storage'dan al
    const localFavorites = this.getLocalData(this.localStorageKeys.favorites);
    
    try {
      // Sunucudan en güncel veriyi al
      const response = await fetch(`${this.baseUrl}/favorites/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch favorites');
      
      const serverFavorites = await response.json();
      // Yerel storage'ı güncelle
      this.setLocalData(this.localStorageKeys.favorites, serverFavorites);
      return serverFavorites;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Sunucu hatası durumunda yerel veriyi kullan
      return localFavorites || [];
    }
  }

  async addFavorite(userId, player) {
    // Önce yerel storage'ı güncelle
    const currentFavorites = this.getLocalData(this.localStorageKeys.favorites) || [];
    const updatedFavorites = [...currentFavorites, player];
    this.setLocalData(this.localStorageKeys.favorites, updatedFavorites);

    try {
      // Sonra sunucuya gönder
      const response = await fetch(`${this.baseUrl}/favorites/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ player })
      });

      if (!response.ok) throw new Error('Failed to add favorite');
      return updatedFavorites;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return updatedFavorites;
    }
  }

  async removeFavorite(userId, playerId) {
    // Önce yerel storage'ı güncelle
    const currentFavorites = this.getLocalData(this.localStorageKeys.favorites) || [];
    const updatedFavorites = currentFavorites.filter(p => p.id !== playerId);
    this.setLocalData(this.localStorageKeys.favorites, updatedFavorites);

    try {
      // Sonra sunucudan sil
      const response = await fetch(`${this.baseUrl}/favorites/${userId}/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to remove favorite');
      return updatedFavorites;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return updatedFavorites;
    }
  }

  // Takım dizilişi için metodlar
  async getTeamFormation(userId) {
    const localFormation = this.getLocalData(this.localStorageKeys.teamFormation);
    
    try {
      const response = await fetch(`${this.baseUrl}/formation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch formation');
      
      const serverFormation = await response.json();
      this.setLocalData(this.localStorageKeys.teamFormation, serverFormation);
      return serverFormation;
    } catch (error) {
      console.error('Error fetching formation:', error);
      return localFormation || { players: {} };
    }
  }

  async saveTeamFormation(userId, formation) {
    this.setLocalData(this.localStorageKeys.teamFormation, formation);

    try {
      const response = await fetch(`${this.baseUrl}/formation/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(formation)
      });

      if (!response.ok) throw new Error('Failed to save formation');
      return formation;
    } catch (error) {
      console.error('Error saving formation:', error);
      return formation;
    }
  }

  // Yerel storage yardımcı metodları
  getLocalData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  setLocalData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  // Veri senkronizasyonu
  async syncData(userId) {
    try {
      await Promise.all([
        this.getFavorites(userId),
        this.getTeamFormation(userId)
      ]);
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  }
}

export const storageService = new StorageService();
