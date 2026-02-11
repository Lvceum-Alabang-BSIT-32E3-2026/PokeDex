import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Award, ArrowLeft } from 'lucide-react';

interface ProfileProps {
  onBack: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  // Placeholder user data
  const user = {
    username: 'Ash Ketchum',
    email: 'ash@ketchum.com',
    joinDate: 'January 2024',
    pokemonCaught: 150,
    badges: 8
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Pokédex
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.username}</h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Mail size={16} />
              {user.email}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Member Since</h3>
              </div>
              <p className="text-gray-600 ml-9">{user.joinDate}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="text-purple-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Pokémon Caught</h3>
              </div>
              <p className="text-gray-600 ml-9">{user.pokemonCaught} Pokémon</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <Award className="text-green-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Badges Earned</h3>
              </div>
              <p className="text-gray-600 ml-9">{user.badges} Gym Badges</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                Edit Profile
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                Privacy Settings
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
