import React from 'react';
import { Github, Twitter, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 pt-12 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Pokedex</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        The ultimate tool for Pokémon trainers. Catch 'em all and manage your collection with ease.
                    </p>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link to="/pokedex" className="hover:text-red-500 transition-colors">National Dex</Link></li>
                        <li><Link to="/collection" className="hover:text-red-500 transition-colors">My Collection</Link></li>
                        <li><Link to="/recommendations" className="hover:text-red-500 transition-colors">AI Recommendations</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-4">Account</h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link to="/profile" className="hover:text-red-500 transition-colors">My Profile</Link></li>
                        <li><Link to="/login" className="hover:text-red-500 transition-colors">Login</Link></li>
                        <li><Link to="/register" className="hover:text-red-500 transition-colors">Register</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-4">Connect</h3>
                    <div className="flex gap-4">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-red-600 transition-all">
                            <Github size={20} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-red-600 transition-all">
                            <Twitter size={20} />
                        </a>
                        <a href="mailto:contact@pokedex.dev" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-red-600 transition-all">
                            <Mail size={20} />
                        </a>
                        <a href="https://pokedex.dev" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-red-600 transition-all">
                            <Globe size={20} />
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <p>© {new Date().getFullYear()} Pokedex Project. All rights reserved.</p>
                <div className="flex gap-6">
                    <button className="hover:text-slate-300">Privacy Policy</button>
                    <button className="hover:text-slate-300">Terms of Service</button>
                    <button className="hover:text-slate-300">Cookies</button>
                </div>
            </div>
        </footer>
    );
};
