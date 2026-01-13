<script lang="ts">
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';
	import type { RelativeStrength, BodyWeight } from '$lib/types/training';
	import { theme } from '$lib/stores';
	import { format, parse } from 'date-fns';

	interface Props {
		relativeStrength: RelativeStrength;
		bodyWeight: BodyWeight;
	}

	let { relativeStrength, bodyWeight }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;

	$effect(() => {
		if (chart && theme.current) {
			updateChart();
		}
	});

	onMount(() => {
		if (!chartContainer) {
			console.error('RelativeStrengthChart: chartContainer not found');
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
			console.error('RelativeStrengthChart init error:', error);
		}
	});

	function updateChart() {
		if (!chart || !relativeStrength) {
			console.error('RelativeStrengthChart: Invalid chart or data', {
				chart: !!chart,
				relativeStrength: !!relativeStrength
			});
			return;
		}

		const isDark = theme.current === 'dark';
		const textColor = isDark ? '#f5f2eb' : '#1a1816';
		const subtleColor = isDark ? '#6b6560' : '#7a756e';

		// Combine monthly progression data for all lifts
		const squatData = relativeStrength.squat?.monthlyProgression || [];
		const benchData = relativeStrength.bench?.monthlyProgression || [];
		const deadliftData = relativeStrength.deadlift?.monthlyProgression || [];

		// Use squat progression as the baseline (likely most complete)
		const months = squatData.map((d) => d.month);

		const option: echarts.EChartsOption = {
			backgroundColor: 'transparent',
			legend: {
				data: ['Squat', 'Bench', 'Deadlift'],
				top: 10,
				textStyle: {
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
					const month = params[0].axisValue;
					let content = `<div style="padding: 4px;"><div style="font-weight: bold; margin-bottom: 4px;">${month}</div>`;
					params.forEach((param: any) => {
						content += `<div>${param.marker} ${param.seriesName}: ${param.value.toFixed(2)}× BW</div>`;
					});
					content += '</div>';
					return content;
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '15%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: months,
				axisLabel: {
					color: subtleColor,
					interval: 'auto',
					formatter: (value: string) => {
						const parts = value.split('-');
						return `${parts[1]}/${parts[0].slice(2)}`;
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
				name: 'BW Multiple',
				nameTextStyle: {
					color: textColor
				},
				axisLabel: {
					color: subtleColor,
					formatter: '{value}×'
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
					name: 'Squat',
					type: 'line',
					data: squatData.map((d) => d.bwMultiple),
					lineStyle: {
						color: '#c44536',
						width: 2
					},
					itemStyle: {
						color: '#c44536'
					},
					emphasis: {
						focus: 'series'
					}
				},
				{
					name: 'Bench',
					type: 'line',
					data: benchData.map((d) => d.bwMultiple),
					lineStyle: {
						color: '#4a7c9b',
						width: 2
					},
					itemStyle: {
						color: '#4a7c9b'
					},
					emphasis: {
						focus: 'series'
					}
				},
				{
					name: 'Deadlift',
					type: 'line',
					data: deadliftData.map((d) => d.bwMultiple),
					lineStyle: {
						color: '#4a8c5c',
						width: 2
					},
					itemStyle: {
						color: '#4a8c5c'
					},
					emphasis: {
						focus: 'series'
					}
				}
			]
		};

		chart.setOption(option);
	}
</script>

<div class="chart-wrapper">
	<h3 class="section-title">Relative Strength Over Time</h3>
	<p class="section-subtitle">Strength-to-bodyweight ratio (e1RM / BW)</p>
	<div bind:this={chartContainer} class="chart-container"></div>
	<div class="chart-caption">
		<div class="stats">
			<div class="stat-row">
				<strong>Best Relative Strength:</strong>
				<span class="highlight"
					>{relativeStrength.squat.best.multiple.toFixed(2)}× BW Squat</span
				>
			</div>
			<div class="stat-row">
				<strong>Current:</strong>
				<span
					>Squat: {relativeStrength.squat.current.multiple.toFixed(2)}×, Bench: {relativeStrength.bench.current.multiple.toFixed(
						2
					)}×, Deadlift: {relativeStrength.deadlift.current.multiple.toFixed(2)}×</span
				>
			</div>
		</div>
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
	}

	.chart-caption {
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--bg-card);
	}

	.stats {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.stat-row {
		margin-bottom: var(--space-2);
	}

	.stat-row:last-child {
		margin-bottom: 0;
	}

	.highlight {
		color: var(--accent-copper);
		font-weight: 600;
	}
</style>
