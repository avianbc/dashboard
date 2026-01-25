/**
 * Shared chart configuration utilities
 * Provides standardized tooltip config and color helpers for ECharts
 */

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

/**
 * Get computed CSS color values for charts
 * Reads from CSS custom properties defined in app.css
 */
export function getChartColors(): ChartColors {
	const computedStyle = getComputedStyle(document.documentElement);

	return {
		// Accent colors
		accentCopper: computedStyle.getPropertyValue('--accent-copper').trim(),
		accentGold: computedStyle.getPropertyValue('--accent-gold').trim(),
		accentSilver: computedStyle.getPropertyValue('--accent-silver').trim(),
		accentBronze: computedStyle.getPropertyValue('--accent-bronze').trim(),

		// Text colors
		textPrimary: computedStyle.getPropertyValue('--text-primary').trim(),
		textSecondary: computedStyle.getPropertyValue('--text-secondary').trim(),
		textMuted: computedStyle.getPropertyValue('--text-muted').trim(),

		// Chart-specific colors
		chartTooltipBg: computedStyle.getPropertyValue('--chart-tooltip-bg').trim(),
		chartTooltipBorder: computedStyle.getPropertyValue('--chart-tooltip-border').trim()
	};
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
