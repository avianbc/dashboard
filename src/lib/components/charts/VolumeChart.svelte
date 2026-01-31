<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { echarts, type EChartsOption } from './echarts-setup';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import type { VolumeTimeSeries } from '$lib/types/training';
	import { unitSystem, theme } from '$lib/stores';
	import {
		formatNumber,
		formatDate,
		lbsToKg,
		getChartColors,
		createTooltipConfig,
		TOOLTIP_PADDING
	} from '$lib/utils';
	import { Button, Loading, Error } from '$lib/components/ui';
	import { Star } from 'lucide-svelte';

	// Props
	let {
		data,
		loading = false,
		error = null
	}: {
		data: VolumeTimeSeries;
		loading?: boolean;
		error?: string | null;
	} = $props();

	// State
	let chartContainer = $state<HTMLDivElement>();
	let chartInstance: echarts.ECharts | null = null;
	let granularity: 'daily' | 'weekly' | 'monthly' = $state('monthly');
	let showAllTime = $state(true); // true = All Time (default), false = Last 2 Years

	// React to unit system and theme changes
	$effect(() => {
		unitSystem.current;
		theme.current;
		if (chartInstance) {
			updateChart();
		}
	});

	// Filter data to last 2 years if showAllTime is false
	function filterByTimeRange<T>(items: T[], dateGetter: (item: T) => string): T[] {
		if (showAllTime) return items;
		
		const twoYearsAgo = new Date();
		twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
		
		return items.filter(item => {
			const dateStr = dateGetter(item);
			if (!dateStr) return false;
			
			const year = parseInt(dateStr.substring(0, 4));
			if (isNaN(year)) return false;
			
			// Handle ISO week format (YYYY-Wxx)
			if (dateStr.includes('-W')) {
				const weekNum = parseInt(dateStr.substring(6, 8) || '1');
				// Approximate: week 1 = Jan 1, week 52 = Dec 31
				const itemDate = new Date(year, 0, 1 + (weekNum - 1) * 7);
				return itemDate >= twoYearsAgo;
			}
			
			// Handle YYYY-MM-DD or YYYY-MM format
			const month = parseInt(dateStr.substring(5, 7) || '1');
			const day = parseInt(dateStr.substring(8, 10) || '1');
			const itemDate = new Date(year, month - 1, day);
			return itemDate >= twoYearsAgo;
		});
	}

	// Get the appropriate data based on granularity
	function getChartData() {
		const useMetric = unitSystem.current === 'metric';

		switch (granularity) {
			case 'daily':
				return filterByTimeRange(data.daily, d => d.date).map((d) => ({
					date: d.date,
					volume: useMetric ? lbsToKg(d.volumeLbs) : d.volumeLbs,
					workouts: d.workouts
				}));
			case 'weekly':
				return filterByTimeRange(data.weekly, d => d.week).map((d) => ({
					date: d.week,
					volume: useMetric ? lbsToKg(d.volumeLbs) : d.volumeLbs,
					workouts: d.workouts
				}));
			case 'monthly':
			default:
				return filterByTimeRange(data.monthly, d => d.month).map((d) => ({
					date: d.month,
					volume: useMetric ? lbsToKg(d.volumeLbs) : d.volumeLbs,
					workouts: d.workouts
				}));
		}
	}

	// Find best month for annotation
	function getBestMonth() {
		const useMetric = unitSystem.current === 'metric';
		const monthlyData = data.monthly;
		let bestMonth = monthlyData[0];

		for (const month of monthlyData) {
			if (month.volumeLbs > bestMonth.volumeLbs) {
				bestMonth = month;
			}
		}

		return {
			date: bestMonth.month,
			volume: useMetric ? lbsToKg(bestMonth.volumeLbs) : bestMonth.volumeLbs,
			volumeLbs: bestMonth.volumeLbs
		};
	}

	// Update chart with current data
	function updateChart() {
		if (!chartInstance) return;

		const chartData = getChartData();
		const bestMonth = getBestMonth();
		const useMetric = unitSystem.current === 'metric';
		const unit = useMetric ? 'kg' : 'lbs';

		// Get computed colors from CSS variables
		const colors = getChartColors();
		const { accentCopper, textPrimary, textSecondary, textMuted } = colors;

		const option: EChartsOption = {
			backgroundColor: 'transparent',
			tooltip: {
				...createTooltipConfig(colors),
				formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
					const paramsArray = Array.isArray(params) ? params : [params];
					if (!paramsArray || paramsArray.length === 0) return '';

					const point = paramsArray[0];
					const dataIndex = point.dataIndex;
					const item = chartData[dataIndex];

					return `
						<div style="padding: ${TOOLTIP_PADDING}px;">
							<div style="font-weight: bold; margin-bottom: ${TOOLTIP_PADDING}px; color: ${accentCopper};">
								${formatDate(item.date)}
							</div>
							<div style="margin-bottom: 4px;">
								<span style="color: ${textSecondary};">Volume:</span>
								<span style="font-family: 'JetBrains Mono', monospace; margin-left: ${TOOLTIP_PADDING}px; color: ${textPrimary};">
									${formatNumber(item.volume)} ${unit}
								</span>
							</div>
							<div>
								<span style="color: ${textSecondary};">Workouts:</span>
								<span style="font-family: 'JetBrains Mono', monospace; margin-left: ${TOOLTIP_PADDING}px; color: ${textPrimary};">
									${item.workouts}
								</span>
							</div>
						</div>
					`;
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '15%',
				top: '3%'
			},
			xAxis: {
				type: 'category',
				data: chartData.map((d) => d.date),
				boundaryGap: false,
				axisLine: {
					lineStyle: {
						color: textMuted
					}
				},
				axisLabel: {
					color: textSecondary,
					fontFamily: 'JetBrains Mono, monospace',
					fontSize: 11,
					formatter: (value: string) => {
						if (granularity === 'daily') {
							// Format: YYYY-MM-DD
							const date = new Date(value);
							return `${date.getMonth() + 1}/${date.getDate()}`;
						} else if (granularity === 'weekly') {
							// Format: YYYY-Www (e.g., 2019-W03)
							const [, week] = value.split('-W');
							return `W${week}`;
						} else {
							// Format: YYYY-MM (e.g., 2019-01)
							const [year, month] = value.split('-');
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
					}
				},
				splitLine: {
					show: false
				}
			},
			yAxis: {
				type: 'value',
				name: `Volume (${unit})`,
				nameLocation: 'middle',
				nameGap: 50,
				nameTextStyle: {
					color: textPrimary,
					fontFamily: 'Source Sans 3, sans-serif',
					fontSize: 14
				},
				axisLine: {
					lineStyle: {
						color: textMuted
					}
				},
				axisLabel: {
					color: textSecondary,
					fontFamily: 'JetBrains Mono, monospace',
					fontSize: 11,
					formatter: (value: number) => {
						if (value >= 1000) {
							return (value / 1000).toFixed(0) + 'K';
						}
						return value.toFixed(0);
					}
				},
				splitLine: {
					lineStyle: {
						color: textMuted,
						opacity: 0.2
					}
				}
			},
			series: [
				{
					name: 'Volume',
					type: 'line',
					data: chartData.map((d) => d.volume),
					smooth: true,
					lineStyle: {
						color: accentCopper,
						width: 2
					},
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{
								offset: 0,
								color: `${accentCopper}80` // 50% opacity
							},
							{
								offset: 1,
								color: `${accentCopper}00` // Transparent
							}
						])
					},
					itemStyle: {
						color: accentCopper
					},
					emphasis: {
						focus: 'series',
						itemStyle: {
							color: accentCopper,
							borderColor: textPrimary,
							borderWidth: 2
						}
					},
					// Mark the best month
					markPoint: {
						data: [
							{
								name: 'Best Month',
								value: formatNumber(bestMonth.volumeLbs),
								xAxis: bestMonth.date,
								yAxis: bestMonth.volume,
								label: {
									show: true,
									formatter: 'Best\nMonth',
									color: textPrimary,
									fontFamily: 'Source Sans 3, sans-serif',
									fontSize: 11,
									fontWeight: 'bold',
									backgroundColor: accentCopper,
									padding: [4, 8],
									borderRadius: 4
								},
								itemStyle: {
									color: accentCopper,
									borderColor: textPrimary,
									borderWidth: 2
								},
								symbolSize: 50
							}
						]
					}
				}
			],
			// Add data zoom for better interaction
			dataZoom: [
				{
					type: 'inside',
					start: 0,
					end: 100,
					zoomOnMouseWheel: true,
					moveOnMouseMove: true
				},
				{
					type: 'slider',
					start: 0,
					end: 100,
					height: 30,
					bottom: 10,
					borderColor: textMuted,
					textStyle: {
						color: textSecondary,
						fontFamily: 'JetBrains Mono, monospace',
						fontSize: 10
					},
					handleStyle: {
						color: accentCopper,
						borderColor: textPrimary
					},
					dataBackground: {
						lineStyle: {
							color: textMuted
						},
						areaStyle: {
							color: textMuted,
							opacity: 0.3
						}
					},
					selectedDataBackground: {
						lineStyle: {
							color: accentCopper
						},
						areaStyle: {
							color: accentCopper,
							opacity: 0.3
						}
					}
				}
			]
		};

		chartInstance.setOption(option, true);
	}

	// Initialize chart on mount
	onMount(() => {
		if (chartContainer) {
			chartInstance = echarts.init(chartContainer, null, {
				renderer: 'canvas'
			});

			updateChart();

			// Handle window resize
			const handleResize = () => {
				chartInstance?.resize();
			};

			window.addEventListener('resize', handleResize);

			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	});

	// Update chart when granularity or time range changes
	$effect(() => {
		// Access reactive values to trigger on changes
		const _granularity = granularity;
		const _showAllTime = showAllTime;
		if (chartInstance) {
			updateChart();
		}
	});

	// Cleanup on unmount
	onDestroy(() => {
		if (chartInstance) {
			chartInstance.dispose();
			chartInstance = null;
		}
	});
</script>

{#if loading}
	<div class="volume-chart-container">
		<Loading size="lg" text="Loading volume data..." />
	</div>
{:else if error}
	<div class="volume-chart-container">
		<Error title="Failed to Load Chart" message={error} />
	</div>
{:else}
	<div class="volume-chart-wrapper">
		<h3 class="section-title">Training Volume Over Time</h3>

		<!-- Chart Controls -->
		<div class="chart-controls">
			<div class="control-group">
				<span class="control-label">Granularity:</span>
				<div class="button-group">
					<Button
						variant={granularity === 'daily' ? 'primary' : 'outline'}
						size="sm"
						onclick={() => (granularity = 'daily')}
					>
						Daily
					</Button>
					<Button
						variant={granularity === 'weekly' ? 'primary' : 'outline'}
						size="sm"
						onclick={() => (granularity = 'weekly')}
					>
						Weekly
					</Button>
					<Button
						variant={granularity === 'monthly' ? 'primary' : 'outline'}
						size="sm"
						onclick={() => (granularity = 'monthly')}
					>
						Monthly
					</Button>
				</div>
			</div>

			<div class="control-group">
				<span class="control-label">Time Range:</span>
				<div class="button-group">
					<Button
						variant={!showAllTime ? 'primary' : 'outline'}
						size="sm"
						onclick={() => (showAllTime = false)}
					>
						Last 2 Years
					</Button>
					<Button
						variant={showAllTime ? 'primary' : 'outline'}
						size="sm"
						onclick={() => (showAllTime = true)}
					>
						All Time
					</Button>
				</div>
			</div>
		</div>

		<!-- Chart Container -->
		<div class="volume-chart-container" bind:this={chartContainer}></div>

		<!-- Legend -->
		<div class="chart-legend">
			<div class="legend-item">
				<div class="legend-color" style="background-color: var(--accent-copper);"></div>
				<span>Training Volume</span>
			</div>
			<div class="legend-item">
				<div class="legend-marker">
					<Star size={16} strokeWidth={2} fill="var(--accent-gold)" />
				</div>
				<span>Best Month Ever</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.volume-chart-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.chart-controls {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-6);
		flex-wrap: wrap;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.control-label {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.button-group {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.volume-chart-container {
		width: 100%;
		height: 500px;
		min-height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.chart-legend {
		display: flex;
		gap: var(--space-4);
		justify-content: center;
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.chart-controls {
			justify-content: center;
		}

		.control-group {
			flex-direction: column;
			align-items: stretch;
			gap: var(--space-2);
		}

		.control-label {
			text-align: center;
		}

		.button-group {
			justify-content: center;
		}

		.volume-chart-container {
			height: 400px;
			min-height: 300px;
		}
	}

	@media (max-width: 480px) {
		.button-group {
			flex-direction: column;
			width: 100%;
		}

		.button-group :global(button) {
			width: 100%;
		}
	}
</style>
