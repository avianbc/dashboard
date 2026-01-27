/**
 * Simple memoization helper for expensive calculations
 */
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
	const cache = new Map<string, ReturnType<T>>();

	return ((...args: Parameters<T>): ReturnType<T> => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key)!;
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(startDate: string, endDate: string): number {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const diffTime = Math.abs(end.getTime() - start.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate years between two dates
 */
export function yearsBetween(startDate: string, endDate: string): number {
	const days = daysBetween(startDate, endDate);
	return Math.round((days / 365.25) * 10) / 10; // Round to 1 decimal
}

/**
 * Get status color for days since last PR
 */
export function getPRStatusColor(days: number): 'recent' | 'aging' | 'overdue' {
	if (days < 90) return 'recent';
	if (days < 180) return 'aging';
	return 'overdue';
}

/**
 * Sort array by date (descending by default)
 * Memoized for performance
 */
export const sortByDate = memoize(<T extends { date: string }>(
	items: T[],
	ascending: boolean = false
): T[] => {
	return [...items].sort((a, b) => {
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		return ascending ? dateA - dateB : dateB - dateA;
	});
});

/**
 * Find max value in an array
 */
export function findMax<T>(items: T[], getValue: (item: T) => number): number {
	if (items.length === 0) return 0;
	return Math.max(...items.map(getValue));
}

/**
 * Find min value in an array
 */
export function findMin<T>(items: T[], getValue: (item: T) => number): number {
	if (items.length === 0) return 0;
	return Math.min(...items.map(getValue));
}

/**
 * Calculate rolling average
 * Memoized for performance with large datasets
 */
export const rollingAverage = memoize((values: number[], windowSize: number): number[] => {
	const result: number[] = [];
	for (let i = 0; i < values.length; i++) {
		const start = Math.max(0, i - windowSize + 1);
		const window = values.slice(start, i + 1);
		const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
		result.push(avg);
	}
	return result;
});
