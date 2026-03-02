import { useEffect, useRef, useCallback, useState } from 'react';
import { usePageState } from '@/context/PageStateContext';
import { usePathname } from 'next/navigation';

/**
 * Hook to persist page state (data + scroll position) across navigation
 * 
 * @example
 * const { restoreState, saveState, isRestored } = usePersistedPageState('/discover', {
 *   searchQuery: '',
 *   users: []
 * });
 * 
 * // On mount, try to restore
 * useEffect(() => {
 *   const restored = restoreState();
 *   if (restored) {
 *     setSearchQuery(restored.searchQuery);
 *     setUsers(restored.users);
 *   } else {
 *     // Load fresh data
 *     loadData();
 *   }
 * }, []);
 * 
 * // Save whenever state changes
 * useEffect(() => {
 *   if (isRestored) {
 *     saveState({ searchQuery, users });
 *   }
 * }, [searchQuery, users]);
 */
export function usePersistedPageState<T>(pagePath?: string, initialData?: T) {
    const pathname = usePathname();
    const path = pagePath || pathname;
    const { savePageState, getPageState, saveScrollPosition, restoreScrollPosition } = usePageState();
    const hasRestoredState = useRef(false);
    const [isRestored, setIsRestored] = useState(false);

    const restoreState = useCallback((): T | null => {
        if (hasRestoredState.current) return null;

        const savedState = getPageState(path);
        if (savedState?.data) {
            hasRestoredState.current = true;
            setIsRestored(true);

            // Restore scroll position
            setTimeout(() => {
                restoreScrollPosition(path);
            }, 100);

            return savedState.data as T;
        }

        return null;
    }, [path, getPageState, restoreScrollPosition]);

    const saveState = useCallback((data: T) => {
        savePageState(path, {
            scrollPosition: window.scrollY || 0,
            data
        });
    }, [path, savePageState]);

    // Auto-save scroll position on scroll
    useEffect(() => {
        const handleScroll = () => {
            saveScrollPosition(path);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [path, saveScrollPosition]);

    return {
        restoreState,
        saveState,
        isRestored
    };
}
