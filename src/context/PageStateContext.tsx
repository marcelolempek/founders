'use client';

import React, { createContext, useContext, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PageState {
    scrollPosition: number;
    data: any;
}

interface PageStateContextType {
    savePageState: (path: string, state: PageState) => void;
    getPageState: (path: string) => PageState | null;
    saveScrollPosition: (path: string) => void;
    restoreScrollPosition: (path: string) => void;
}

const PageStateContext = createContext<PageStateContextType | undefined>(undefined);

export function PageStateProvider({ children }: { children: React.ReactNode }) {
    const pageStates = useRef<Map<string, PageState>>(new Map());
    const pathname = usePathname();
    const isRestoringScroll = useRef(false);

    // Save scroll position before navigating away
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (pathname) {
                saveScrollPosition(pathname);
            }
        };

        // Save scroll position when pathname changes (before navigation)
        return () => {
            handleBeforeUnload();
        };
    }, [pathname]);

    const savePageState = (path: string, state: PageState) => {
        console.log('[PageState] Saving state for path:', path, 'data keys:', Object.keys(state.data || {}));
        pageStates.current.set(path, state);

        // Also save to sessionStorage for persistence across page reloads
        try {
            sessionStorage.setItem(`pageState_${path}`, JSON.stringify(state));
            console.log('[PageState] ✅ Saved to sessionStorage');
        } catch (e) {
            console.warn('Failed to save page state to sessionStorage:', e);
        }
    };

    const getPageState = (path: string): PageState | null => {
        console.log('[PageState] Getting state for path:', path);

        // First check in-memory state
        const memoryState = pageStates.current.get(path);
        if (memoryState) {
            console.log('[PageState] ✅ Retrieved from memory, data keys:', Object.keys(memoryState.data || {}));
            return memoryState;
        }

        // Fallback to sessionStorage
        try {
            const stored = sessionStorage.getItem(`pageState_${path}`);
            if (stored) {
                const state = JSON.parse(stored);
                pageStates.current.set(path, state);
                console.log('[PageState] ✅ Retrieved from sessionStorage, data keys:', Object.keys(state.data || {}));
                return state;
            }
        } catch (e) {
            console.warn('Failed to get page state from sessionStorage:', e);
        }

        console.log('[PageState] ❌ No state found');
        return null;
    };

    const saveScrollPosition = (path: string) => {
        const scrollY = window.scrollY || window.pageYOffset;
        const currentState = getPageState(path) || { scrollPosition: 0, data: null };

        savePageState(path, {
            ...currentState,
            scrollPosition: scrollY
        });
    };

    const restoreScrollPosition = (path: string) => {
        if (isRestoringScroll.current) return;

        const state = getPageState(path);
        if (state && state.scrollPosition !== undefined) {
            isRestoringScroll.current = true;
            console.log('[PageState] Restoring scroll to:', state.scrollPosition);

            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: state.scrollPosition,
                    behavior: 'instant' as ScrollBehavior
                });

                // Reset flag after a short delay
                setTimeout(() => {
                    isRestoringScroll.current = false;
                }, 100);
            });
        }
    };

    return (
        <PageStateContext.Provider value={{
            savePageState,
            getPageState,
            saveScrollPosition,
            restoreScrollPosition
        }}>
            {children}
        </PageStateContext.Provider>
    );
}

export function usePageState() {
    const context = useContext(PageStateContext);
    if (!context) {
        throw new Error('usePageState must be used within PageStateProvider');
    }
    return context;
}
