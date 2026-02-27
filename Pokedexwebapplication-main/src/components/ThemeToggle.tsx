import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
    if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }
    return "light";
}

function getStoredTheme(): Theme | null {
    try {
        return localStorage.getItem("theme") as Theme | null;
    } catch {
        return null; // localStorage not available
    }
}

function saveTheme(theme: Theme) {
    try {
        localStorage.setItem("theme", theme);
    } catch {
        // localStorage unavailable — fail silently
    }
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => {
        return getStoredTheme() ?? getSystemTheme();
    });

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        saveTheme(theme);
    }, [theme]);

    // Listen to system preference changes (only if no stored preference)
    useEffect(() => {
        const stored = getStoredTheme();
        if (stored) return;

        const media = window.matchMedia("(prefers-color-scheme: dark)");

        const listener = () => {
            setTheme(media.matches ? "dark" : "light");
        };

        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    return (
        <button onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
    );
}