import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'training-dashboard-theme';
const DEFAULT_THEME: Theme = 'dark'; // "Iron Archive" dark mode as default

/**
 * Load theme preference from localStorage
 */
function loadTheme(): Theme {
	if (!browser) return DEFAULT_THEME;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'dark' || stored === 'light') {
			return stored;
		}
	} catch (error) {
		console.warn('Failed to load theme from localStorage:', error);
	}

	return DEFAULT_THEME;
}

/**
 * Save theme preference to localStorage
 */
function saveTheme(theme: Theme): void {
	if (!browser) return;

	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch (error) {
		console.warn('Failed to save theme to localStorage:', error);
	}
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme): void {
	if (!browser) return;

	try {
		document.documentElement.setAttribute('data-theme', theme);
	} catch (error) {
		console.warn('Failed to apply theme:', error);
	}
}

/**
 * Create the theme store
 */
function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>(loadTheme());

	// Apply initial theme
	if (browser) {
		applyTheme(loadTheme());
	}

	return {
		subscribe,
		set: (value: Theme) => {
			saveTheme(value);
			applyTheme(value);
			set(value);
		},
		toggle: () => {
			update((current) => {
				const newValue = current === 'dark' ? 'light' : 'dark';
				saveTheme(newValue);
				applyTheme(newValue);
				return newValue;
			});
		},
		setDark: () => {
			saveTheme('dark');
			applyTheme('dark');
			set('dark');
		},
		setLight: () => {
			saveTheme('light');
			applyTheme('light');
			set('light');
		},
		reset: () => {
			saveTheme(DEFAULT_THEME);
			applyTheme(DEFAULT_THEME);
			set(DEFAULT_THEME);
		}
	};
}

export const theme = createThemeStore();

/**
 * Derived store to check if current theme is dark
 */
export const isDark = {
	subscribe: (run: (value: boolean) => void) => {
		return theme.subscribe((value) => run(value === 'dark'));
	}
};
