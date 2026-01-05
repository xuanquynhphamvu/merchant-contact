import React, { useCallback } from 'react';
import { useAppContext, type Theme } from '~/context/AppContext';

/**
 * ThemeToggle Component
 * 
 * WHAT PROBLEM THIS SOLVES:
 * - No way for users to toggle between light/dark mode
 * - Theme preference not persisted across sessions
 * 
 * WHY useCallback:
 * - Memoizes the click handler to prevent unnecessary re-renders
 * - Ensures stable function reference
 */
export const ThemeToggle = React.memo(function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useAppContext();

    /**
     * Cycle through theme options: light -> dark -> system
     * 
     * WHY useCallback:
     * - Prevents recreation of this function on every render
     * - Dependencies array ensures it updates when setTheme changes (which it won't)
     */
    const cycleTheme = useCallback(() => {
        const nextTheme: Theme =
            theme === 'light' ? 'dark' :
                theme === 'dark' ? 'system' :
                    'light';

        setTheme(nextTheme);
    }, [theme, setTheme]);

    /**
     * Get theme icon and label
     */
    const getThemeDisplay = () => {
        if (theme === 'system') {
            return {
                icon: resolvedTheme === 'dark' ? '🌙' : '☀️',
                label: 'System',
            };
        }

        return {
            icon: theme === 'dark' ? '🌙' : '☀️',
            label: theme === 'dark' ? 'Dark' : 'Light',
        };
    };

    const display = getThemeDisplay();

    return (
        <button
            onClick={cycleTheme}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors flex items-center gap-2"
            title={`Current theme: ${theme}. Click to cycle.`}
            aria-label={`Switch theme. Current: ${theme}`}
        >
            <span className="text-lg">{display.icon}</span>
            <span className="text-sm">{display.label}</span>
        </button>
    );
});
