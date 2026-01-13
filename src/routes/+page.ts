import type { PageLoad } from './$types';
import type { TrainingData } from '$lib/types/training';

export const prerender = true;

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/data/training_data.json');

		if (!response.ok) {
			throw new Error(`Failed to load training data: ${response.statusText}`);
		}

		const data: TrainingData = await response.json();

		return {
			trainingData: data
		};
	} catch (error) {
		console.error('Error loading training data:', error);
		throw error;
	}
};
