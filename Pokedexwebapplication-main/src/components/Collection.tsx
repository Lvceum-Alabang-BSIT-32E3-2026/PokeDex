import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, Star } from 'lucide-react';

interface CollectionProps {
  onBack: () => void;
}

export const Collection: React.FC<CollectionProps> = ({ onBack }) => {
  // Placeholder collection data
  const collection = [
    { id: 25, name: 'Pikachu', number: 25, type: 'Electric', favorite: true },
    { id: 4, name: 'Charmander', number: 4, type: 'Fire', favorite: true },
    { id: 7, name: 'Squirtle', number: 7, type: 'Water', favorite: false },
    { id: 1, name: 'Bulbasaur', number: 1, type: 'Grass', favorite: false },
  ];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Electric: 'bg-yellow-400',
      Fire: 'bg-red-500',
      Water: 'bg-blue-500',
      Grass: 'bg-green-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Pokédex
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Collection</h1>
            <p className="text-gray-600">Your favorite Pokémon collection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.map((pokemon) => (
              <motion.div
                key={pokemon.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 relative"
              >
                {pokemon.favorite && (
                  <Heart 
                    className="absolute top-4 right-4 text-red-500 fill-red-500" 
                    size={24} 
                  />
                )}
                
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Star className="text-white" size={40} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{pokemon.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">#{pokemon.number.toString().padStart(3, '0')}</p>
                  
                  <span className={`inline-block px-4 py-1 rounded-full text-white text-sm font-semibold ${getTypeColor(pokemon.type)}`}>
                    {pokemon.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {collection.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Your collection is empty</p>
              <p className="text-sm mt-2">Start catching Pokémon to build your collection!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
