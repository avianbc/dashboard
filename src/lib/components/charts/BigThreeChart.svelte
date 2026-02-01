<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { echarts, type EChartsOption } from './echarts-setup';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import type { BigThreeE1RM, AllTimePRs } from '$lib/types/training';
	import { unitSystem, theme } from '$lib/stores';
	import {
		formatNumber,
		formatDate,
		lbsToKg,
		getChartColors,
		createTooltipConfig,
		TOOLTIP_PADDING
	} from '$lib/utils';
	import { Loading, Error, SegmentedControl } from '$lib/components/ui';
	import { Star } from 'lucide-svelte';
	import { LIFT_COLORS, PLATE_MILESTONES } from '$lib/config';

	// Props
	let {
		data,
		allTimePRs,
		loading = false,
		error = null
	}: {
		data: BigThreeE1RM;
		allTimePRs: AllTimePRs;
		loading?: boolean;
		error?: string | null;
	} = $props();

	// State
	let chartContainer = $state<HTMLDivElement>();
	let chartInstance: echarts.ECharts | null = null;

	// Visibility state for each lift
	let visibleLifts = $state({
		squat: true,
		bench: true,
		deadlift: true,
		ohp: true
	});

	// Time range state for quick selectors
	let selectedTimeRange = $state<'3M' | '6M' | '1Y' | 'ALL'>('ALL');

	// Calculate date range based on selection
	function getTimeRangePercentage(): { start: number; end: number } {
		if (selectedTimeRange === 'ALL') return { start: 0, end: 100 };

		// Get the full date range from data
		const allDates = data.squat.e1rmHistory.map((p) => new Date(p.date).getTime());
		const minDate = Math.min(...allDates);
		const maxDate = Math.max(...allDates);
		const totalRange = maxDate - minDate;

		const now = maxDate; // Use latest data point as "now"
		let startDate: number;

		switch (selectedTimeRange) {
			case '3M':
				startDate = now - 90 * 24 * 60 * 60 * 1000;
				break;
			case '6M':
				startDate = now - 180 * 24 * 60 * 60 * 1000;
				break;
			case '1Y':
				startDate = now - 365 * 24 * 60 * 60 * 1000;
				break;
			default:
				return { start: 0, end: 100 };
		}

		const startPercent = Math.max(0, ((startDate - minDate) / totalRange) * 100);
		return { start: startPercent, end: 100 };
	}

	// Handle time range button click
	function setTimeRange(range: '3M' | '6M' | '1Y' | 'ALL') {
		selectedTimeRange = range;
		if (chartInstance) {
			const { start, end } = getTimeRangePercentage();
			chartInstance.dispatchAction({
				type: 'dataZoom',
				start,
				end
			});
		}
	}

	// Use shared lift colors
	const liftColors = LIFT_COLORS;

	// Use shared plate milestones (only first 4 for chart)
	const plateMilestones = PLATE_MILESTONES.slice(0, 4);

	// React to unit system and theme changes
	$effect(() => {
		unitSystem.current;
		theme.current;
		if (chartInstance) {
			updateChart();
		}
	});

	// Get chart data for all lifts
	function getChartData() {
		const useMetric = unitSystem.current === 'metric';
		const lifts = ['squat', 'bench', 'deadlift', 'ohp'] as const;

		return lifts.map((lift) => {
			const liftData = data[lift];
			return {
				name: lift,
				displayName: liftData.exerciseName,
				data: liftData.e1rmHistory.map((point) => ({
					date: point.date,
					value: useMetric ? point.e1rmKg : point.e1rmLbs,
					actualWeight: useMetric ? point.actualWeightKg : point.actualWeightLbs,
					reps: point.reps
				})),
				visible: visibleLifts[lift]
			};
		});
	}

	// Find PR points for each lift
	function getPRPoints() {
		const useMetric = unitSystem.current === 'metric';
		const lifts = ['squat', 'bench', 'deadlift', 'ohp'] as const;

		return lifts
			.map((lift) => {
				const pr = allTimePRs[lift].bestE1rm;
				const liftData = data[lift];

				// Find the PR point in the history
				const prPoint = liftData.e1rmHistory.find(
					(point) => point.date === pr.date || Math.abs(point.e1rmLbs - pr.e1rmLbs) < 0.1
				);

				if (!prPoint) return null;

				return {
					lift,
					date: prPoint.date,
					value: useMetric ? pr.e1rmKg : pr.e1rmLbs,
					actualWeight: useMetric ? pr.actualWeightKg : pr.actualWeightLbs,
					reps: pr.reps
				};
			})
			.filter(Boolean);
	}

	// Update chart with current data
	function updateChart() {
		if (!chartInstance) return;

		const chartData = getChartData();
		const prPoints = getPRPoints();
		const useMetric = unitSystem.current === 'metric';
		const unit = useMetric ? 'kg' : 'lbs';

		// Get computed colors from CSS variables
		const colors = getChartColors();
		const { textPrimary, textSecondary, textMuted } = colors;

		// Build series for each lift
		const liftSeries = chartData.map((lift) => {
			const color = liftColors[lift.name as keyof typeof liftColors];
			const lastPoint = lift.data[lift.data.length - 1];

			return {
				name: lift.displayName,
				type: 'line',
				data: lift.data.map((d) => [d.date, d.value]),
				smooth: true,
				showSymbol: false,
				lineStyle: {
					color: color,
					width: 2.5
				},
				itemStyle: {
					color: color
				},
				// Add subtle area fill
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: color + '25' },
							{ offset: 1, color: color + '05' }
						]
					}
				},
				emphasis: {
					focus: 'series',
					lineStyle: {
						width: 4
					}
				},
				// End-of-line label with current value
				endLabel: {
					show: true,
					formatter: () => `${formatNumber(lastPoint?.value ?? 0)}`,
					color: color,
					fontFamily: 'JetBrains Mono, monospace',
					fontSize: 11,
					fontWeight: 'bold',
					offset: [5, 0]
				},
				// Add PR markers
				markPoint: {
					data: prPoints
						.filter(
							(pr) => pr!.lift === lift.name && visibleLifts[lift.name as keyof typeof visibleLifts]
						)
						.map((pr) => ({
							name: 'PR',
							coord: [pr!.date, pr!.value],
							symbol: 'circle',
							symbolSize: 30,
							label: {
								show: true,
								formatter: '⭐',
								fontSize: 18,
								color: '#FFD700',
								offset: [0, 0]
							},
							itemStyle: {
								color: 'rgba(255, 215, 0, 0.2)',
								borderColor: '#FFD700',
								borderWidth: 2
							}
						}))
				}
			};
		});

		// Add plate milestone lines as a series
		const plateMilestoneSeries = {
			name: 'Plate Milestones',
			type: 'line',
			data: [],
			markLine: {
				silent: true,
				symbol: 'none',
				label: {
					show: true,
					position: 'insideEndTop' as const,
					color: textMuted,
					fontSize: 10,
					fontFamily: 'JetBrains Mono, monospace'
				},
				lineStyle: {
					color: textMuted,
					type: 'dashed' as const,
					opacity: 0.3,
					width: 1
				},
				data: plateMilestones.map((plate) => ({
					yAxis: useMetric ? lbsToKg(plate) : plate,
					label: {
						formatter: `${useMetric ? Math.round(lbsToKg(plate)) : plate} ${unit}`
					}
				}))
			}
		};

		// Combine all series
		const series = [...liftSeries, plateMilestoneSeries];

		const option: EChartsOption = {
			backgroundColor: 'transparent',
			tooltip: {
				...createTooltipConfig(colors),
				formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
					const paramsArray = Array.isArray(params) ? params : [params];
					if (!paramsArray || paramsArray.length === 0) return '';

					// Convert timestamp to date string for comparison
					const timestamp = (paramsArray[0] as CallbackDataParams & { axisValue?: string | number })
						.axisValue;
					const dateObj = new Date(timestamp as string | number);
					const dateString = dateObj.toISOString().split('T')[0];

					let tooltipContent = `<div style="padding: ${TOOLTIP_PADDING}px;">
						<div style="font-weight: bold; margin-bottom: ${TOOLTIP_PADDING}px; color: ${textPrimary};">
							${formatDate(dateString)}
						</div>`;

					paramsArray.forEach((param) => {
						if (param.seriesName) {
							const liftName = param.seriesName.toLowerCase();
							const liftKey =
								liftName === 'overhead press'
									? 'ohp'
									: liftName === 'bench press'
										? 'bench'
										: liftName;
							const liftData = chartData.find((l) => l.name === liftKey);

							if (liftData) {
								const dataPoint = liftData.data.find((d) => d.date === dateString);
								if (dataPoint) {
									tooltipContent += `
										<div style="margin-bottom: 6px;">
											<span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 6px;"></span>
											<span style="font-weight: bold; color: ${param.color};">${param.seriesName}</span>
											<div style="margin-left: 16px; margin-top: 2px;">
												<span style="color: ${textSecondary};">E1RM:</span>
												<span style="font-family: 'JetBrains Mono', monospace; margin-left: ${TOOLTIP_PADDING}px; color: ${textPrimary};">
													${formatNumber(dataPoint.value)} ${unit}
												</span>
											</div>
											<div style="margin-left: 16px;">
												<span style="color: ${textSecondary};">Actual:</span>
												<span style="font-family: 'JetBrains Mono', monospace; margin-left: ${TOOLTIP_PADDING}px; color: ${textPrimary};">
													${formatNumber(dataPoint.actualWeight)} ${unit} × ${dataPoint.reps}
												</span>
											</div>
										</div>`;
								}
							}
						}
					});

					tooltipContent += '</div>';
					return tooltipContent;
				}
			},
			legend: {
				data: chartData.map((l) => l.displayName),
				top: 20,
				textStyle: {
					color: textSecondary,
					fontFamily: 'Source Sans 3, sans-serif',
					fontSize: 12
				},
				selected: {
					Squat: visibleLifts.squat,
					'Bench Press': visibleLifts.bench,
					Deadlift: visibleLifts.deadlift,
					'Overhead Press': visibleLifts.ohp
				}
			},
			grid: {
				left: '3%',
				right: '8%',
				bottom: '15%',
				top: '12%',
				containLabel: true
			},
			xAxis: {
				type: 'time',
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
					formatter: (value: number) => {
						const date = new Date(value);
						return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
					}
				},
				splitLine: {
					show: false
				}
			},
			yAxis: {
				type: 'value',
				name: `E1RM (${unit})`,
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
					fontSize: 11
				},
				splitLine: {
					lineStyle: {
						color: textMuted,
						opacity: 0.2
					}
				}
			},
			series: series,
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
						color: textPrimary,
						borderColor: textSecondary
					},
					dataBackground: {
						lineStyle: {
							color: textMuted
						},
						areaStyle: {
							color: textMuted,
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

			// Handle legend selection to update visibility state
			interface LegendSelectChangedParams {
				name: string;
				selected: Record<string, boolean>;
			}
			chartInstance.on('legendselectchanged', (params: unknown) => {
				const legendParams = params as LegendSelectChangedParams;
				const liftMap: Record<string, keyof typeof visibleLifts> = {
					Squat: 'squat',
					'Bench Press': 'bench',
					Deadlift: 'deadlift',
					'Overhead Press': 'ohp'
				};

				const liftKey = liftMap[legendParams.name];
				if (liftKey) {
					visibleLifts[liftKey] = legendParams.selected[legendParams.name];
				}
			});

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

	// Update chart when visibility changes
	$effect(() => {
		if (chartInstance && visibleLifts) {
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
	<div class="big-three-chart-container">
		<Loading size="lg" text="Loading progression data..." />
	</div>
{:else if error}
	<div class="big-three-chart-container">
		<Error title="Failed to Load Chart" message={error} />
	</div>
{:else}
	<div class="big-three-chart-wrapper">
		<div class="section-header">
			<div class="header-row">
				<div class="title-group">
					<h3 class="section-title">Strength Progression (E1RM)</h3>
					<p class="section-subtitle">Big Three + OHP Estimated 1-Rep Max Over Time</p>
				</div>
				<SegmentedControl
					options={[
						{ value: '3M', label: '3M' },
						{ value: '6M', label: '6M' },
						{ value: '1Y', label: '1Y' },
						{ value: 'ALL', label: 'All' }
					]}
					value={selectedTimeRange}
					onchange={(v) => setTimeRange(v as '3M' | '6M' | '1Y' | 'ALL')}
					size="sm"
					aria-label="Select time range"
				/>
			</div>
			<!-- Compact legend for special markers -->
			<div class="compact-legend">
				<span class="legend-item-inline">
					<Star size={14} strokeWidth={2} fill="var(--accent-gold)" color="var(--accent-gold)" />
					PR
				</span>
				<span class="legend-item-inline">
					<span class="dashed-line"></span>
					Plate Milestones
				</span>
			</div>
		</div>

		<!-- Chart Container -->
		<div class="big-three-chart-container" bind:this={chartContainer}></div>
	</div>
{/if}

<style>
	.big-three-chart-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.section-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.title-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.section-subtitle {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.compact-legend {
		display: flex;
		gap: var(--space-4);
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.legend-item-inline {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.dashed-line {
		width: 16px;
		height: 0;
		border-top: 2px dashed var(--text-muted);
		opacity: 0.5;
	}

	.big-three-chart-container {
		width: 100%;
		height: 600px;
		min-height: 500px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.header-row {
			flex-direction: column;
			align-items: flex-start;
		}

		.big-three-chart-container {
			height: 500px;
			min-height: 400px;
		}
	}
</style>
