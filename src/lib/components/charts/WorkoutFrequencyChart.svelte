<script lang="ts">
	import { onMount } from 'svelte';
	import { echarts, type EChartsOption } from './echarts-setup';
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

	function aggregateToMonthly(weeklyData: Array<{ week: string; workouts: number }>) {
		const monthlyMap = new Map<string, number>();

		for (const week of weeklyData) {
			// Parse ISO week format (e.g., "2019-W03")
			const match = week.week.match(/(\d{4})-W(\d{2})/);
			if (!match) continue;

			const year = parseInt(match[1]);
			const weekNum = parseInt(match[2]);

			// Approximate month from week number (rough but effective)
			const month = Math.min(11, Math.floor((weekNum - 1) / 4.33));
			const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

			monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + week.workouts);
		}

		// Get all month keys and find the range
		const sortedKeys = Array.from(monthlyMap.keys()).sort();
		if (sortedKeys.length === 0) return [];

		const startKey = sortedKeys[0];
		const endKey = sortedKeys[sortedKeys.length - 1];

		// Generate all months from start to end, filling gaps with zeros
		const result: Array<{ month: string; workouts: number }> = [];
		let [currentYear, currentMonth] = startKey.split('-').map(Number);
		const [endYear, endMonth] = endKey.split('-').map(Number);

		while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
			const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
			result.push({
				month: monthKey,
				workouts: monthlyMap.get(monthKey) || 0
			});

			// Move to next month
			currentMonth++;
			if (currentMonth > 12) {
				currentMonth = 1;
				currentYear++;
			}
		}

		return result;
	}

	function calculateMovingAverage(data: number[], windowSize: number): (number | null)[] {
		return data.map((_, index) => {
			if (index < windowSize - 1) return null;
			const window = data.slice(index - windowSize + 1, index + 1);
			return window.reduce((sum, val) => sum + val, 0) / windowSize;
		});
	}

	function formatMonth(monthKey: string): string {
		const [year, month] = monthKey.split('-');
		const monthNames = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];
		return `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`;
	}

	function updateChart() {
		const isDark = theme.current === 'dark';
		const textColor = isDark ? '#f5f2eb' : '#1a1816';
		const subtleColor = isDark ? '#6b6560' : '#7a756e';

		const chartColors = getChartColors();

		// Aggregate weekly data to monthly for cleaner visualization
		const monthlyData = aggregateToMonthly(data.weekly);
		const workoutValues = monthlyData.map((d) => d.workouts);
		const movingAvg = calculateMovingAverage(workoutValues, 3);

		const option: EChartsOption = {
			backgroundColor: 'transparent',
			tooltip: {
				...createTooltipConfig(chartColors),
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
					const paramsArray = Array.isArray(params) ? params : [params];
					const monthData = paramsArray[0];
					const avgData = paramsArray.find((p) => p.seriesName === '3-Month Avg');

					const monthKey =
						(monthData as CallbackDataParams & { axisValue?: string }).axisValue || '';
					const workouts = monthData.value as number;
					const avg = avgData?.value as number | undefined;

					return `<div style="padding: ${TOOLTIP_PADDING}px;">
						<div style="font-weight: bold; margin-bottom: 4px;">${formatMonth(monthKey)}</div>
						<div style="display: flex; align-items: center; gap: 6px;">
							<span style="display: inline-block; width: 10px; height: 10px; background: #c17f59; border-radius: 2px;"></span>
							${workouts} workout${workouts !== 1 ? 's' : ''}
						</div>
						${
							avg !== undefined && avg !== null
								? `<div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
							<span style="display: inline-block; width: 10px; height: 2px; background: #7c9885;"></span>
							Avg: ${avg.toFixed(1)}/month
						</div>`
								: ''
						}
					</div>`;
				}
			},
			legend: {
				show: true,
				top: 0,
				right: 0,
				textStyle: {
					color: textColor
				},
				data: ['Workouts', '3-Month Avg']
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '10%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				boundaryGap: true,
				data: monthlyData.map((d) => d.month),
				axisLabel: {
					color: subtleColor,
					interval: (index: number) => {
						// Show label every 3 months, and always on January
						const month = monthlyData[index]?.month;
						if (!month) return false;
						const monthNum = parseInt(month.split('-')[1]);
						return monthNum === 1 || monthNum === 7; // Jan and Jul
					},
					formatter: (value: string) => formatMonth(value)
				},
				axisLine: {
					lineStyle: {
						color: isDark ? '#454238' : '#d4d0c8'
					}
				},
				axisTick: {
					alignWithLabel: true
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
					data: workoutValues,
					itemStyle: {
						color: '#c17f59',
						borderRadius: [2, 2, 0, 0]
					},
					emphasis: {
						itemStyle: {
							color: '#d4936d'
						}
					},
					barMaxWidth: 20
				},
				{
					name: '3-Month Avg',
					type: 'line',
					data: movingAvg,
					smooth: true,
					symbol: 'none',
					lineStyle: {
						color: '#7c9885',
						width: 2
					},
					emphasis: {
						lineStyle: {
							width: 3
						}
					}
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
			Monthly training volume over 6+ years with a 3-month moving average trend line. Clear
			visualization of consistency periods, gaps, and training intensity phases.
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

	@media (max-width: 768px) {
		.chart-container {
			height: 300px;
		}
	}
</style>
