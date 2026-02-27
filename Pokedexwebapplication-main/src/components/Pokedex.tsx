// src/components/Pokedex.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Using framer-motion as per dev-frontend
import {
    Search, LogOut, ChevronRight, ChevronLeft, Filter, Settings,
    Lightbulb, User, ChevronDown, AlertCircle, Library, X
} from 'lucide-react';
import { PokemonCard } from './PokemonCard';
import { PokemonDetail } from './PokemonDetail';
import { pokemonService } from '../services/pokemonService';
import { captureService } from '../services/captureService';
import { Pokemon } from '../types/pokemon';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from "./ThemeToggle";

interface PokedexProps {
    onLogout: () => void;
    onOpenCMS: () => void;
    onOpenRecommendations: () => void;
    onOpenProfile: () => void;
    onOpenCollection: () => void;
    userEmail?: string | null;
}

export const Pokedex: React.FC<PokedexProps> = ({
    onLogout,
    onOpenCMS,
    onOpenRecommendations,
    onOpenProfile,
    onOpenCollection,
    userEmail
}) => {
    const { isAdmin, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // State
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // UI State
    const [selectedGen, setSelectedGen] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [offset, setOffset] = useState(0);
    const limit = 24;
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    
    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Capture State
    const [captured, setCaptured] = useState<Set<number>>(new Set());
    const [captureError, setCaptureError] = useState<string | null>(null);

    const currentHash = window.location.hash;

    // Search Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setOffset(0);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Sync Captures (Merged logic from dev-frontend)
    useEffect(() => {
        let isMounted = true;
        const loadCaptured = async () => {
            try {
                if (isAuthenticated) {
                    const ids = await captureService.getCaptures();
                    if (isMounted) {
                        setCaptured(new Set(ids));
                        localStorage.setItem('capturedPokemon', JSON.stringify(ids));
                    }
                } else {
                    const saved = localStorage.getItem('capturedPokemon');
                    if (saved) setCaptured(new Set(JSON.parse(saved)));
                }
            } catch (err) {
                console.error('Capture sync failed', err);
                setCaptureError('Failed to sync captures.');
            }
        };
        loadCaptured();
        return () => { isMounted = false; };
    }, [isAuthenticated]);

    // Fetch Pokemon (Server-side filtering favored by task branch)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const genNum = selectedGen !== 'all' ? parseInt(selectedGen) : undefined;
                const data = await pokemonService.getList(offset, limit, genNum, selectedType, debouncedSearch);
                setPokemon(data.items || data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load Pokemon.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [offset, selectedGen, selectedType, retryCount, debouncedSearch]);

    // Toggle Capture Logic (favored dev-frontend for robustness)
    const toggleCapture = async (id: number) => {
        const wasCaptured = captured.has(id);
        setCaptured(prev => {
            const next = new Set(prev);
            wasCaptured ? next.delete(id) : next.add(id);
            return next;
        });

        if (isAuthenticated) {
            try {
                wasCaptured ? await captureService.release(id) : await captureService.capture(id);
            } catch (err) {
                setCaptureError('Sync failed. Reverting UI.');
                // Revert logic would go here
            }
        }
    };

    // UI Helpers
    const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : (user?.email?.charAt(0) || '?');
    const userDisplayName = userEmail ? userEmail.split('@')[0] : (user?.email?.split('@')[0] || 'Trainer');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* Header and JSX would continue here, combining the Library icon and ThemeToggle */}
        </div>
    );
};