/**
 * Data loader utility with caching for deferred training data
 */

import type { DeferredTrainingData } from '$lib/types/training';
import { base } from '$app/paths';

// Cache for deferred data
let deferredDataCache: DeferredTrainingData | null = null;
let loadingPromise: Promise<DeferredTrainingData> | null = null;

/**
 * Load deferred training data from the server
 * Uses caching to avoid multiple fetches
 */
export async function loadDeferredData(): Promise<DeferredTrainingData> {
	// Return cached data if available
	if (deferredDataCache) {
		return deferredDataCache;
	}

	// If already loading, return the existing promise
	if (loadingPromise) {
		return loadingPromise;
	}

	// Start loading
	loadingPromise = fetch(`${base}/data/training_deferred.json`)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Failed to load deferred data: ${response.statusText}`);
			}
			return response.json();
		})
		.then((data: DeferredTrainingData) => {
			deferredDataCache = data;
			loadingPromise = null;
			return data;
		})
		.catch((error) => {
			loadingPromise = null;
			throw error;
		});

	return loadingPromise;
}

/**
 * Check if deferred data is loaded
 */
export function isDeferredDataLoaded(): boolean {
	return deferredDataCache !== null;
}

/**
 * Clear the deferred data cache (useful for testing or force reload)
 */
export function clearDeferredDataCache(): void {
	deferredDataCache = null;
	loadingPromise = null;
}
