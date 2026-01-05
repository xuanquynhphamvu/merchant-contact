import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

/**
 * Filter preferences that persist across sessions
 */
export interface FilterPreferences {
    search?: string;
    status?: 'active' | 'inactive' | '';
    tags?: string;
    sortField?: 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Theme options
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * AppContext value interface
 * 
 * WHAT PROBLEM THIS SOLVES:
 * - Filter preferences are lost when navigating between routes
 * - No centralized theme management
 * - Duplicated state management logic across components
 */
interface AppContextValue {
    // Filter preferences (persisted to localStorage)
    filterPreferences: FilterPreferences;
    setFilterPreferences: (prefs: Partial<FilterPreferences>) => void;
    clearFilterPreferences: () => void;

    // Theme (persisted to localStorage)
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark'; // Computed based on system preference
}

/**
 * Create context with undefined default
 * This forces consumers to use the provider
 */
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * LocalStorage keys
 */
const STORAGE_KEYS = {
    FILTER_PREFERENCES: 'merchant-contact-filters',
    THEME: 'merchant-contact-theme',
} as const;

/**
 * AppProvider Props
 */
interface AppProviderProps {
    children: ReactNode;
}

/**
 * AppProvider Component
 * 
 * WHAT PROBLEM THIS SOLVES:
 * - Provides centralized state management for app-wide settings
 * - Persists user preferences across sessions using localStorage
 * - Prevents prop drilling by making state available via context
 * - Handles system theme preference detection
 */
export function AppProvider({ children }: AppProviderProps) {
    // Initialize filter preferences from localStorage
    const [filterPreferences, setFilterPreferencesState] = useState<FilterPreferences>(() => {
        if (typeof window === 'undefined') return {};

        try {
            const stored = localStorage.getItem(STORAGE_KEYS.FILTER_PREFERENCES);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to load filter preferences:', error);
            return {};
        }
    });

    // Initialize theme from localStorage
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'system';

        try {
            const stored = localStorage.getItem(STORAGE_KEYS.THEME);
            return (stored as Theme) || 'system';
        } catch (error) {
            console.error('Failed to load theme:', error);
            return 'system';
        }
    });

    // Track system theme preference
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Compute resolved theme based on preference and system setting
    const resolvedTheme: 'light' | 'dark' = theme === 'system' ? systemTheme : theme;

    /**
     * Update filter preferences
     * 
     * WHY useCallback:
     * - Prevents unnecessary re-renders of components that consume this function
     * - Ensures stable function reference across renders
     */
    const setFilterPreferences = useCallback((prefs: Partial<FilterPreferences>) => {
        setFilterPreferencesState(prev => {
            const updated = { ...prev, ...prefs };

            // Persist to localStorage
            try {
                localStorage.setItem(STORAGE_KEYS.FILTER_PREFERENCES, JSON.stringify(updated));
            } catch (error) {
                console.error('Failed to save filter preferences:', error);
            }

            return updated;
        });
    }, []);

    /**
     * Clear all filter preferences
     */
    const clearFilterPreferences = useCallback(() => {
        setFilterPreferencesState({});
        try {
            localStorage.removeItem(STORAGE_KEYS.FILTER_PREFERENCES);
        } catch (error) {
            console.error('Failed to clear filter preferences:', error);
        }
    }, []);

    /**
     * Update theme preference
     * 
     * WHY useCallback:
     * - Prevents unnecessary re-renders of theme toggle components
     * - Ensures stable function reference
     */
    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);

        // Persist to localStorage
        try {
            localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }, []);

    // Context value
    const value: AppContextValue = {
        filterPreferences,
        setFilterPreferences,
        clearFilterPreferences,
        theme,
        setTheme,
        resolvedTheme,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

/**
 * useAppContext Hook
 * 
 * Custom hook to access AppContext
 * Throws error if used outside of AppProvider
 * 
 * USAGE:
 * const { filterPreferences, setFilterPreferences, theme, setTheme } = useAppContext();
 */
export function useAppContext(): AppContextValue {
    const context = useContext(AppContext);

    if (context === undefined) {
        throw new Error('useAppContext must be used within AppProvider');
    }

    return context;
}
