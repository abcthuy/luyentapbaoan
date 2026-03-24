"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getServerTheme(): Theme {
    return "light";
}

function getClientTheme(): Theme {
    if (typeof window === "undefined") {
        return "light";
    }

    const savedTheme = localStorage.getItem("math_mastery_theme") as Theme | null;
    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribeToThemeChange(onStoreChange: () => void) {
    if (typeof window === "undefined") {
        return () => {};
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => onStoreChange();
    const handleStorage = (event: StorageEvent) => {
        if (!event.key || event.key === "math_mastery_theme") {
            onStoreChange();
        }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("math-mastery-theme-change", handleChange);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("math-mastery-theme-change", handleChange);
        mediaQuery.removeEventListener("change", handleChange);
    };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSyncExternalStore(subscribeToThemeChange, getClientTheme, getServerTheme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        localStorage.setItem("math_mastery_theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        window.dispatchEvent(new Event("math-mastery-theme-change"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
