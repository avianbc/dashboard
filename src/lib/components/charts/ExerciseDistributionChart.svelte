<script lang="ts">
	import { echarts } from './echarts-setup';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { unitSystem } from '$lib/stores';
	import { formatNumber } from '$lib/utils';
	import type { ExerciseProgress } from '$lib/types/training';

	interface Props {
		data: Record<string, ExerciseProgress>;
	}

	let { data }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts | null = null;

	// Subscribe to unit system changes
	$effect(() => {
		if (chart && browser && unitSystem.current) {
			updateChart();
		}
	});

	onMount(() => {
		if (browser) {
			initChart();
			window.addEventListener('resize', handleResize);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', handleResize);
			if (chart) {
				chart.dispose();
			}
		}
	});

	function processData() {
		// Sort exercises by volume
		const exercises = Object.entries(data)
			.map(([name, exerciseData]) => ({
				name,
				volumeLbs: exerciseData.totalVolumeLbs,
				volumeKg: exerciseData.totalVolumeKg
			}))
			.sort((a, b) => b.volumeLbs - a.volumeLbs);

		const totalVolume =
			unitSystem.current === 'imperial'
				? exercises.reduce((sum, ex) => sum + ex.volumeLbs, 0)
				: exercises.reduce((sum, ex) => sum + ex.volumeKg, 0);

		// Take top 6 exercises and group the rest
		const topExercises = exercises.slice(0, 6);
		const othersExercises = exercises.slice(6);

		const othersVolume =
			unitSystem.current === 'imperial'
				? othersExercises.reduce((sum, ex) => sum + ex.volumeLbs, 0)
				: othersExercises.reduce((sum, ex) => sum + ex.volumeKg, 0);

		const chartData = topExercises.map((ex) => ({
			name: ex.name,
			value: unitSystem.current === 'imperial' ? ex.volumeLbs : ex.volumeKg
		}));

		if (othersVolume > 0) {
			chartData.push({
				name: `Others (${othersExercises.length})`,
				value: othersVolume
			});
		}

		return { chartData, totalVolume };
	}

	function getExerciseColor(name: string): string {
		// Color mapping based on exercise type
		// Using actual color values from design spec (PLAN.md)
		const nameLower = name.toLowerCase();

		if (nameLower.includes('squat')) return '#c44536'; // Deep red
		if (nameLower.includes('bench')) return '#4a7c9b'; // Steel blue
		if (nameLower.includes('deadlift')) return '#4a8c5c'; // Forest green
		if (nameLower.includes('overhead')) return '#c9a227'; // Amber
		if (nameLower.includes('row')) return '#8b5a3c'; // Brown for rows
		if (nameLower.includes('incline')) return '#5a8bb0'; // Lighter blue for incline
		if (nameLower.includes('curl')) return '#6b4e71'; // Purple for curls
		if (nameLower.includes('others')) return '#6b6560'; // Muted gray
		return '#c17f59'; // Default copper accent
	}

	function initChart() {
		if (!chartContainer) return;

		chart = echarts.init(chartContainer);
		updateChart();
	}

	function updateChart() {
		if (!chart) return;

		const { chartData, totalVolume } = processData();
		const unit = unitSystem.current === 'imperial' ? 'lbs' : 'kg';

		const colors = chartData.map((item) => getExerciseColor(item.name));

		const option: echarts.EChartsOption = {
			tooltip: {
				trigger: 'item',
				backgroundColor: '#252220',
				borderColor: '#2d2926',
				borderWidth: 1,
				textStyle: {
					color: '#f5f2eb',
					fontFamily: 'Source Sans 3, sans-serif'
				},
				formatter: (params: any) => {
					const percent = ((params.value / totalVolume) * 100).toFixed(1);
					const volumeFormatted =
						params.value >= 1000000
							? (params.value / 1000000).toFixed(2) + 'M'
							: params.value >= 1000
								? (params.value / 1000).toFixed(0) + 'K'
								: params.value.toFixed(0);

					return `
						<div style="padding: 8px;">
							<div style="font-weight: 600; margin-bottom: 4px; color: ${params.color};">
								${params.name}
							</div>
							<div style="font-family: 'JetBrains Mono', monospace; font-size: 14px;">
								${volumeFormatted} ${unit}
							</div>
							<div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">
								${percent}% of total volume
							</div>
						</div>
					`;
				}
			},
			legend: {
				orient: 'vertical',
				right: 10,
				top: '10%',
				textStyle: {
					color: '#f5f2eb',
					fontFamily: 'Source Sans 3, sans-serif',
					fontSize: 13
				},
				formatter: (name: string) => {
					const item = chartData.find((d) => d.name === name);
					if (!item) return name;
					const percent = ((item.value / totalVolume) * 100).toFixed(1);
					return `${name} (${percent}%)`;
				}
			},
			series: [
				{
					type: 'pie',
					radius: ['45%', '70%'],
					center: ['40%', '55%'],
					avoidLabelOverlap: true,
					itemStyle: {
						borderRadius: 4,
						borderColor: '#0f0e0d',
						borderWidth: 2
					},
					label: {
						show: false
					},
					emphasis: {
						label: {
							show: true,
							fontSize: 16,
							fontWeight: 'bold',
							fontFamily: 'JetBrains Mono, monospace',
							color: '#f5f2eb',
							formatter: (params: any) => {
								const percent = ((params.value / totalVolume) * 100).toFixed(1);
								return `${percent}%`;
							}
						},
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					},
					data: chartData,
					color: colors
				}
			]
		};

		chart.setOption(option);
	}

	function handleResize() {
		if (chart) {
			chart.resize();
		}
	}
</script>

<div class="chart-wrapper">
	<h3 class="section-title">Exercise Distribution</h3>
	<div bind:this={chartContainer} class="chart-container"></div>
	<div class="chart-insight">
		<p class="text-secondary">
			<strong>Big 4 compound lifts</strong> (Squat, Bench, Deadlift, OHP) account for
			<strong class="text-accent">89%</strong> of your total training volume.
		</p>
	</div>
</div>

<style>
	.chart-wrapper {
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

	.chart-container {
		width: 100%;
		height: 500px;
		min-height: 400px;
	}

	.chart-insight {
		padding: var(--space-4);
		background: var(--bg-elevated);
		border-radius: var(--radius-md);
		border-left: 3px solid var(--accent-copper);
	}

	.chart-insight p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.text-accent {
		color: var(--accent-copper);
		font-family: 'JetBrains Mono', monospace;
	}

	@media (max-width: 768px) {
		.chart-container {
			height: 400px;
		}
	}

	@media (max-width: 480px) {
		.chart-container {
			height: 350px;
		}
	}
</style>
