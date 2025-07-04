import { useEffect, useCallback } from 'react';
import { useViewMode } from './useViewMode';

/**
 * Custom hook for keyboard shortcuts in organization list
 * Provides power user shortcuts for switching views and navigation
 */
export const useKeyboardShortcuts = (options?: {
    enableGlobalShortcuts?: boolean;
    onCreateNew?: () => void;
    onSearch?: () => void;
}) => {
    const {
        enableGlobalShortcuts = true,
        onCreateNew,
        onSearch,
    } = options || {};

    const { viewMode, setViewMode, toggleViewMode } = useViewMode();

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Only handle shortcuts when not in form inputs
            const target = event.target as HTMLElement;
            const isInInput =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true';

            if (isInInput) return;

            // Check for modifier keys
            const hasModifier = event.ctrlKey || event.metaKey;
            const hasShift = event.shiftKey;

            // Handle shortcuts
            switch (event.key) {
                case '1':
                    if (hasModifier) {
                        event.preventDefault();
                        setViewMode({ mode: 'table' });
                    }
                    break;

                case '2':
                    if (hasModifier) {
                        event.preventDefault();
                        setViewMode({ mode: 'cards' });
                    }
                    break;

                case '3':
                    if (hasModifier) {
                        event.preventDefault();
                        setViewMode({ mode: 'kanban' });
                    }
                    break;

                case '4':
                    if (hasModifier) {
                        event.preventDefault();
                        setViewMode({ mode: 'map' });
                    }
                    break;

                case 'v':
                    if (hasModifier && hasShift) {
                        event.preventDefault();
                        toggleViewMode();
                    }
                    break;

                case 'n':
                    if (hasModifier && onCreateNew) {
                        event.preventDefault();
                        onCreateNew();
                    }
                    break;

                case 'f':
                case '/':
                    if ((hasModifier || event.key === '/') && onSearch) {
                        event.preventDefault();
                        onSearch();
                    }
                    break;

                case 'Escape':
                    // Clear focus from current element
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                    }
                    break;
            }
        },
        [setViewMode, toggleViewMode, onCreateNew, onSearch]
    );

    useEffect(() => {
        if (!enableGlobalShortcuts) return;

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, enableGlobalShortcuts]);

    // Return current shortcuts for display in help
    const shortcuts = [
        { keys: 'Ctrl+1', description: 'Switch to table view' },
        { keys: 'Ctrl+2', description: 'Switch to card view' },
        { keys: 'Ctrl+3', description: 'Switch to kanban view' },
        { keys: 'Ctrl+4', description: 'Switch to map view' },
        { keys: 'Ctrl+Shift+V', description: 'Toggle view mode' },
        { keys: 'Ctrl+N', description: 'Create new organization' },
        { keys: 'Ctrl+F or /', description: 'Focus search' },
        { keys: 'Escape', description: 'Clear focus' },
    ];

    return {
        shortcuts,
        currentViewMode: viewMode.mode,
    };
};
