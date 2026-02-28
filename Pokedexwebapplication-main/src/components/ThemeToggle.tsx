import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const getSystemTheme = (): Theme => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const getStoredTheme = (): Theme | null => {
    try {
        return (localStorage.getItem('theme') as Theme | null) ?? null;
    } catch {
        return null;
    }
};

const saveTheme = (theme: Theme) => {
    try {
        localStorage.setItem('theme', theme);
    } catch {
        /* ignore */
    }
};

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => getStoredTheme() ?? getSystemTheme());

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        saveTheme(theme);
    }, [theme]);

    useEffect(() => {
        const stored = getStoredTheme();
        if (stored) return;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = () => setTheme(media.matches ? 'dark' : 'light');
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, []);

    const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
    );
}