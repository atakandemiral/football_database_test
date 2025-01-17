import React, { useState, useEffect } from 'react';
import { Search, Star, Users, Loader, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from './services/authService';
import { playerService } from './services/playerService';
import { storageService } from './services/storageService';
import { FilterSystem } from './components/FilterSystem';
import { TeamBuilder } from './components/TeamBuilder';

const FootballApp = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [searchType, setSearchType] = useState('name');

  // Uygulama başladığında mevcut kullanıcıyı kontrol et
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          setIsLoading(true);
          await storageService.syncData(user.id);
          const userFavorites = await storageService.getFavorites(user.id);
          setFavorites(userFavorites);
        } catch (error) {
          console.error('Error loading user data:', error);
          setError('Kullanıcı verileri yüklenirken bir hata oluştu');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserData();
  }, [user]);

  const handleAddFavorite = async (player) => {
    try {
      const updatedFavorites = await storageService.addFavorite(user.id, player);
      setFavorites(updatedFavorites);
    } catch (error) {
      setError('Favori eklenirken bir hata oluştu');
    }
  };

  const handleRemoveFavorite = async (playerId) => {
    try {
      const updatedFavorites = await storageService.removeFavorite(user.id, playerId);
      setFavorites(updatedFavorites);
    } catch (error) {
      setError('Favori kaldırılırken bir hata oluştu');
    }
  };

  const SearchSection = () => {
    return (
      <div className="p-4">
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <button
              className={`px-4 py-2 rounded ${searchType === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setSearchType('name')}
            >
              İsim ile Ara
            </button>
            <button
              className={`px-4 py-2 rounded ${searchType === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setSearchType('url')}
            >
              Link ile Ara
            </button>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder={searchType === 'name' ? "Futbolcu ara..." : "Transfermarkt oyuncu linki yapıştır..."}
              className="flex-1 p-2 border rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  setError(null);
                  const results = await playerService.searchPlayers(searchQuery);
                  setSearchResults(Array.isArray(results) ? results : [results]);
                } catch (err) {
                  setError(err.message || 'Arama sırasında bir hata oluştu');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? 'Aranıyor...' : <Search size={20} />}
            </button>
          </div>
          
          {searchType === 'url' && (
            <p className="mt-2 text-sm text-gray-600">
              Örnek link: https://www.transfermarkt.com.tr/erling-haaland/profil/spieler/418560
            </p>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {searchResults.map(player => (
            <div key={player.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{player.name}</h3>
                  <p className="text-gray-600">{player.position}</p>
                  <p className="text-gray-600">{player.age} yaş • {player.nationality}</p>
                  <p className="text-green-600 font-semibold mt-1">{player.value}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddFavorite(player)}
                    className="p-2 border rounded hover:bg-gray-100"
                    disabled={favorites.some(f => f.id === player.id)}
                  >
                    <Star
                      size={20}
                      className={favorites.some(f => f.id === player.id) ? 'fill-yellow-400 text-yellow-400' : ''}
                    />
                  </button>
                  <button className="p-2 border rounded hover:bg-gray-100">
                    Benzer Oyuncular
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FavoritesSection = () => {
    const [filteredPlayers, setFilteredPlayers] = useState(favorites);
    
    return (
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Favoriler</h2>
          
          {favorites.length > 0 ? (
            <>
              <FilterSystem
                players={favorites}
                onFilteredPlayersChange={setFilteredPlayers}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.map(player => (
                  <div key={player.id} className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{player.name}</h3>
                        <p className="text-sm text-gray-600">{player.position}</p>
                        <p className="text-sm text-gray-600">{player.age} yaş • {player.nationality}</p>
                        <p className="text-green-600 font-semibold mt-1">{player.value}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite(player.id)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Alert className="mb-4">
              <AlertDescription>
                Henüz favori oyuncunuz bulunmuyor. Arama yaparak oyuncuları favorilerinize ekleyebilirsiniz.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  };

  const TeamSection = () => (
    <TeamBuilder favoritePlayers={favorites} />
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="flex justify-between items-center border-b p-4">
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 ${activeTab === 'search' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search className="inline-block mr-2" size={20} />
            Ara
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'favorites' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Star className="inline-block mr-2" size={20} />
            Favoriler
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'team' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <Users className="inline-block mr-2" size={20} />
            Takımım
          </button>
        </div>
      </nav>

      {activeTab === 'search' && <SearchSection />}
      {activeTab === 'favorites' && <FavoritesSection />}
      {activeTab === 'team' && <TeamSection />}
    </div>
  );
};

export default FootballApp;
