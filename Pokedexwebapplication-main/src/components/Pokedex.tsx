// src/components/Pokedex.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    userEmail: string;
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
    
    // Core State
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedGen, setSelectedGen] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [offset, setOffset] = useState(0);
    const limit = 24;
    
    // UI Refs & State
    const searchInputRef = useRef<HTMLInputElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const currentHash = window.location.hash;

    // Capture State
    const [captured, setCaptured] = useState<Set<number>>(new Set());
    const [captureError, setCaptureError] = useState<string | null>(null);

    // Derived user info
    const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
    const userDisplayName = userEmail ? userEmail.split('@')[0] : 'Trainer';

    // 1. Debounce Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setOffset(0);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Capture Sync Logic (Robust version from dev-frontend)
    useEffect(() => {
        let isMounted = true;
        const loadCaptured = async () => {
            if (!isAuthenticated) return;
            try {
                const ids = await captureService.getCaptures();
                if (isMounted) {
                    setCaptured(new Set(ids));
                    localStorage.setItem('capturedPokemon', JSON.stringify(ids));
                }
            } catch (err) {
                console.error('Sync failed', err);
                setCaptureError('Failed to sync captures.');
            }
        };
        loadCaptured();
        return () => { isMounted = false };
    }, [isAuthenticated]);

    // 3. Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const genNum = selectedGen !== 'all' ? parseInt(selectedGen) : undefined;
                const typeStr = selectedType !== 'all' ? selectedType : undefined;
                
                const response = await pokemonService.getList(
                    offset, limit, genNum, typeStr, debouncedSearch
                );
                setPokemon(response.items || response);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load Pokemon.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [offset, selectedGen, selectedType, debouncedSearch, retryCount]);

    // ... Toggle Capture Logic, Handlers ...

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* Header implementation would follow, combining the search clear button 
                and the AnimatePresence profile dropdown */}
        </div>
    );
};