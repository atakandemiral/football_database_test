import React, { useState, useMemo } from 'react';
import { Filter as FilterIcon, ChevronDown, X } from 'lucide-react';
import _ from 'lodash';

export const FilterSystem = ({ players, onFilteredPlayersChange }) => {
  const [filters, setFilters] = useState({
    position: [],
    age: { min: '', max: '' },
    country: [],
    value: { min: '', max: '' }
  });
  
  const [isOpen, setIsOpen] = useState(false);

  // Mevcut verilerdeki benzersiz değerleri al
  const uniqueValues = useMemo(() => ({
    positions: _.uniq(players.map(p => p.position)).sort(),
    countries: _.uniq(players.map(p => p.nationality)).sort(),
  }), [players]);

  // Değer formatını sayıya çevir (örn: "10M €" -> 10000000)
  const parseValue = (valueStr) => {
    if (!valueStr) return 0;
    const num = parseFloat(valueStr.replace(/[^0-9.,]/g, ''));
    if (valueStr.includes('M')) return num * 1000000;
    if (valueStr.includes('K')) return num * 1000;
    return num;
  };

  // Filtreleme mantığı
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      // Pozisyon filtresi
      if (filters.position.length > 0 && !filters.position.includes(player.position)) {
        return false;
      }

      // Yaş filtresi
      const age = parseInt(player.age);
      if (filters.age.min && age < parseInt(filters.age.min)) return false;
      if (filters.age.max && age > parseInt(filters.age.max)) return false;

      // Ülke filtresi
      if (filters.country.length > 0 && !filters.country.includes(player.nationality)) {
        return false;
      }

      // Bonservis değeri filtresi
      const value = parseValue(player.value);
      if (filters.value.min && value < parseValue(filters.value.min + 'M')) return false;
      if (filters.value.max && value > parseValue(filters.value.max + 'M')) return false;

      return true;
    });
  }, [filters, players]);

  // Filtreleme değişikliklerini üst bileşene bildir
  React.useEffect(() => {
    onFilteredPlayersChange(filteredPlayers);
  }, [filteredPlayers, onFilteredPlayersChange]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
      >
        <FilterIcon size={20} />
        Filtrele
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-white border rounded-lg shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            {/* Pozisyon Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon</label>
              <select
                multiple
                className="w-full p-2 border rounded"
                value={filters.position}
                onChange={(e) => handleFilterChange('position', 
                  Array.from(e.target.selectedOptions, option => option.value)
                )}
              >
                {uniqueValues.positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* Yaş Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yaş Aralığı</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-1/2 p-2 border rounded"
                  value={filters.age.min}
                  onChange={(e) => handleFilterChange('age', { ...filters.age, min: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-1/2 p-2 border rounded"
                  value={filters.age.max}
                  onChange={(e) => handleFilterChange('age', { ...filters.age, max: e.target.value })}
                />
              </div>
            </div>

            {/* Ülke Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ülke</label>
              <select
                multiple
                className="w-full p-2 border rounded"
                value={filters.country}
                onChange={(e) => handleFilterChange('country',
                  Array.from(e.target.selectedOptions, option => option.value)
                )}
              >
                {uniqueValues.countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Bonservis Değeri Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonservis Değeri (M€)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-1/2 p-2 border rounded"
                  value={filters.value.min}
                  onChange={(e) => handleFilterChange('value', { ...filters.value, min: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-1/2 p-2 border rounded"
                  value={filters.value.max}
                  onChange={(e) => handleFilterChange('value', { ...filters.value, max: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Aktif Filtreler */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {filters.position.map(pos => (
                <FilterTag
                  key={pos}
                  label={`Pozisyon: ${pos}`}
                  onRemove={() => handleFilterChange('position', 
                    filters.position.filter(p => p !== pos)
                  )}
                />
              ))}
              {filters.country.map(country => (
                <FilterTag
                  key={country}
                  label={`Ülke: ${country}`}
                  onRemove={() => handleFilterChange('country',
                    filters.country.filter(c => c !== country)
                  )}
                />
              ))}
              {(filters.age.min || filters.age.max) && (
                <FilterTag
                  label={`Yaş: ${filters.age.min || '0'}-${filters.age.max || '∞'}`}
                  onRemove={() => handleFilterChange('age', { min: '', max: '' })}
                />
              )}
              {(filters.value.min || filters.value.max) && (
                <FilterTag
                  label={`Değer: ${filters.value.min || '0'}M€-${filters.value.max || '∞'}M€`}
                  onRemove={() => handleFilterChange('value', { min: '', max: '' })}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Aktif filtre etiketi bileşeni
const FilterTag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
    {label}
    <button onClick={onRemove} className="hover:bg-blue-200 rounded-full p-0.5">
      <X size={14} />
    </button>
  </span>
);
