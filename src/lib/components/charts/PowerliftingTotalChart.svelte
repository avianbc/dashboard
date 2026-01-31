<script lang="ts">
	import { onMount } from 'svelte';
	import { echarts } from './echarts-setup';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import type { PowerliftingTotals, BigThreeE1RM } from '$lib/types/training';
	import { unitSystem, theme } from '$lib/stores';
	import { formatNumber, getChartColors, createTooltipConfig, TOOLTIP_PADDING } from '$lib/utils';
	import { Badge, Callout } from '$lib/components/ui';
	import { Trophy } from 'lucide-svelte';
	import { format } from 'date-fns';

	interface Props {
		powerliftingTotals: PowerliftingTotals;
		bigThreeData: BigThreeE1RM;
	}

	let { powerliftingTotals, bigThreeData }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;

	// React to theme and unit changes
	$effect(() => {
		theme.current;
		unitSystem.current;
		if (chart) {
			updateChart();
		}
	});

	onMount(() => {
		if (!chartContainer) {
			console.error('PowerliftingTotalChart: chartContainer not found');
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
			console.error('PowerliftingTotalChart init error:', error);
		}
	});

	function updateChart() {
		if (!chart || !bigThreeData || !powerliftingTotals) {
			console.error('PowerliftingTotalChart: Invalid chart or data', {
				chart: !!chart,
				bigThreeData: !!bigThreeData,
				powerliftingTotals: !!powerliftingTotals
			});
			return;
		}

		const isDark = theme.current === 'dark';
		const textColor = isDark ? '#f5f2eb' : '#1a1816';
		const subtleColor = isDark ? '#6b6560' : '#7a756e';
		const isMetric = unitSystem.current === 'metric';

		const chartColors = getChartColors();

		// Calculate total at each point in time by combining the three lifts
		// We'll use the squat data as the timeline reference since it's likely most complete
		const squatData = bigThreeData.squat?.e1rmHistory || [];
		const benchData = bigThreeData.bench?.e1rmHistory || [];
		const deadliftData = bigThreeData.deadlift?.e1rmHistory || [];

		// Create a map of dates to e1rms for bench and deadlift
		const benchMap = new Map(benchData.map((d) => [d.date, isMetric ? d.e1rmKg : d.e1rmLbs]));
		const deadliftMap = new Map(deadliftData.map((d) => [d.date, isMetric ? d.e1rmKg : d.e1rmLbs]));

		// For each squat entry, find the closest bench and deadlift e1rms
		const totalOverTime: { date: string; total: number }[] = [];
		let lastBenchE1rm = 0;
		let lastDeadliftE1rm = 0;

		squatData.forEach((squat) => {
			const squatE1rm = isMetric ? squat.e1rmKg : squat.e1rmLbs;

			// Update last known values if we have new data
			if (benchMap.has(squat.date)) {
				lastBenchE1rm = benchMap.get(squat.date)!;
			}
			if (deadliftMap.has(squat.date)) {
				lastDeadliftE1rm = deadliftMap.get(squat.date)!;
			}

			// Calculate total
			const total = squatE1rm + lastBenchE1rm + lastDeadliftE1rm;
			if (total > 0) {
				totalOverTime.push({
					date: squat.date,
					total: Math.round(total)
				});
			}
		});

		// Prepare club milestones
		const clubs = powerliftingTotals.clubs.map((club) => ({
			name: club.name,
			date: club.dateAchieved,
			value: isMetric ? Math.round(club.totalLbs * 0.453592) : club.totalLbs
		}));

		const unit = isMetric ? 'kg' : 'lbs';

		const option: echarts.EChartsOption = {
			backgroundColor: 'transparent',
			tooltip: {
				...createTooltipConfig(chartColors),
				formatter: (params: CallbackDataParams) => {
					const paramsArray = Array.isArray(params) ? params : [params];
					const data = paramsArray[0];
					const date = format(new Date(data.axisValue), 'MMM d, yyyy');
					return `<div style="padding: ${TOOLTIP_PADDING}px;">
						<div style="font-weight: bold; margin-bottom: 4px;">${date}</div>
						<div>Total: ${formatNumber(data.value)} ${unit}</div>
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
				data: totalOverTime.map((d) => d.date),
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
				name: `Total (${unit})`,
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
				}
			},
			series: [
				{
					name: 'Total',
					type: 'line',
					data: totalOverTime.map((d) => d.total),
					lineStyle: {
						color: '#d4a84b',
						width: 3
					},
					itemStyle: {
						color: '#d4a84b'
					},
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{
								offset: 0,
								color: 'rgba(212, 168, 75, 0.3)'
							},
							{
								offset: 1,
								color: 'rgba(212, 168, 75, 0.05)'
							}
						])
					},
					emphasis: {
						focus: 'series'
					},
					markLine: {
						silent: true,
						symbol: 'none',
						lineStyle: {
							type: 'dashed',
							width: 1,
							color: subtleColor
						},
						label: {
							position: 'insideEndTop',
							formatter: '{b}',
							color: textColor,
							fontSize: 11,
							backgroundColor: isDark ? '#2d2926' : '#ffffff',
							padding: [2, 4],
							borderRadius: 2
						},
						data: clubs.map((club) => ({
							name: club.name,
							yAxis: club.value
						}))
					}
				}
			]
		};

		chart.setOption(option, { notMerge: true });
	}
</script>

<div class="chart-wrapper">
	<h3 class="section-title">Powerlifting Total Progress</h3>
	<p class="section-subtitle">Squat + Bench + Deadlift (e1RM)</p>
	<div bind:this={chartContainer} class="chart-container"></div>
	<Callout variant="info" icon={Trophy} borderAccent>
		<div class="clubs">
			<strong>Club Milestones Achieved:</strong>
			<div class="club-badges">
				{#each powerliftingTotals.clubs as club (club.name)}
					<Badge variant="accent">{club.name}</Badge>
				{/each}
			</div>
		</div>
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
	}

	.section-subtitle {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-top: var(--space-1);
		margin-bottom: var(--space-4);
	}

	.chart-container {
		width: 100%;
		height: 400px;
		margin-bottom: var(--space-4);
	}

	.clubs strong {
		display: block;
		margin-bottom: var(--space-2);
	}

	.club-badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	@media (max-width: 768px) {
		.chart-container {
			height: 300px;
		}
	}
</style>
