<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { echarts } from './echarts-setup';
	import type { WorkoutCalendarDay } from '$lib/types/training';
	import { unitSystem, theme } from '$lib/stores';
	import { formatNumber, formatDate, getChartColors, createTooltipConfig, TOOLTIP_PADDING } from '$lib/utils';
	import { Callout } from '$lib/components/ui';
	import { BarChart3 } from 'lucide-svelte';

	interface Props {
		data: WorkoutCalendarDay[] | Record<string, Omit<WorkoutCalendarDay, 'date'>>;
	}

	let { data }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;

	// Convert data to array if it's an object
	const dataArray = $derived.by(() => {
		if (Array.isArray(data)) {
			return data;
		}
		// Convert object to array
		return Object.entries(data).map(([date, values]) => ({
			date,
			...values
		}));
	});

	// Get available years from data
	const years = $derived.by(() => {
		const uniqueYears = new Set<number>();
		dataArray.forEach((day) => {
			const year = new Date(day.date).getFullYear();
			uniqueYears.add(year);
		});
		return Array.from(uniqueYears).sort((a, b) => b - a); // Sort descending (newest first)
	});

	// Transform data grouped by year
	const chartDataByYear = $derived.by(() => {
		const grouped: Record<number, [string, number, number][]> = {};
		dataArray.forEach((day) => {
			const year = new Date(day.date).getFullYear();
			const volume = unitSystem.current === 'imperial' ? day.volumeLbs : day.volumeKg;
			if (!grouped[year]) grouped[year] = [];
			grouped[year].push([day.date, volume, day.count]);
		});
		return grouped;
	});

	// Layout constants
	const CALENDAR_HEIGHT = 160;
	const CALENDAR_GAP = 30;
	const FIRST_TOP = 50;

	// Calculate dynamic container height
	const containerHeight = $derived(
		FIRST_TOP + (years.length * CALENDAR_HEIGHT) + ((years.length - 1) * CALENDAR_GAP) + 50
	);

	// Generate dynamic calendar configurations
	const calendars = $derived.by(() => {
		return years.map((year, index) => ({
			top: FIRST_TOP + (index * (CALENDAR_HEIGHT + CALENDAR_GAP)),
			left: 100,
			right: 30,
			cellSize: ['auto', 13],
			range: `${year}`,
			itemStyle: {
				color: 'transparent',
				borderWidth: 0.5,
				borderColor: 'var(--bg-deep)'
			},
			yearLabel: {
				show: true,
				position: 'left',
				margin: 45,
				color: 'var(--text-primary)',
				fontSize: 16,
				fontWeight: 'bold'
			},
			dayLabel: {
				firstDay: 0, // Sunday
				nameMap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
				color: 'var(--text-muted)',
				fontSize: 12
			},
			monthLabel: {
				color: 'var(--text-secondary)',
				fontSize: 12
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: 'var(--bg-elevated)',
					width: 1,
					type: 'solid'
				}
			}
		}));
	});

	// Generate dynamic series
	const series = $derived.by(() => {
		return years.map((year, index) => ({
			type: 'heatmap',
			coordinateSystem: 'calendar',
			calendarIndex: index,
			data: chartDataByYear[year] || []
		}));
	});

	// Calculate aggregate stats
	const aggregateStats = $derived.by(() => {
		let bestYear = { year: 0, workouts: 0 };
		years.forEach(year => {
			const workouts = chartDataByYear[year]?.reduce((sum, d) => sum + d[2], 0) || 0;
			if (workouts > bestYear.workouts) bestYear = { year, workouts };
		});
		return { bestYear, yearCount: years.length };
	});

	// Get color based on volume
	function getColor(volumeLbs: number): string {
		if (volumeLbs === 0) return '#ebedf0';
		if (volumeLbs < 5000) return '#c6e48b';
		if (volumeLbs < 10000) return '#7bc96f';
		if (volumeLbs < 15000) return '#239a3b';
		return '#196127';
	}

	// Initialize and update chart
	$effect(() => {
		if (!chartContainer) return;

		if (!chart) {
			chart = echarts.init(chartContainer);
		}

		const chartColors = getChartColors();

		const option: echarts.EChartsOption = {
			tooltip: {
				...createTooltipConfig(chartColors, { trigger: 'item' }),
				formatter: (params: any) => {
					const date = params.data[0];
					const volume = params.data[1];
					const count = params.data[2];
					const unit = unitSystem.current === 'imperial' ? 'lbs' : 'kg';

					return `
						<div style="padding: ${TOOLTIP_PADDING}px;">
							<div style="font-weight: bold; margin-bottom: 4px;">${formatDate(date)}</div>
							<div>${count} workout${count !== 1 ? 's' : ''}</div>
							<div>${formatNumber(volume)} ${unit}</div>
						</div>
					`;
				}
			},
			visualMap: {
				show: false,
				type: 'piecewise',
				min: 0,
				max: 20000,
				calculable: false,
				orient: 'horizontal',
				left: 'center',
				bottom: 20,
				dimension: 1,
				seriesIndex: years.map((_, i) => i),
				inRange: {
					color: ['transparent', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
				},
				pieces: [
					{ min: 0, max: 0, color: 'transparent', label: '0' },
					{ min: 0.01, max: 5000, color: '#c6e48b', label: '1-5K' },
					{ min: 5000.01, max: 10000, color: '#7bc96f', label: '5-10K' },
					{ min: 10000.01, max: 15000, color: '#239a3b', label: '10-15K' },
					{ min: 15000.01, color: '#196127', label: '15K+' }
				]
			},
			calendar: calendars,
			series: series
		};

		chart.setOption(option, true);
	});

	// Handle resize
	onMount(() => {
		const handleResize = () => {
			if (chart) {
				chart.resize();
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			if (chart) {
				chart.dispose();
			}
		};
	});

	onDestroy(() => {
		if (chart) {
			chart.dispose();
		}
	});
</script>

<div class="calendar-heatmap">
	<h3 class="section-title">Workout Calendar</h3>

	<!-- Chart container -->
	<div bind:this={chartContainer} class="chart-container" style="height: {containerHeight}px;"></div>

	<!-- Legend -->
	<div class="legend">
		<span class="legend-label">Less</span>
		{#if theme.isDark}
			<!-- Dark mode: dark to light (less visible to more visible) -->
			<div class="legend-blocks">
				<div class="legend-block legend-empty" title="No workouts"></div>
				<div class="legend-block legend-max" title="15K+ lbs"></div>
				<div class="legend-block legend-heavy" title="10-15K lbs"></div>
				<div class="legend-block legend-medium" title="5-10K lbs"></div>
				<div class="legend-block legend-light" title="1-5K lbs"></div>
			</div>
		{:else}
			<!-- Light mode: light to dark (less visible to more visible) -->
			<div class="legend-blocks">
				<div class="legend-block legend-empty" title="No workouts"></div>
				<div class="legend-block legend-light" title="1-5K lbs"></div>
				<div class="legend-block legend-medium" title="5-10K lbs"></div>
				<div class="legend-block legend-heavy" title="10-15K lbs"></div>
				<div class="legend-block legend-max" title="15K+ lbs"></div>
			</div>
		{/if}
		<span class="legend-label">More</span>
	</div>

	<!-- Insights -->
	<Callout variant="info" icon={BarChart3} centered>
		<p><strong>{aggregateStats.yearCount} years</strong> of training tracked. Best year: {aggregateStats.bestYear.year} with {aggregateStats.bestYear.workouts} workouts.</p>
	</Callout>
</div>

<style>
	.calendar-heatmap {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.chart-container {
		width: 100%;
		min-height: 400px;
	}

	.legend {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-2);
	}

	.legend-label {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-family: 'Source Sans 3', sans-serif;
	}

	.legend-blocks {
		display: flex;
		gap: 2px;
	}

	.legend-block {
		width: 12px;
		height: 12px;
		border: 0.5px solid var(--bg-deep);
		cursor: help;
	}

	.legend-empty {
		background-color: transparent;
		border: 1px solid var(--text-muted);
	}

	.legend-light {
		background-color: #c6e48b;
	}

	.legend-medium {
		background-color: #7bc96f;
	}

	.legend-heavy {
		background-color: #239a3b;
	}

	.legend-max {
		background-color: #196127;
	}


	/* Responsive adjustments */
	@media (max-width: 768px) {
		.chart-container {
			max-height: 600px;
			overflow-y: auto;
		}

		.legend {
			flex-wrap: wrap;
		}
	}

	@media (max-width: 480px) {
		.chart-container {
			max-height: 500px;
		}
	}
</style>
