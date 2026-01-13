import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { UnitSystem } from '$lib/types/training';

const STORAGE_KEY = 'training-dashboard-unit-system';
const DEFAULT_UNIT: UnitSystem = 'imperial'; // Default based on data source

/**
 * Load unit system preference from localStorage
 */
function loadUnitSystem(): UnitSystem {
	if (!browser) return DEFAULT_UNIT;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'imperial' || stored === 'metric') {
			return stored;
		}
	} catch (error) {
		console.warn('Failed to load unit system from localStorage:', error);
	}

	return DEFAULT_UNIT;
}

/**
 * Save unit system preference to localStorage
 */
function saveUnitSystem(unitSystem: UnitSystem): void {
	if (!browser) return;

	try {
		localStorage.setItem(STORAGE_KEY, unitSystem);
	} catch (error) {
		console.warn('Failed to save unit system to localStorage:', error);
	}
}

/**
 * Create the unit system store
 */
function createUnitSystemStore() {
	const { subscribe, set, update } = writable<UnitSystem>(loadUnitSystem());

	return {
		subscribe,
		set: (value: UnitSystem) => {
			saveUnitSystem(value);
			set(value);
		},
		toggle: () => {
			update((current) => {
				const newValue = current === 'imperial' ? 'metric' : 'imperial';
				saveUnitSystem(newValue);
				return newValue;
			});
		},
		setImperial: () => {
			saveUnitSystem('imperial');
			set('imperial');
		},
		setMetric: () => {
			saveUnitSystem('metric');
			set('metric');
		},
		reset: () => {
			saveUnitSystem(DEFAULT_UNIT);
			set(DEFAULT_UNIT);
		}
	};
}

export const unitSystem = createUnitSystemStore();

/**
 * Derived store to check if current system is metric
 */
export const isMetric = {
	subscribe: (run: (value: boolean) => void) => {
		return unitSystem.subscribe((value) => run(value === 'metric'));
	}
};
