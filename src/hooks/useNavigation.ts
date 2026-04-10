"use client";

import { create } from 'zustand';

export type NavState = 'home' | 'masterView' | 'deepView';

interface NavigationStore {
    navState: NavState;
    activeMacro: string | null;
    activeSub: string | null;
    goHome: () => void;
    goToMaster: () => void;
    goToDeepView: (macroId: string, subId?: string) => void;
    setActiveSub: (subId: string | null) => void;
    setNavStateTo: (state: NavState) => void;
    setActiveMacro: (macroId: string | null) => void;
}

export const useNavigation = create<NavigationStore>((set) => ({
    navState: 'home',
    activeMacro: null,
    activeSub: null,

    goHome: () => {
        set({ navState: 'home', activeMacro: null, activeSub: null });
    },

    goToMaster: () => {
        window.history.pushState({ nav: 'masterView' }, '');
        set({ navState: 'masterView', activeMacro: null, activeSub: null });
    },

    goToDeepView: (macroId: string, subId?: string) => {
        window.history.pushState({ nav: 'deepView' }, '');
        set({ navState: 'deepView', activeMacro: macroId, activeSub: subId || null });
    },

    setActiveSub: (subId) => set({ activeSub: subId }),
    setNavStateTo: (state) => set({ navState: state }),
    setActiveMacro: (macro) => set({ activeMacro: macro })
}));
