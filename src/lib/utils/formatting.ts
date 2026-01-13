import { format, parseISO } from 'date-fns';

/**
 * Format a number with thousands separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(value);
}

/**
 * Format a large number with K/M abbreviation
 */
export function formatCompactNumber(value: number, decimals: number = 1): string {
	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(decimals)}M`;
	}
	if (value >= 1_000) {
		return `${(value / 1_000).toFixed(decimals)}K`;
	}
	return value.toString();
}

/**
 * Format weight with unit
 */
export function formatWeight(value: number, isMetric: boolean, decimals: number = 0): string {
	const unit = isMetric ? 'kg' : 'lbs';
	return `${formatNumber(value, decimals)} ${unit}`;
}

/**
 * Format distance with unit
 */
export function formatDistance(value: number, isMetric: boolean, decimals: number = 1): string {
	const unit = isMetric ? 'km' : 'mi';
	return `${formatNumber(value, decimals)} ${unit}`;
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string, formatString: string = 'MMM d, yyyy'): string {
	try {
		const date = parseISO(dateString);
		return format(date, formatString);
	} catch {
		return dateString;
	}
}

/**
 * Format a date string to short format (e.g., "Jan 2019")
 */
export function formatDateShort(dateString: string): string {
	return formatDate(dateString, 'MMM yyyy');
}

/**
 * Format a date string to full format (e.g., "January 23, 2019")
 */
export function formatDateLong(dateString: string): string {
	return formatDate(dateString, 'MMMM d, yyyy');
}

/**
 * Format duration in minutes to hours and minutes
 */
export function formatDuration(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = Math.round(minutes % 60);

	if (hours === 0) {
		return `${mins}m`;
	}
	if (mins === 0) {
		return `${hours}h`;
	}
	return `${hours}h ${mins}m`;
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
	return `${formatNumber(value, decimals)}%`;
}

/**
 * Format a ratio (e.g., strength-to-bodyweight)
 */
export function formatRatio(value: number, decimals: number = 2): string {
	return `${value.toFixed(decimals)}x`;
}
