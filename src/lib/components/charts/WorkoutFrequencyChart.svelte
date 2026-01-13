<script lang="ts">
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';
	import type { VolumeTimeSeries } from '$lib/types/training';
	import { unitSystem, theme } from '$lib/stores';

	interface Props {
		data: VolumeTimeSeries;
	}

	let { data }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;
	let currentTheme = $state('dark');
	let currentUnit = $state('imperial');

	$effect(() => {
		const unsubTheme = theme.subscribe((value) => {
			currentTheme = value;
			if (chart) {
				updateChart();
			}
		});
		return unsubTheme;
	});

	$effect(() => {
		const unsubUnit = unitSystem.subscribe((value) => {
			currentUnit = value;
			if (chart) {
				updateChart();
			}
		});
		return unsubUnit;
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
		const isDark = currentTheme === 'dark';
		const textColor = isDark ? '#f5f2eb' : '#1a1816';
		const subtleColor = isDark ? '#6b6560' : '#7a756e';

		// Use weekly data for frequency analysis
		const weeklyData = data.weekly;

		const option: echarts.EChartsOption = {
			backgroundColor: 'transparent',
			title: {
				text: 'Workout Frequency Over Time',
				left: 'left',
				textStyle: {
					fontFamily: 'Bebas Neue, sans-serif',
					fontSize: 24,
					color: textColor
				}
			},
			tooltip: {
				trigger: 'axis',
				backgroundColor: isDark ? '#2d2926' : '#ffffff',
				borderColor: isDark ? '#454238' : '#d4d0c8',
				textStyle: {
					color: textColor
				},
				formatter: (params: any) => {
					const data = params[0];
					const week = data.axisValue;
					const workouts = data.value;
					return `<div style="padding: 4px;">
						<div style="font-weight: bold; margin-bottom: 4px;">Week of ${week}</div>
						<div>${workouts} workout${workouts !== 1 ? 's' : ''}</div>
					</div>`;
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '80px',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: weeklyData.map((d) => d.week),
				axisLabel: {
					color: subtleColor,
					interval: 'auto',
					formatter: (value: string) => {
						const date = new Date(value);
						return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
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
				max: (value: any) => Math.ceil(value.max * 1.1)
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

		chart.setOption(option);
	}
</script>

<div class="chart-wrapper">
	<div bind:this={chartContainer} class="chart-container"></div>
	<div class="chart-caption">
		<p>
			Training frequency patterns over 6+ years showing consistency, gaps, and comeback periods. Best
			weeks reached 6+ workouts during peak training phases.
		</p>
	</div>
</div>

<style>
	.chart-wrapper {
		width: 100%;
	}

	.chart-container {
		width: 100%;
		height: 400px;
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
