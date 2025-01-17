import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Sürüklenebilir Oyuncu Kartı Bileşeni
const PlayerCard = ({ player, index, position }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'player',
    item: { id: player.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`absolute p-2 bg-white rounded shadow cursor-move
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${position ? 'border-2 border-blue-500' : ''}`}
      style={position ? { left: position.x, top: position.y } : {}}
    >
      <p className="text-sm font-bold">{player.name}</p>
      <p className="text-xs text-gray-600">{player.position}</p>
    </div>
  );
};

// Futbol Sahası Drop Alanı
const DropZone = ({ onDrop, children }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'player',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const dropZone = document.querySelector('.field-container');
      const dropZoneRect = dropZone.getBoundingClientRect();
      
      // Göreceli pozisyonu hesapla
      const x = offset.x - dropZoneRect.left;
      const y = offset.y - dropZoneRect.top;
      
      onDrop(item.id, { x, y });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      className={`field-container relative w-full aspect-[3/2] bg-green-600 rounded-lg
        ${isOver ? 'border-4 border-blue-300' : ''}`}
    >
      {/* Saha çizgileri */}
      <div className="absolute inset-0">
        {/* Orta saha çizgisi */}
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white opacity-70" />
        
        {/* Orta saha dairesi */}
        <div className="absolute left-1/2 top-1/2 w-24 h-24 rounded-full border-2 border-white opacity-70 -translate-x-1/2 -translate-y-1/2" />
        
        {/* Ceza sahaları */}
        <div className="absolute left-0 top-1/4 w-1/6 h-1/2 border-2 border-white opacity-70" />
        <div className="absolute right-0 top-1/4 w-1/6 h-1/2 border-2 border-white opacity-70" />
        
        {/* Kale alanları */}
        <div className="absolute left-0 top-1/3 w-1/12 h-1/3 border-2 border-white opacity-70" />
        <div className="absolute right-0 top-1/3 w-1/12 h-1/3 border-2 border-white opacity-70" />
      </div>

      {children}
    </div>
  );
};

// Ana Takım Kurma Bileşeni
export const TeamBuilder = ({ favoritePlayers }) => {
  const [fieldPlayers, setFieldPlayers] = useState({});

  const handleDrop = (playerId, position) => {
    setFieldPlayers(prev => ({
      ...prev,
      [playerId]: position
    }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Takımımı Kur</h2>
        
        <div className="flex gap-4">
          {/* Sol taraf: Oyuncu listesi */}
          <div className="w-1/4">
            <h3 className="text-lg font-semibold mb-2">Favori Oyuncular</h3>
            <div className="space-y-2">
              {favoritePlayers.map((player, index) => (
                <div key={player.id} className="p-2 bg-white rounded shadow">
                  <PlayerCard
                    player={player}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Sağ taraf: Futbol sahası */}
          <div className="flex-1">
            <DropZone onDrop={handleDrop}>
              {/* Sahaya yerleştirilmiş oyuncular */}
              {Object.entries(fieldPlayers).map(([playerId, position]) => {
                const player = favoritePlayers.find(p => p.id === playerId);
                return player ? (
                  <PlayerCard
                    key={playerId}
                    player={player}
                    position={position}
                  />
                ) : null;
              })}
            </DropZone>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
