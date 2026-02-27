<script lang="ts">
	import type { WorkoutCalendarDay, PolarDayData } from '$lib/types/training';
	import { unitSystem } from '$lib/stores';
	import { formatNumber } from '$lib/utils';
	import { Callout, SegmentedControl } from '$lib/components/ui';
	import { BarChart3 } from 'lucide-svelte';
	import { SvelteMap, SvelteSet, SvelteDate } from 'svelte/reactivity';

	interface Props {
		data: WorkoutCalendarDay[] | Record<string, Omit<WorkoutCalendarDay, 'date'>>;
	}

	let { data }: Props = $props();

	type ViewMode = 'volume' | 'hr' | 'calories';
	let viewMode = $state<ViewMode>('volume');

	const viewOptions = [
		{ value: 'volume', label: 'Volume' },
		{ value: 'hr', label: 'Heart Rate' },
		{ value: 'calories', label: 'Calories' }
	];

	interface GridDay {
		date: Date;
		volume: number;
		count: number;
		level: number;
		polar?: PolarDayData;
	}

	interface WeekRow {
		days: (GridDay | null)[];
	}

	interface YearGrid {
		year: number;
		weeks: WeekRow[];
		monthLabels: { month: string; weekIndex: number }[];
	}

	// Convert data to array if it's an object
	const dataArray = $derived.by(() => {
		if (Array.isArray(data)) {
			return data;
		}
		return Object.entries(data).map(([date, values]) => ({
			date,
			...values
		}));
	});

	// Create a lookup map for quick access
	const dataMap = $derived.by(() => {
		const map = new SvelteMap<
			string,
			{ volumeLbs: number; volumeKg: number; count: number; polar?: PolarDayData }
		>();
		dataArray.forEach((day) => {
			map.set(day.date, {
				volumeLbs: day.volumeLbs,
				volumeKg: day.volumeKg,
				count: day.count,
				polar: day.polar
			});
		});
		return map;
	});

	// Calculate dynamic thresholds based on quartiles for volume mode
	function calculateVolumeThresholds(data: WorkoutCalendarDay[]): number[] {
		const volumes = data
			.map((d) => (unitSystem.current === 'imperial' ? d.volumeLbs : d.volumeKg))
			.filter((v) => v > 0)
			.sort((a, b) => a - b);

		if (volumes.length === 0) return [0, 1, 2, 3];

		const q25 = volumes[Math.floor(volumes.length * 0.25)];
		const q50 = volumes[Math.floor(volumes.length * 0.5)];
		const q75 = volumes[Math.floor(volumes.length * 0.75)];

		return [0, q25, q50, q75];
	}

	// Calculate dynamic thresholds for HR mode (avg HR values)
	function calculateHrThresholds(data: WorkoutCalendarDay[]): number[] {
		const hrs = data
			.map((d) => d.polar?.avgHr ?? 0)
			.filter((v) => v > 0)
			.sort((a, b) => a - b);

		if (hrs.length === 0) return [0, 100, 130, 155];

		const q25 = hrs[Math.floor(hrs.length * 0.25)];
		const q50 = hrs[Math.floor(hrs.length * 0.5)];
		const q75 = hrs[Math.floor(hrs.length * 0.75)];

		return [0, q25, q50, q75];
	}

	// Calculate dynamic thresholds for calories mode
	function calculateCalThresholds(data: WorkoutCalendarDay[]): number[] {
		const cals = data
			.map((d) => d.polar?.kiloCalories ?? 0)
			.filter((v) => v > 0)
			.sort((a, b) => a - b);

		if (cals.length === 0) return [0, 200, 450, 700];

		const q25 = cals[Math.floor(cals.length * 0.25)];
		const q50 = cals[Math.floor(cals.length * 0.5)];
		const q75 = cals[Math.floor(cals.length * 0.75)];

		return [0, q25, q50, q75];
	}

	const volumeThresholds = $derived(calculateVolumeThresholds(dataArray));
	const hrThresholds = $derived(calculateHrThresholds(dataArray));
	const calThresholds = $derived(calculateCalThresholds(dataArray));

	// Get level (0-4) based on value and thresholds
	function getLevel(value: number, thresholds: number[]): number {
		if (value === 0) return 0;
		if (value <= thresholds[1]) return 1;
		if (value <= thresholds[2]) return 2;
		if (value <= thresholds[3]) return 3;
		return 4;
	}

	function getLevelForDay(
		dayData: { volumeLbs: number; volumeKg: number; count: number; polar?: PolarDayData } | undefined,
		mode: ViewMode
	): number {
		if (!dayData) return 0;

		if (mode === 'hr') {
			const hr = dayData.polar?.avgHr ?? 0;
			return getLevel(hr, hrThresholds);
		} else if (mode === 'calories') {
			const kcal = dayData.polar?.kiloCalories ?? 0;
			return getLevel(kcal, calThresholds);
		} else {
			const vol =
				unitSystem.current === 'imperial' ? dayData.volumeLbs : dayData.volumeKg;
			return getLevel(vol, volumeThresholds);
		}
	}

	// Generate year grid structure
	function generateYearGrid(
		year: number,
		dataMap: Map<
			string,
			{ volumeLbs: number; volumeKg: number; count: number; polar?: PolarDayData }
		>,
		mode: ViewMode
	): YearGrid {
		const weeks: WeekRow[] = [];
		const monthLabels: { month: string; weekIndex: number }[] = [];

		// Find first Sunday on or before Jan 1
		const jan1 = new SvelteDate(year, 0, 1);
		const dayOfWeek = jan1.getDay();
		const firstSunday = new SvelteDate(jan1);
		firstSunday.setDate(jan1.getDate() - dayOfWeek);

		// Generate 53 weeks (covers full year)
		let currentMonth = -1;
		for (let weekIndex = 0; weekIndex < 53; weekIndex++) {
			const days: (GridDay | null)[] = [];

			for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
				const date = new SvelteDate(firstSunday);
				date.setDate(firstSunday.getDate() + weekIndex * 7 + dayIndex);

				// Only include days in the current year
				if (date.getFullYear() === year) {
					const dateStr = date.toISOString().split('T')[0];
					const dayData = dataMap.get(dateStr);

					const volume = dayData
						? unitSystem.current === 'imperial'
							? dayData.volumeLbs
							: dayData.volumeKg
						: 0;
					const count = dayData?.count || 0;
					const level = getLevelForDay(dayData, mode);

					days.push({ date, volume, count, level, polar: dayData?.polar });

					// Track month labels
					const month = date.getMonth();
					if (month !== currentMonth && date.getDate() <= 7) {
						currentMonth = month;
						monthLabels.push({
							month: date.toLocaleString('default', { month: 'short' }),
							weekIndex
						});
					}
				} else {
					days.push(null);
				}
			}

			// Only add week if it has at least one day
			if (days.some((d) => d !== null)) {
				weeks.push({ days });
			}
		}

		return { year, weeks, monthLabels };
	}

	// Get all years and generate grids
	const years = $derived.by(() => {
		const uniqueYears = new SvelteSet<number>();
		dataArray.forEach((day) => {
			const year = new Date(day.date).getFullYear();
			uniqueYears.add(year);
		});
		return Array.from(uniqueYears).sort((a, b) => b - a);
	});

	const yearGrids = $derived.by(() => {
		return years.map((year) => generateYearGrid(year, dataMap, viewMode));
	});

	// Calculate aggregate stats
	const aggregateStats = $derived.by(() => {
		const yearStats = years.map((year) => {
			const yearData = dataArray.filter((d) => new Date(d.date).getFullYear() === year);
			const workouts = yearData.reduce((sum, d) => sum + d.count, 0);
			return { year, workouts };
		});

		const bestYear = yearStats.reduce(
			(best, current) => (current.workouts > best.workouts ? current : best),
			{
				year: 0,
				workouts: 0
			}
		);

		return { bestYear, yearCount: years.length };
	});

	// Legend labels per mode
	const legendLabels = $derived.by(() => {
		if (viewMode === 'hr') {
			return ['No HR', 'Low', 'Moderate', 'High', 'Peak'];
		} else if (viewMode === 'calories') {
			return ['No data', 'Low', 'Moderate', 'High', 'Max'];
		}
		return ['Rest', 'Light', 'Moderate', 'Heavy', 'Max'];
	});

	// CSS class prefix per mode
	const levelPrefix = $derived.by(() => {
		if (viewMode === 'hr') return 'level-hr-';
		if (viewMode === 'calories') return 'level-cal-';
		return 'level-';
	});

	// Tooltip state
	interface TooltipState {
		visible: boolean;
		x: number;
		y: number;
		date: string;
		count: number;
		volume: number;
		polar?: PolarDayData;
	}

	let tooltip = $state<TooltipState>({
		visible: false,
		x: 0,
		y: 0,
		date: '',
		count: 0,
		volume: 0
	});

	function showTooltip(event: MouseEvent, day: GridDay) {
		const rect = (event.target as SVGElement).getBoundingClientRect();
		tooltip = {
			visible: true,
			x: rect.left + rect.width / 2,
			y: rect.top - 10,
			date: day.date.toLocaleDateString('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			}),
			count: day.count,
			volume: day.volume,
			polar: day.polar
		};
	}

	function hideTooltip() {
		tooltip.visible = false;
	}

	function formatCardioLoad(interp: string | null | undefined): string {
		if (!interp || interp === 'NOT_AVAILABLE') return '';
		return interp.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	// SVG layout constants (will be adjusted via CSS for responsive)
	const CELL_SIZE = 11;
	const CELL_GAP = 3;
	const CELL_RADIUS = 2;
	const DAY_LABEL_WIDTH = 30;
	const MONTH_LABEL_HEIGHT = 20;

	function getSvgDimensions(grid: YearGrid) {
		const width = DAY_LABEL_WIDTH + grid.weeks.length * (CELL_SIZE + CELL_GAP);
		const height = MONTH_LABEL_HEIGHT + 7 * (CELL_SIZE + CELL_GAP);
		return { width, height };
	}
</script>

<div class="calendar-heatmap">
	<div class="header-row">
		<h3 class="section-title">Workout Calendar</h3>

		<div class="header-controls">
			<SegmentedControl
				options={viewOptions}
				value={viewMode}
				onchange={(v) => (viewMode = v as ViewMode)}
				size="sm"
				aria-label="Calendar view mode"
			/>

			<!-- Legend -->
			<div class="legend">
				<span class="legend-label">Less</span>
				<div class="legend-blocks">
					{#each [0, 1, 2, 3, 4] as level (level)}
						<div
							class="legend-block {levelPrefix}{level}"
							title={legendLabels[level]}
						></div>
					{/each}
				</div>
				<span class="legend-label">More</span>
			</div>
		</div>
	</div>

	<div class="heatmap-container">
		{#each yearGrids as grid (grid.year)}
			{@const dims = getSvgDimensions(grid)}
			<div class="year-section">
				<div class="year-header">{grid.year}</div>

				<svg
					class="heatmap-svg"
					viewBox="0 0 {dims.width} {dims.height}"
					preserveAspectRatio="xMinYMin meet"
				>
					<!-- Month labels -->
					{#each grid.monthLabels as { month, weekIndex } (weekIndex)}
						<text
							x={DAY_LABEL_WIDTH + weekIndex * (CELL_SIZE + CELL_GAP)}
							y={12}
							class="month-label"
						>
							{month}
						</text>
					{/each}

					<!-- Day labels (Mon, Wed, Fri) -->
					{#each ['Mon', 'Wed', 'Fri'] as day, i (day)}
						{@const dayIndex = i * 2 + 1}
						<text
							x={20}
							y={MONTH_LABEL_HEIGHT + dayIndex * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 + 4}
							class="day-label"
						>
							{day}
						</text>
					{/each}

					<!-- Grid cells -->
					{#each grid.weeks as week, weekIndex (weekIndex)}
						{#each week.days as day, dayIndex (`${weekIndex}-${dayIndex}`)}
							{#if day !== null}
								<rect
									x={DAY_LABEL_WIDTH + weekIndex * (CELL_SIZE + CELL_GAP)}
									y={MONTH_LABEL_HEIGHT + dayIndex * (CELL_SIZE + CELL_GAP)}
									width={CELL_SIZE}
									height={CELL_SIZE}
									rx={CELL_RADIUS}
									class="heatmap-cell {levelPrefix}{day.level}"
									class:has-hr={day.polar !== undefined}
									role="button"
									tabindex="0"
									aria-label="{day.date.toLocaleDateString()}: {day.count} workout{day.count !== 1
										? 's'
										: ''}"
									onmouseenter={(e) => showTooltip(e, day)}
									onmouseleave={hideTooltip}
								/>
							{/if}
						{/each}
					{/each}
				</svg>
			</div>
		{/each}
	</div>

	<!-- Insights -->
	<Callout variant="info" icon={BarChart3} borderAccent>
		<p>
			<strong>{aggregateStats.yearCount} years</strong> of training tracked. Best year:
			{aggregateStats.bestYear.year} with {aggregateStats.bestYear.workouts} workouts.
		</p>
	</Callout>
</div>

<!-- Tooltip -->
{#if tooltip.visible}
	<div class="tooltip" style="left: {tooltip.x}px; top: {tooltip.y}px;">
		<div class="tooltip-date">{tooltip.date}</div>
		{#if tooltip.count > 0}
			<div class="tooltip-data">
				{tooltip.count} workout{tooltip.count !== 1 ? 's' : ''}
				· {formatNumber(tooltip.volume)}
				{unitSystem.current === 'imperial' ? 'lbs' : 'kg'}
			</div>
		{/if}
		{#if tooltip.polar}
			<div class="tooltip-divider"></div>
			<div class="tooltip-data tooltip-hr">
				Avg HR {tooltip.polar.avgHr} · Max {tooltip.polar.maxHr} bpm
			</div>
			<div class="tooltip-data">
				{Math.round(tooltip.polar.kiloCalories)} kcal
				· {Math.round(tooltip.polar.durationMinutes)} min
				{#if tooltip.polar.cardioLoadInterpretation && tooltip.polar.cardioLoadInterpretation !== 'NOT_AVAILABLE'}
					· {formatCardioLoad(tooltip.polar.cardioLoadInterpretation)}
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.calendar-heatmap {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.header-row .section-title {
		margin-bottom: 0;
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		flex-wrap: wrap;
	}

	.heatmap-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		overflow-x: auto;
		padding: var(--space-2);
	}

	.year-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.year-header {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		color: var(--text-primary);
		letter-spacing: 0.05em;
	}

	.heatmap-svg {
		width: 100%;
		height: auto;
		max-width: 1200px;
	}

	/* SVG text elements */
	.month-label {
		font-family: var(--font-body);
		font-size: 10px;
		fill: var(--text-secondary);
		text-anchor: start;
	}

	.day-label {
		font-family: var(--font-body);
		font-size: 9px;
		fill: var(--text-muted);
		text-anchor: end;
	}

	/* Heatmap cells */
	.heatmap-cell {
		cursor: pointer;
		transition: opacity var(--transition-fast);
		stroke: var(--bg-primary);
		stroke-width: 1;
	}

	.heatmap-cell:hover {
		opacity: 0.8;
		stroke: var(--border-strong);
		stroke-width: 1.5;
	}

	/* HR indicator ring — copper border on cells with Polar data */
	.heatmap-cell.has-hr {
		stroke: var(--accent-copper);
		stroke-width: 1.5;
	}

	.heatmap-cell.has-hr:hover {
		stroke: var(--accent-copper-hover);
		stroke-width: 2;
	}

	/* Volume levels — fill for SVG rects, background-color for legend divs */
	.level-0 { fill: var(--heatmap-level-0); background-color: var(--heatmap-level-0); }
	.level-1 { fill: var(--heatmap-level-1); background-color: var(--heatmap-level-1); }
	.level-2 { fill: var(--heatmap-level-2); background-color: var(--heatmap-level-2); }
	.level-3 { fill: var(--heatmap-level-3); background-color: var(--heatmap-level-3); }
	.level-4 { fill: var(--heatmap-level-4); background-color: var(--heatmap-level-4); }

	/* HR levels */
	.level-hr-0 { fill: var(--heatmap-hr-level-0); background-color: var(--heatmap-hr-level-0); }
	.level-hr-1 { fill: var(--heatmap-hr-level-1); background-color: var(--heatmap-hr-level-1); }
	.level-hr-2 { fill: var(--heatmap-hr-level-2); background-color: var(--heatmap-hr-level-2); }
	.level-hr-3 { fill: var(--heatmap-hr-level-3); background-color: var(--heatmap-hr-level-3); }
	.level-hr-4 { fill: var(--heatmap-hr-level-4); background-color: var(--heatmap-hr-level-4); }

	/* Calories levels */
	.level-cal-0 { fill: var(--heatmap-cal-level-0); background-color: var(--heatmap-cal-level-0); }
	.level-cal-1 { fill: var(--heatmap-cal-level-1); background-color: var(--heatmap-cal-level-1); }
	.level-cal-2 { fill: var(--heatmap-cal-level-2); background-color: var(--heatmap-cal-level-2); }
	.level-cal-3 { fill: var(--heatmap-cal-level-3); background-color: var(--heatmap-cal-level-3); }
	.level-cal-4 { fill: var(--heatmap-cal-level-4); background-color: var(--heatmap-cal-level-4); }

	/* Legend */
	.legend {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.legend-label {
		font-size: var(--text-xs);
		color: var(--text-muted);
		font-family: var(--font-body);
	}

	.legend-blocks {
		display: flex;
		gap: 3px;
	}

	.legend-block {
		width: 15px;
		height: 15px;
		border-radius: 2px;
		border: 1px solid var(--bg-primary);
	}

	/* Tooltip */
	.tooltip {
		position: fixed;
		transform: translate(-50%, -100%);
		background: var(--chart-tooltip-bg);
		border: 1px solid var(--chart-tooltip-border);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-primary);
		pointer-events: none;
		z-index: var(--z-dropdown);
		box-shadow: var(--shadow-lg);
		white-space: nowrap;
		min-width: 160px;
	}

	.tooltip-date {
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--space-1);
	}

	.tooltip-data {
		color: var(--text-secondary);
		font-size: var(--text-xs);
		line-height: 1.5;
	}

	.tooltip-divider {
		border-top: 1px solid var(--chart-tooltip-border);
		margin: var(--space-2) 0 var(--space-1);
	}

	.tooltip-hr {
		color: var(--accent-copper);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.header-row {
			flex-direction: column;
			align-items: flex-start;
		}

		.header-controls {
			flex-direction: column;
			align-items: flex-start;
		}

		.heatmap-svg {
			max-width: 100%;
		}

		.year-header {
			font-size: var(--text-lg);
		}

		.month-label {
			font-size: 8px;
		}

		.day-label {
			font-size: 7px;
		}

		.legend-block {
			width: 9px;
			height: 9px;
		}
	}

	@media (max-width: 480px) {
		.day-label {
			display: none;
		}

		.legend-block {
			width: 7px;
			height: 7px;
		}

		.tooltip {
			font-size: var(--text-xs);
		}
	}
</style>
