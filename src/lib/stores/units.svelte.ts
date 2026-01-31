import { browser } from '$app/environment';
import type { UnitSystem } from '$lib/types/training';

// Countries that primarily use imperial units (USA, Liberia, Myanmar)
const IMPERIAL_LOCALES = ['en-US', 'en-LR', 'my-MM'];

/**
 * Detect user's preferred unit system based on their locale.
 * Most of the world uses metric; only USA, Liberia, and Myanmar use imperial.
 */
function detectUnitSystem(): UnitSystem {
	if (!browser) return 'metric';

	try {
		// Get user's locale from browser
		const locale = navigator.language || navigator.languages?.[0];
		if (locale) {
			// Check if locale matches an imperial country
			if (IMPERIAL_LOCALES.some((imp) => locale.startsWith(imp.split('-')[0]) && locale.includes(imp.split('-')[1]))) {
				return 'imperial';
			}
			// Simpler check: if it's en-US specifically
			if (locale === 'en-US' || locale.startsWith('en-US')) {
				return 'imperial';
			}
		}
	} catch (error) {
		console.warn('Failed to detect locale for unit system:', error);
	}

	// Default to metric (used by ~95% of world population)
	return 'metric';
}

/**
 * Reactive unit system state using Svelte 5 runes
 * Auto-detects based on user's locale
 */
class UnitSystemState {
	current = $state<UnitSystem>(detectUnitSystem());

	toggle() {
		this.current = this.current === 'imperial' ? 'metric' : 'imperial';
	}

	get isMetric() {
		return this.current === 'metric';
	}

	get isImperial() {
		return this.current === 'imperial';
	}
}

export const unitSystem = new UnitSystemState();
