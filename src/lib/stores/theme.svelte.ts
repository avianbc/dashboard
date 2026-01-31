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
 * Reactive theme state using Svelte 5 runes
 */
class ThemeState {
	current = $state<Theme>(loadTheme());

	constructor() {
		// Apply initial theme
		if (browser) {
			applyTheme(this.current);
		}
	}

	set(value: Theme) {
		this.current = value;
		saveTheme(value);
		applyTheme(value);
	}

	toggle() {
		const newValue = this.current === 'dark' ? 'light' : 'dark';
		this.set(newValue);
	}

	setDark() {
		this.set('dark');
	}

	setLight() {
		this.set('light');
	}

	reset() {
		this.set(DEFAULT_THEME);
	}

	get isDark() {
		return this.current === 'dark';
	}

	get isLight() {
		return this.current === 'light';
	}
}

export const theme = new ThemeState();
