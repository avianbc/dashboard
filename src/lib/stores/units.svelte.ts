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
 * Reactive unit system state using Svelte 5 runes
 */
class UnitSystemState {
	current = $state<UnitSystem>(loadUnitSystem());

	set(value: UnitSystem) {
		this.current = value;
		saveUnitSystem(value);
	}

	toggle() {
		const newValue = this.current === 'imperial' ? 'metric' : 'imperial';
		this.set(newValue);
	}

	setImperial() {
		this.set('imperial');
	}

	setMetric() {
		this.set('metric');
	}

	reset() {
		this.set(DEFAULT_UNIT);
	}

	get isMetric() {
		return this.current === 'metric';
	}

	get isImperial() {
		return this.current === 'imperial';
	}
}

export const unitSystem = new UnitSystemState();
