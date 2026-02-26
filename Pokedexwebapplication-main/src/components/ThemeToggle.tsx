import { useEffect, useState } from "react";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial theme
        const hasDarkClass = document.body.classList.contains("dark");
        setIsDark(hasDarkClass);
    }, []);

    const toggleTheme = () => {
        document.body.classList.toggle("dark");
        setIsDark(!isDark);
    };

    return (
        <button onClick={toggleTheme} style={{ cursor: "pointer" }}>
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
    );
}