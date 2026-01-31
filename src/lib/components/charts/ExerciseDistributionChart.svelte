<script lang="ts">
	import { echarts } from './echarts-setup';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { unitSystem, theme } from '$lib/stores';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import { getChartColors, createTooltipConfig, TOOLTIP_PADDING, liftColors } from '$lib/utils';
	import { Callout } from '$lib/components/ui';
	import type { ExerciseProgress } from '$lib/types/training';

	interface Props {
		data: Record<string, ExerciseProgress>;
	}

	let { data }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts | null = null;

	function isMobile(): boolean {
		return browser && window.innerWidth <= 768;
	}

	// React to unit system and theme changes
	$effect(() => {
		unitSystem.current;
		theme.current;
		if (chart && browser) {
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
		// Uses centralized lift colors from design tokens
		const nameLower = name.toLowerCase();

		if (nameLower.includes('squat')) return liftColors.squat;
		if (nameLower.includes('bench')) return liftColors.bench;
		if (nameLower.includes('deadlift')) return liftColors.deadlift;
		if (nameLower.includes('overhead')) return liftColors.ohp;
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

		const chartColors = getChartColors();
		const colors = chartData.map((item) => getExerciseColor(item.name));

		const option: echarts.EChartsOption = {
			tooltip: {
				...createTooltipConfig(chartColors, { trigger: 'item' }),
				formatter: (params: CallbackDataParams) => {
					const percent = ((params.value / totalVolume) * 100).toFixed(1);
					const volumeFormatted =
						params.value >= 1000000
							? (params.value / 1000000).toFixed(2) + 'M'
							: params.value >= 1000
								? (params.value / 1000).toFixed(0) + 'K'
								: params.value.toFixed(0);

					return `
						<div style="padding: ${TOOLTIP_PADDING}px;">
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
				orient: isMobile() ? 'horizontal' : 'vertical',
				...(isMobile()
					? { bottom: 10, left: 'center' }
					: { left: '55%', top: 'center' }),
				textStyle: {
					color: chartColors.textPrimary,
					fontFamily: 'Source Sans 3, sans-serif',
					fontSize: 13
				},
				itemGap: isMobile() ? 10 : 14,
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
					radius: ['40%', '65%'],
					center: isMobile() ? ['50%', '40%'] : ['27%', '50%'],
					avoidLabelOverlap: true,
					itemStyle: {
						borderRadius: 4,
						borderColor: chartColors.chartTooltipBg,
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
							color: chartColors.textPrimary,
							formatter: (params: CallbackDataParams) => {
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

		chart.setOption(option, { notMerge: true });
	}

	function handleResize() {
		if (chart) {
			chart.resize();
			updateChart(); // Re-apply options for responsive layout
		}
	}
</script>

<div class="chart-wrapper">
	<h3 class="section-title">Exercise Distribution</h3>
	<div bind:this={chartContainer} class="chart-container"></div>
	<Callout variant="info" borderAccent>
		<p>
			<strong>Big 4 compound lifts</strong> (Squat, Bench, Deadlift, OHP) account for
			<strong class="text-accent">89%</strong> of your total training volume.
		</p>
	</Callout>
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
