import React from 'react';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Recommendations: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/pokedex')}
                    className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Pokedex
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lightbulb className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Pokemon Recommendations
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        This feature is currently under development. Soon you will receive personalized suggestions for your next Pokemon catch!
                    </p>
                </div>
            </div>
        </div>
    );
};