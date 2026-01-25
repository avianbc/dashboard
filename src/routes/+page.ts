import type { PageLoad } from './$types';
import type { TrainingData } from '$lib/types/training';
import { base } from '$app/paths';

export const prerender = true;

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch(`${base}/data/training_data.json`);

		if (!response.ok) {
			console.error(`Failed to load training data: ${response.statusText}`);
			// Return empty data structure instead of throwing
			return {
				trainingData: {} as TrainingData,
				error: `Failed to load training data: ${response.statusText}`
			};
		}

		const data: TrainingData = await response.json();

		return {
			trainingData: data
		};
	} catch (error) {
		console.error('Error loading training data:', error);
		// Return empty data structure to allow graceful degradation
		return {
			trainingData: {} as TrainingData,
			error: error instanceof Error ? error.message : 'Unknown error loading data'
		};
	}
};
