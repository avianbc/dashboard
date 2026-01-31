import { browser } from '$app/environment';

export type Theme = 'dark' | 'light';

/**
 * Get the system's preferred color scheme
 */
function getSystemTheme(): Theme {
	if (!browser) return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
 * Always follows system preference
 */
class ThemeState {
	current = $state<Theme>(getSystemTheme());

	constructor() {
		if (browser) {
			// Apply initial theme
			applyTheme(this.current);

			// Listen for system theme changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				this.current = e.matches ? 'dark' : 'light';
				applyTheme(this.current);
			});
		}
	}

	toggle() {
		const newTheme = this.current === 'dark' ? 'light' : 'dark';
		applyTheme(newTheme);
		this.current = newTheme;
	}

	get isDark() {
		return this.current === 'dark';
	}

	get isLight() {
		return this.current === 'light';
	}
}

export const theme = new ThemeState();
