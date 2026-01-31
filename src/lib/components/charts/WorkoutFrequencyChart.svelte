<script lang="ts">
	import { onMount } from 'svelte';
	import { echarts } from './echarts-setup';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import type { VolumeTimeSeries } from '$lib/types/training';
	import { theme } from '$lib/stores';
	import { getChartColors, createTooltipConfig, TOOLTIP_PADDING } from '$lib/utils';
	import { Callout } from '$lib/components/ui';
	import { Activity } from 'lucide-svelte';

	interface Props {
		data: VolumeTimeSeries;
	}

	let { data }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;

	// React to theme changes
	$effect(() => {
		theme.current;
		if (chart) {
			updateChart();
		}
	});

	onMount(() => {
		chart = echarts.init(chartContainer);
		updateChart();

		const handleResize = () => {
			chart.resize();
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			chart.dispose();
		};
	});

	function updateChart() {
		const isDark = theme.current === 'dark';
		const textColor = isDark ? '#f5f2eb' : '#1a1816';
		const subtleColor = isDark ? '#6b6560' : '#7a756e';

		const chartColors = getChartColors();

		// Use weekly data for frequency analysis
		const weeklyData = data.weekly;

		const option: echarts.EChartsOption = {
			backgroundColor: 'transparent',
			tooltip: {
				...createTooltipConfig(chartColors),
				formatter: (params: CallbackDataParams) => {
					const paramsArray = Array.isArray(params) ? params : [params];
					const data = paramsArray[0];
					const week = data.axisValue;
					const workouts = data.value;

					// Parse ISO week format for display
					const match = week.match(/(\d{4})-W(\d{2})/);
					const displayWeek = match ? `Week ${match[2]}, ${match[1]}` : week;

					return `<div style="padding: ${TOOLTIP_PADDING}px;">
						<div style="font-weight: bold; margin-bottom: 4px;">${displayWeek}</div>
						<div>${workouts} workout${workouts !== 1 ? 's' : ''}</div>
					</div>`;
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '3%'
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: weeklyData.map((d) => d.week),
				axisLabel: {
					color: subtleColor,
					interval: 'auto',
					formatter: (value: string) => {
						// Parse ISO week format (e.g., "2019-W03")
						const match = value.match(/(\d{4})-W(\d{2})/);
						if (!match) return value;

						const year = match[1];
						const weekNum = match[2];

						// Show year change or first week, otherwise just show every few weeks
						const showYear = weekNum === '01' || weekNum === '02';
						return showYear ? `W${weekNum} '${year.slice(2)}` : `W${weekNum}`;
					}
				},
				axisLine: {
					lineStyle: {
						color: isDark ? '#454238' : '#d4d0c8'
					}
				}
			},
			yAxis: {
				type: 'value',
				name: 'Workouts',
				nameTextStyle: {
					color: textColor
				},
				axisLabel: {
					color: subtleColor
				},
				axisLine: {
					lineStyle: {
						color: isDark ? '#454238' : '#d4d0c8'
					}
				},
				splitLine: {
					lineStyle: {
						color: isDark ? '#2d2926' : '#ebe7df',
						type: 'dashed'
					}
				},
				min: 0,
				max: (value: { max: number }) => Math.ceil(value.max * 1.1)
			},
			series: [
				{
					name: 'Workouts',
					type: 'bar',
					data: weeklyData.map((d) => d.workouts),
					itemStyle: {
						color: '#c17f59'
					},
					emphasis: {
						itemStyle: {
							color: '#d4936d'
						}
					},
					barWidth: '60%'
				}
			]
		};

		chart.setOption(option, { notMerge: true });
	}
</script>

<div class="chart-wrapper">
	<h3 class="section-title">Workout Frequency Over Time</h3>
	<div bind:this={chartContainer} class="chart-container"></div>
	<Callout variant="info" icon={Activity} borderAccent>
		<p>
			Training frequency patterns over 6+ years showing consistency, gaps, and comeback periods.
			Best weeks reached 6+ workouts during peak training phases.
		</p>
	</Callout>
</div>

<style>
	.chart-wrapper {
		width: 100%;
	}

	.section-title {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 1.5rem;
		color: var(--text-primary);
		letter-spacing: 0.05em;
		margin-bottom: var(--space-4);
	}

	.chart-container {
		width: 100%;
		height: 400px;
		margin-bottom: var(--space-4);
	}
</style>
