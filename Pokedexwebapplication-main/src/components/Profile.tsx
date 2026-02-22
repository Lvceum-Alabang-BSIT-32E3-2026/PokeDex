import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Award, ChevronLeft } from 'lucide-react';

interface ProfileProps {
    email: string;
    onBack: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ email, onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-600 hover:text-red-500 transition-colors mb-8 font-medium"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Pokedex
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200"
                >
                    {/* Cover / Header */}
                    <div className="h-32 bg-red-600 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                    <User className="w-12 h-12 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">Trainer Profile</h1>
                            <p className="text-slate-500">Elite Four Aspirant</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mr-4 text-red-500">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                                        <p className="text-slate-700 font-medium">{email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mr-4 text-blue-500">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Trainer Class</p>
                                        <p className="text-slate-700 font-medium">Pokemon Master</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mr-4 text-amber-500">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Badges Collected</p>
                                        <p className="text-slate-700 font-medium">8 Kanto Badges</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                                    <h3 className="text-red-800 font-bold mb-2">Trainer Tip</h3>
                                    <p className="text-red-600 text-sm">
                                        "Treat your Pokemon with kindness, and they will fight their best for you." - Professor Oak
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
