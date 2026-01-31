import type { PageLoad } from './$types';
import type { CoreTrainingData } from '$lib/types/training';
import { base } from '$app/paths';

export const prerender = true;

export const load: PageLoad = async ({ fetch }) => {
	try {
		// Load only core data (~80KB) for initial page load
		const response = await fetch(`${base}/data/training_core.json`);

		if (!response.ok) {
			console.error(`Failed to load core training data: ${response.statusText}`);
			// Return empty data structure instead of throwing
			return {
				coreData: {} as CoreTrainingData,
				error: `Failed to load training data: ${response.statusText}`
			};
		}

		const data: CoreTrainingData = await response.json();

		return {
			coreData: data
		};
	} catch (error) {
		console.error('Error loading core training data:', error);
		// Return empty data structure to allow graceful degradation
		return {
			coreData: {} as CoreTrainingData,
			error: error instanceof Error ? error.message : 'Unknown error loading data'
		};
	}
};
