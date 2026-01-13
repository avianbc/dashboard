<script lang="ts">
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';
	import type { PowerliftingTotals, BigThreeE1RM } from '$lib/types/training';
	import { unitSystem, theme } from '$lib/stores';
	import { formatNumber } from '$lib/utils';
	import { format, parse } from 'date-fns';

	interface Props {
		powerliftingTotals: PowerliftingTotals;
		bigThreeData: BigThreeE1RM;
	}

	let { powerliftingTotals, bigThreeData }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;

	$effect(() => {
		if (chart && theme.current && unitSystem.current) {
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

		// Calculate total at each point in time by combining the three lifts
		// We'll use the squat data as the timeline reference since it's likely most complete
		const squatData = bigThreeData.squat?.e1rmHistory || [];
		const benchData = bigThreeData.bench?.e1rmHistory || [];
		const deadliftData = bigThreeData.deadlift?.e1rmHistory || [];

		// Create a map of dates to e1rms for bench and deadlift
		const benchMap = new Map(benchData.map((d) => [d.date, isMetric ? d.e1rmKg : d.e1rmLbs]));
		const deadliftMap = new Map(
			deadliftData.map((d) => [d.date, isMetric ? d.e1rmKg : d.e1rmLbs])
		);

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
			title: {
				text: 'Powerlifting Total Progress',
				left: 'left',
				textStyle: {
					fontFamily: 'Bebas Neue, sans-serif',
					fontSize: 24,
					color: textColor
				},
				subtext: `Squat + Bench + Deadlift (e1RM)`,
				subtextStyle: {
					color: subtleColor,
					fontSize: 13
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
					const date = format(new Date(data.axisValue), 'MMM d, yyyy');
					return `<div style="padding: 4px;">
						<div style="font-weight: bold; margin-bottom: 4px;">${date}</div>
						<div>Total: ${formatNumber(data.value)} ${unit}</div>
					</div>`;
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '100px',
				containLabel: true
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

		chart.setOption(option);
	}
</script>

<div class="chart-wrapper">
	<div bind:this={chartContainer} class="chart-container"></div>
	<div class="chart-caption">
		<div class="clubs">
			<strong>Club Milestones Achieved:</strong>
			<div class="club-badges">
				{#each powerliftingTotals.clubs as club}
					<span class="badge">{club.name}</span>
				{/each}
			</div>
		</div>
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

	.clubs {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.club-badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.badge {
		display: inline-block;
		padding: var(--space-1) var(--space-3);
		background: var(--accent-gold);
		color: var(--bg-deep);
		border-radius: var(--radius-md);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
