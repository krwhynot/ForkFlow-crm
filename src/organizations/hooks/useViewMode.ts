import { useState, useEffect, useCallback } from 'react';
import { OrganizationListViewMode } from '../../types';

const DEFAULT_VIEW_MODE: OrganizationListViewMode = {
    mode: 'cards',
    sortField: 'name',
    sortOrder: 'ASC',
    itemsPerPage: 25,
};

const STORAGE_KEY = 'organizationViewMode';

/**
 * Custom hook for managing organization list view mode with localStorage persistence
 * Supports table, cards, kanban, and map views with sorting and pagination preferences
 */
export const useViewMode = () => {
    const [viewMode, setViewModeState] = useState<OrganizationListViewMode>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Validate the stored data has required properties
                if (parsed.mode && parsed.sortField && parsed.sortOrder && parsed.itemsPerPage) {
                    return { ...DEFAULT_VIEW_MODE, ...parsed };
                }
            }
        } catch (error) {
            console.warn('Failed to parse stored view mode:', error);
        }
        return DEFAULT_VIEW_MODE;
    });

    // Persist to localStorage whenever viewMode changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(viewMode));
        } catch (error) {
            console.warn('Failed to save view mode to localStorage:', error);
        }
    }, [viewMode]);

    const setViewMode = useCallback((updates: Partial<OrganizationListViewMode>) => {
        setViewModeState(prev => ({ ...prev, ...updates }));
    }, []);

    const toggleViewMode = useCallback(() => {
        const modes: OrganizationListViewMode['mode'][] = ['table', 'cards', 'kanban', 'map'];
        const currentIndex = modes.indexOf(viewMode.mode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setViewMode({ mode: modes[nextIndex] });
    }, [viewMode.mode, setViewMode]);

    const resetToDefault = useCallback(() => {
        setViewModeState(DEFAULT_VIEW_MODE);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn('Failed to remove view mode from localStorage:', error);
        }
    }, []);

    return {
        viewMode,
        setViewMode,
        toggleViewMode,
        resetToDefault,
    };
};