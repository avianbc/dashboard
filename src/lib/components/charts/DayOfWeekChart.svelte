<script lang="ts">
	import { onMount } from 'svelte';
	import { echarts } from './echarts-setup';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import type { DayOfWeekStats } from '$lib/types/training';
	import { unitSystem, theme } from '$lib/stores';
	import { formatNumber, getChartColors, createTooltipConfig, TOOLTIP_PADDING } from '$lib/utils';

	interface Props {
		data: DayOfWeekStats[];
	}

	let { data }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;

	// React to theme and unit changes
	$effect(() => {
		if (chart && (theme.current || unitSystem.current)) {
			updateChart();
		}
	});

	onMount(() => {
		if (!chartContainer) {
			console.error('DayOfWeekChart: chartContainer not found');
			return;
		}

		try {
			chart = echarts.init(chartContainer);
			updateChart();

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
		} catch (error) {
			console.error('DayOfWeekChart init error:', error);
		}
	});

	function updateChart() {
		if (!chart || !data || !Array.isArray(data)) {
			console.error('DayOfWeekChart: Invalid chart or data', {
				chart: !!chart,
				data: Array.isArray(data)
			});
			return;
		}

		const isDark = theme.current === 'dark';
		const textColor = isDark ? '#f5f2eb' : '#1a1816';
		const subtleColor = isDark ? '#6b6560' : '#7a756e';
		const isMetric = unitSystem.current === 'metric';

		const chartColors = getChartColors();

		// Sort days in proper order (Monday first)
		const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		const sortedData = [...data].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

		const option: echarts.EChartsOption = {
			backgroundColor: 'transparent',
			tooltip: {
				...createTooltipConfig(chartColors),
				axisPointer: {
					type: 'shadow'
				},
				formatter: (params: CallbackDataParams) => {
					const paramsArray = Array.isArray(params) ? params : [params];
					const data = paramsArray[0];
					const dayData = sortedData[data.dataIndex];
					const volume = isMetric ? dayData.avgVolumeKg : dayData.avgVolumeLbs;
					const unit = isMetric ? 'kg' : 'lbs';
					return `<div style="padding: ${TOOLTIP_PADDING}px;">
						<div style="font-weight: bold; margin-bottom: 4px;">${dayData.day}</div>
						<div>${dayData.count} workouts</div>
						<div>Avg volume: ${formatNumber(Math.round(volume))} ${unit}</div>
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
				type: 'value',
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
				}
			},
			yAxis: {
				type: 'category',
				data: sortedData.map((d) => d.day.slice(0, 3)),
				axisLabel: {
					color: textColor,
					fontSize: 13,
					fontWeight: 500
				},
				axisLine: {
					lineStyle: {
						color: isDark ? '#454238' : '#d4d0c8'
					}
				}
			},
			series: [
				{
					name: 'Workouts',
					type: 'bar',
					data: sortedData.map((d) => d.count),
					itemStyle: {
						color: (params: CallbackDataParams) => {
							const colors = [
								'#c44536', // Monday - red
								'#c9a227', // Tuesday - amber
								'#4a8c5c', // Wednesday - green
								'#4a7c9b', // Thursday - blue
								'#c17f59', // Friday - copper
								'#a8a299', // Saturday - gray
								'#6b6560' // Sunday - muted
							];
							return colors[params.dataIndex];
						}
					},
					emphasis: {
						itemStyle: {
							opacity: 0.8
						}
					},
					label: {
						show: true,
						position: 'right',
						formatter: '{c}',
						color: textColor,
						fontSize: 12
					}
				}
			]
		};

		chart.setOption(option);
	}
</script>

<div class="chart-wrapper">
	<h3 class="section-title">Training by Day of Week</h3>
	<div bind:this={chartContainer} class="chart-container"></div>
	<div class="chart-caption">
		<p>
			You're a Monday/Friday lifter! You've trained on Saturday exactly once and never on Sunday.
			Clear training rhythm established throughout the week.
		</p>
	</div>
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
		height: 350px;
	}

	.chart-caption {
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--bg-card);
	}

	.chart-caption p {
		font-size: 0.875rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}
</style>
