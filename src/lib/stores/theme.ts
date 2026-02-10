import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
    const initialTheme = (browser && (localStorage.getItem('theme') as Theme)) || 'system';
    const { subscribe, set } = writable<Theme>(initialTheme);

    return {
        subscribe,
        set: (value: Theme) => {
            if (browser) {
                localStorage.setItem('theme', value);
                applyTheme(value);
            }
            set(value);
        },
        init: () => {
            if (browser) {
                const stored = localStorage.getItem('theme') as Theme;
                applyTheme(stored || 'system');
            }
        }
    };
}

function applyTheme(theme: Theme) {
    if (!browser) return;

    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

export const theme = createThemeStore();
