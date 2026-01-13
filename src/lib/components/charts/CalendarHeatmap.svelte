<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
	import type { WorkoutCalendarDay } from '$lib/types/training';
	import { unitSystem } from '$lib/stores';
	import { formatNumber, formatDate } from '$lib/utils';
	import { Button } from '$lib/components/ui';

	interface Props {
		data: WorkoutCalendarDay[] | Record<string, Omit<WorkoutCalendarDay, 'date'>>;
	}

	let { data }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;
	let selectedYear = $state(2025);

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

	// Filter data for selected year
	const yearData = $derived.by(() => {
		return dataArray.filter((day) => {
			const year = new Date(day.date).getFullYear();
			return year === selectedYear;
		});
	});

	// Transform data for ECharts
	const chartData = $derived.by(() => {
		return yearData.map((day) => {
			const volume = unitSystem.current === 'imperial' ? day.volumeLbs : day.volumeKg;
			return [day.date, volume, day.count];
		});
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

		const option: echarts.EChartsOption = {
			tooltip: {
				formatter: (params: any) => {
					const date = params.data[0];
					const volume = params.data[1];
					const count = params.data[2];
					const unit = unitSystem.current === 'imperial' ? 'lbs' : 'kg';

					return `
						<div style="padding: 8px;">
							<div style="font-weight: bold; margin-bottom: 4px;">${formatDate(date)}</div>
							<div>${count} workout${count !== 1 ? 's' : ''}</div>
							<div>${formatNumber(volume)} ${unit}</div>
						</div>
					`;
				},
				backgroundColor: 'var(--bg-elevated)',
				borderColor: 'var(--bg-card)',
				textStyle: {
					color: 'var(--text-primary)'
				}
			},
			visualMap: {
				show: false,
				min: 0,
				max: 20000,
				calculable: false,
				orient: 'horizontal',
				left: 'center',
				bottom: 20,
				inRange: {
					color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
				},
				pieces: [
					{ min: 0, max: 0, color: '#ebedf0' },
					{ min: 1, max: 5000, color: '#c6e48b' },
					{ min: 5000, max: 10000, color: '#7bc96f' },
					{ min: 10000, max: 15000, color: '#239a3b' },
					{ min: 15000, color: '#196127' }
				]
			},
			calendar: {
				top: 20,
				left: 30,
				right: 30,
				cellSize: ['auto', 13],
				range: `${selectedYear}`,
				itemStyle: {
					borderWidth: 0.5,
					borderColor: 'var(--bg-deep)'
				},
				yearLabel: { show: false },
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
			},
			series: [
				{
					type: 'heatmap',
					coordinateSystem: 'calendar',
					data: chartData
				}
			]
		};

		chart.setOption(option);
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

	<!-- Year selector -->
	<div class="year-selector">
		{#each years as year}
			<Button
				variant={selectedYear === year ? 'default' : 'outline'}
				size="sm"
				onclick={() => (selectedYear = year)}
			>
				{year}
			</Button>
		{/each}
	</div>

	<!-- Chart container -->
	<div bind:this={chartContainer} class="chart-container"></div>

	<!-- Legend -->
	<div class="legend">
		<span class="legend-label">Less</span>
		<div class="legend-blocks">
			<div class="legend-block" style="background-color: #ebedf0;" title="No workouts"></div>
			<div class="legend-block" style="background-color: #c6e48b;" title="1-5K lbs"></div>
			<div class="legend-block" style="background-color: #7bc96f;" title="5-10K lbs"></div>
			<div class="legend-block" style="background-color: #239a3b;" title="10-15K lbs"></div>
			<div class="legend-block" style="background-color: #196127;" title="15K+ lbs"></div>
		</div>
		<span class="legend-label">More</span>
	</div>

	<!-- Insights -->
	<div class="insights">
		{#if selectedYear === 2021}
			<p class="insight-text">
				🔥 <strong>Best year ever!</strong> 2021 was your most consistent year with 220 workouts and 1.7M lbs
				volume.
			</p>
		{:else if selectedYear === 2020}
			<p class="insight-text">
				⚠️ Mid-year gap visible - likely COVID gym closures between June and September.
			</p>
		{:else}
			<p class="insight-text">
				📊 Training pattern shows strong preference for Monday and Friday workouts.
			</p>
		{/if}
	</div>
</div>

<style>
	.calendar-heatmap {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.section-title {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 1.5rem;
		color: var(--text-primary);
		letter-spacing: 0.05em;
	}

	.year-selector {
		display: flex;
		justify-content: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.chart-container {
		width: 100%;
		height: 200px;
		min-height: 200px;
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

	.insights {
		text-align: center;
		padding: var(--space-4);
		background: var(--bg-elevated);
		border-radius: var(--radius-md);
	}

	.insight-text {
		margin: 0;
		color: var(--text-secondary);
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.insight-text strong {
		color: var(--accent-copper);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.chart-container {
			height: 180px;
			min-height: 180px;
		}

		.legend {
			flex-wrap: wrap;
		}
	}

	@media (max-width: 480px) {
		.year-selector {
			justify-content: stretch;
		}

		.chart-container {
			height: 160px;
			min-height: 160px;
		}
	}
</style>
