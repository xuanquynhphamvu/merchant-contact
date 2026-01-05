import React from 'react';

/**
 * Navigation button configuration
 */
interface NavButton {
    href: string;
    label: string;
    icon: string;
    variant: 'default' | 'primary';
}

/**
 * SharedNavigation Props
 */
interface SharedNavigationProps {
    /**
     * Current route path for active state highlighting
     */
    currentPath: string;

    /**
     * Additional buttons to include (e.g., "New Customer")
     */
    additionalButtons?: NavButton[];
}

/**
 * SharedNavigation Component
 * 
 * WHAT PROBLEM THIS SOLVES:
 * - Navigation buttons were duplicated across routes (customers.tsx, dashboard.tsx)
 * - No active route highlighting
 * - Inconsistent styling across routes
 * 
 * WHY React.memo:
 * - Navigation doesn't change often
 * - Prevents re-rendering when parent re-renders
 * - Only re-renders when currentPath or additionalButtons change
 */
export const SharedNavigation = React.memo(function SharedNavigation({
    currentPath,
    additionalButtons = []
}: SharedNavigationProps) {
    // Base navigation buttons
    const baseButtons: NavButton[] = [
        {
            href: '/',
            label: 'Home',
            icon: '🏠',
            variant: 'default',
        },
        {
            href: '/customers',
            label: 'Customers',
            icon: '📇',
            variant: 'default',
        },
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: '📊',
            variant: 'default',
        },
    ];

    /**
     * Check if a route is active
     * 
     * WHY THIS LOGIC:
     * - Exact match for home page
     * - Prefix match for other routes (e.g., /customers matches /customers/new)
     */
    const isActive = (href: string): boolean => {
        if (href === '/') {
            return currentPath === '/';
        }
        return currentPath.startsWith(href);
    };

    /**
     * Get button classes based on variant and active state
     */
    const getButtonClasses = (button: NavButton, active: boolean): string => {
        const baseClasses = 'px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2';

        if (active) {
            // Active state - always use primary colors
            return `${baseClasses} bg-blue-600 text-white ring-2 ring-blue-400`;
        }

        if (button.variant === 'primary') {
            return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
        }

        return `${baseClasses} bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300`;
    };

    return (
        <div className="flex gap-2">
            {/* Base navigation buttons */}
            {baseButtons.map((button) => {
                const active = isActive(button.href);
                return (
                    <a
                        key={button.href}
                        href={button.href}
                        className={getButtonClasses(button, active)}
                        aria-current={active ? 'page' : undefined}
                    >
                        <span>{button.icon}</span>
                        <span>{button.label}</span>
                    </a>
                );
            })}

            {/* Additional buttons (e.g., "New Customer") */}
            {additionalButtons.map((button) => (
                <a
                    key={button.href}
                    href={button.href}
                    className={getButtonClasses(button, false)}
                >
                    <span>{button.icon}</span>
                    <span>{button.label}</span>
                </a>
            ))}
        </div>
    );
});
