/**
 * Shared chart configuration utilities
 * Provides standardized tooltip config and color helpers for ECharts
 */

import { theme } from '$lib/stores';
import { LIFT_COLORS } from '$lib/config';

// Re-export lift colors for convenient chart access
export { LIFT_COLORS } from '$lib/config';

/**
 * Lift color configuration for charts
 * Single source of truth - imported from $lib/config/lifts.ts
 */
export const liftColors = LIFT_COLORS;

/**
 * Day of week color palette
 * Uses lift colors + accent colors for visual variety
 * Intentionally reuses design tokens for consistency
 */
export const DAY_COLORS = [
	LIFT_COLORS.squat,   // Monday - red
	LIFT_COLORS.ohp,     // Tuesday - amber
	LIFT_COLORS.deadlift, // Wednesday - green
	LIFT_COLORS.bench,   // Thursday - blue
	'#c17f59',           // Friday - copper (accent)
	'#a8a299',           // Saturday - gray (neutral)
	'#6b6560'            // Sunday - muted (neutral)
] as const;

/**
 * Accent colors for charts (non-lift specific)
 * Use these for secondary/tertiary data series
 */
export const accentColors = {
	copper: '#c17f59',
	gold: '#d4a84b',
	silver: '#a8a299',
	bronze: '#8b5a3c'
} as const;

export interface ChartColors {
	// Accent colors
	accentCopper: string;
	accentGold: string;
	accentSilver: string;
	accentBronze: string;

	// Text colors
	textPrimary: string;
	textSecondary: string;
	textMuted: string;

	// Chart-specific colors
	chartTooltipBg: string;
	chartTooltipBorder: string;
}

export interface TooltipConfig {
	trigger: 'axis' | 'item';
	backgroundColor: string;
	borderColor: string;
	borderWidth: number;
	textStyle: {
		color: string;
		fontFamily: string;
	};
	padding?: number;
}

/**
 * Standard tooltip padding (consistent across all charts)
 */
export const TOOLTIP_PADDING = 8;

// Color palettes for light and dark themes
const DARK_COLORS: ChartColors = {
	accentCopper: '#c17f59',
	accentGold: '#c9a227',
	accentSilver: '#a8a29e',
	accentBronze: '#8b5a3c',
	textPrimary: '#f5f2eb',
	textSecondary: '#a09a91',
	textMuted: '#6b6560',
	chartTooltipBg: '#1a1816',
	chartTooltipBorder: '#454238'
};

const LIGHT_COLORS: ChartColors = {
	accentCopper: '#a86840',
	accentGold: '#a8860d',
	accentSilver: '#78716c',
	accentBronze: '#6d4530',
	textPrimary: '#1a1816',
	textSecondary: '#57534e',
	textMuted: '#7a756e',
	chartTooltipBg: '#faf9f7',
	chartTooltipBorder: '#d4d0c8'
};

/**
 * Get color values for charts based on current theme
 * Uses direct color values instead of CSS variables for reliability
 */
export function getChartColors(): ChartColors {
	return theme.current === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

/**
 * Create standardized tooltip configuration for ECharts
 * Ensures consistent styling across all charts
 *
 * @param colors - Chart colors from getChartColors()
 * @param options - Optional overrides for trigger type
 * @returns Tooltip configuration object
 */
export function createTooltipConfig(
	colors: ChartColors,
	options?: { trigger?: 'axis' | 'item' }
): TooltipConfig {
	return {
		trigger: options?.trigger || 'axis',
		backgroundColor: colors.chartTooltipBg,
		borderColor: colors.chartTooltipBorder,
		borderWidth: 1,
		textStyle: {
			color: colors.textPrimary,
			fontFamily: 'Source Sans 3, sans-serif'
		}
	};
}
