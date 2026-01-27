<script lang="ts">
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import type { WorkoutCalendarDay } from '$lib/types/training';
	import { unitSystem } from '$lib/stores';
	import { formatNumber } from '$lib/utils';
	import { Callout } from '$lib/components/ui';
	import { BarChart3 } from 'lucide-svelte';

	interface Props {
		data: WorkoutCalendarDay[] | Record<string, Omit<WorkoutCalendarDay, 'date'>>;
	}

	let { data }: Props = $props();

	interface GridDay {
		date: Date;
		volume: number;
		count: number;
		level: number;
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
		const map = new Map<string, { volumeLbs: number; volumeKg: number; count: number }>();
		dataArray.forEach((day) => {
			map.set(day.date, {
				volumeLbs: day.volumeLbs,
				volumeKg: day.volumeKg,
				count: day.count
			});
		});
		return map;
	});

	// Calculate dynamic thresholds based on quartiles
	function calculateThresholds(data: WorkoutCalendarDay[]): number[] {
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

	const thresholds = $derived(calculateThresholds(dataArray));

	// Get level (0-4) based on volume
	function getLevel(volume: number, thresholds: number[]): number {
		if (volume === 0) return 0;
		if (volume <= thresholds[1]) return 1;
		if (volume <= thresholds[2]) return 2;
		if (volume <= thresholds[3]) return 3;
		return 4;
	}

	// Generate year grid structure
	function generateYearGrid(year: number, dataMap: Map<string, { volumeLbs: number; volumeKg: number; count: number }>): YearGrid {
		const weeks: WeekRow[] = [];
		const monthLabels: { month: string; weekIndex: number }[] = [];

		// Find first Sunday on or before Jan 1
		const jan1 = new Date(year, 0, 1);
		const dayOfWeek = jan1.getDay();
		const firstSunday = new Date(jan1);
		firstSunday.setDate(jan1.getDate() - dayOfWeek);

		// Generate 53 weeks (covers full year)
		let currentMonth = -1;
		for (let weekIndex = 0; weekIndex < 53; weekIndex++) {
			const days: (GridDay | null)[] = [];

			for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
				const date = new Date(firstSunday);
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
					const level = getLevel(volume, thresholds);

					days.push({ date, volume, count, level });

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
		const uniqueYears = new Set<number>();
		dataArray.forEach((day) => {
			const year = new Date(day.date).getFullYear();
			uniqueYears.add(year);
		});
		return Array.from(uniqueYears).sort((a, b) => b - a);
	});

	const yearGrids = $derived.by(() => {
		return years.map((year) => generateYearGrid(year, dataMap));
	});

	// Calculate aggregate stats
	const aggregateStats = $derived.by(() => {
		const yearStats = years.map((year) => {
			const yearData = dataArray.filter((d) => new Date(d.date).getFullYear() === year);
			const workouts = yearData.reduce((sum, d) => sum + d.count, 0);
			return { year, workouts };
		});

		const bestYear =
			yearStats.reduce((best, current) => (current.workouts > best.workouts ? current : best), {
				year: 0,
				workouts: 0
			});

		return { bestYear, yearCount: years.length };
	});

	// Tooltip state
	let tooltip = $state<{
		visible: boolean;
		x: number;
		y: number;
		date: string;
		count: number;
		volume: number;
	}>({ visible: false, x: 0, y: 0, date: '', count: 0, volume: 0 });

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
			volume: day.volume
		};
	}

	function hideTooltip() {
		tooltip.visible = false;
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

		<!-- Legend -->
		<div class="legend">
			<span class="legend-label">Less</span>
			<div class="legend-blocks">
				<div class="legend-block level-0" title="No activity"></div>
				<div class="legend-block level-1" title="Light"></div>
				<div class="legend-block level-2" title="Medium"></div>
				<div class="legend-block level-3" title="High"></div>
				<div class="legend-block level-4" title="Max"></div>
			</div>
			<span class="legend-label">More</span>
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
									class="heatmap-cell level-{day.level}"
									role="button"
									tabindex="0"
									aria-label="{day.date.toLocaleDateString()}: {day.count} workout{day.count !== 1 ? 's' : ''}"
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
	<Callout variant="info" icon={BarChart3} centered>
		<p>
			<strong>{aggregateStats.yearCount} years</strong> of training tracked. Best year:
			{aggregateStats.bestYear.year} with {aggregateStats.bestYear.workouts} workouts.
		</p>
	</Callout>
</div>

<!-- Tooltip -->
{#if tooltip.visible}
	<div
		class="tooltip"
		style="left: {tooltip.x}px; top: {tooltip.y}px;"
	>
		<div class="tooltip-date">{tooltip.date}</div>
		<div class="tooltip-data">
			{tooltip.count} workout{tooltip.count !== 1 ? 's' : ''}
		</div>
		<div class="tooltip-data">
			{formatNumber(tooltip.volume)}
			{unitSystem.current === 'imperial' ? 'lbs' : 'kg'}
		</div>
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

	.heatmap-cell.level-0 {
		fill: var(--heatmap-level-0);
	}

	.heatmap-cell.level-1 {
		fill: var(--heatmap-level-1);
	}

	.heatmap-cell.level-2 {
		fill: var(--heatmap-level-2);
	}

	.heatmap-cell.level-3 {
		fill: var(--heatmap-level-3);
	}

	.heatmap-cell.level-4 {
		fill: var(--heatmap-level-4);
	}

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

	.legend-block.level-0 {
		background-color: var(--heatmap-level-0);
	}

	.legend-block.level-1 {
		background-color: var(--heatmap-level-1);
	}

	.legend-block.level-2 {
		background-color: var(--heatmap-level-2);
	}

	.legend-block.level-3 {
		background-color: var(--heatmap-level-3);
	}

	.legend-block.level-4 {
		background-color: var(--heatmap-level-4);
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
	}

	.tooltip-date {
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--space-1);
	}

	.tooltip-data {
		color: var(--text-secondary);
		font-size: var(--text-xs);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.header-row {
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
