<script lang="ts">
	import { onMount } from 'svelte';
	import { echarts, type EChartsOption } from './echarts-setup';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import type { PolarMonthlyPoint } from '$lib/types/training';
	import { theme } from '$lib/stores';
	import { getChartColors, createTooltipConfig, TOOLTIP_PADDING } from '$lib/utils';
	import { Callout } from '$lib/components/ui';
	import { Heart } from 'lucide-svelte';

	interface Props {
		data: PolarMonthlyPoint[];
	}

	let { data }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts;

	$effect(() => {
		theme.current;
		if (chart) {
			updateChart();
		}
	});

	onMount(() => {
		chart = echarts.init(chartContainer);
		updateChart();

		const handleResize = () => chart.resize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			chart.dispose();
		};
	});

	function formatMonth(monthKey: string): string {
		const [year, month] = monthKey.split('-');
		const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		return `${names[parseInt(month) - 1]} '${year.slice(2)}`;
	}

	function updateChart() {
		const isDark = theme.current === 'dark';
		const textColor = isDark ? '#f5f2eb' : '#1a1816';
		const subtleColor = isDark ? '#6b6560' : '#7a756e';
		const gridColor = isDark ? '#454238' : '#d4d0c8';
		const chartColors = getChartColors();

		const months = data.map((d) => d.month);
		const avgHr = data.map((d) => d.avgHr);
		const avgMaxHr = data.map((d) => d.avgMaxHr);
		const cardioLoads = data.map((d) => d.avgCardioLoad ?? 0);
		const hasCardioLoad = cardioLoads.some((v) => v > 0);

		const option: EChartsOption = {
			backgroundColor: 'transparent',
			title: {
				text: 'Heart Rate Trends',
				left: 0,
				textStyle: {
					color: textColor,
					fontFamily: 'JetBrains Mono, monospace',
					fontSize: 16,
					fontWeight: 'bold'
				}
			},
			tooltip: {
				...createTooltipConfig(chartColors),
				trigger: 'axis',
				formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
					const ps = Array.isArray(params) ? params : [params];
					const month = (ps[0] as CallbackDataParams & { axisValue?: string }).axisValue || '';
					const hrRow = ps.find((p) => p.seriesName === 'Avg HR');
					const maxRow = ps.find((p) => p.seriesName === 'Avg Max HR');
					const loadRow = ps.find((p) => p.seriesName === 'Cardio Load');

					const dot = (color: string) =>
						`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:5px;"></span>`;

					let html = `<div style="padding:${TOOLTIP_PADDING}px">
						<div style="font-weight:bold;margin-bottom:6px">${formatMonth(month)}</div>`;
					if (hrRow?.value != null)
						html += `<div>${dot('#c17f59')}Avg HR: ${hrRow.value} bpm</div>`;
					if (maxRow?.value != null)
						html += `<div style="margin-top:3px">${dot('#e04040')}Avg Max HR: ${maxRow.value} bpm</div>`;
					if (loadRow?.value != null && (loadRow.value as number) > 0)
						html += `<div style="margin-top:3px">${dot('#6b6560')}Cardio Load: ${(loadRow.value as number).toFixed(1)}</div>`;
					html += '</div>';
					return html;
				}
			},
			legend: {
				show: true,
				top: 28,
				right: 0,
				textStyle: { color: textColor },
				data: hasCardioLoad ? ['Avg HR', 'Avg Max HR', 'Cardio Load'] : ['Avg HR', 'Avg Max HR']
			},
			dataZoom: [
				{
					type: 'slider',
					bottom: 0,
					height: 20,
					borderColor: gridColor,
					fillerColor: isDark ? 'rgba(193,127,89,0.15)' : 'rgba(193,127,89,0.1)',
					handleStyle: { color: '#c17f59' },
					textStyle: { color: subtleColor }
				}
			],
			grid: {
				left: '3%',
				right: hasCardioLoad ? '5%' : '3%',
				top: 65,
				bottom: 45,
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: months,
				axisLabel: {
					color: subtleColor,
					interval: (index: number) => {
						const month = months[index];
						if (!month) return false;
						const m = parseInt(month.split('-')[1]);
						return m === 1 || m === 7;
					},
					formatter: (v: string) => formatMonth(v)
				},
				axisLine: { lineStyle: { color: gridColor } },
				splitLine: { show: false }
			},
			yAxis: [
				{
					type: 'value',
					name: 'bpm',
					nameTextStyle: { color: subtleColor },
					min: (val: { min: number }) => Math.max(0, Math.floor(val.min * 0.9)),
					axisLabel: { color: subtleColor },
					splitLine: { lineStyle: { color: gridColor, type: 'dashed' } }
				},
				...(hasCardioLoad
					? [
							{
								type: 'value' as const,
								name: 'Load',
								nameTextStyle: { color: subtleColor },
								min: 0,
								axisLabel: { color: subtleColor },
								splitLine: { show: false }
							}
						]
					: [])
			],
			series: [
				{
					name: 'Avg HR',
					type: 'line',
					data: avgHr,
					smooth: true,
					yAxisIndex: 0,
					lineStyle: { color: '#c17f59', width: 2 },
					itemStyle: { color: '#c17f59' },
					symbol: 'circle',
					symbolSize: 4,
					areaStyle: {
						color: isDark
							? 'rgba(193,127,89,0.08)'
							: 'rgba(193,127,89,0.06)'
					}
				},
				{
					name: 'Avg Max HR',
					type: 'line',
					data: avgMaxHr,
					smooth: true,
					yAxisIndex: 0,
					lineStyle: { color: '#e04040', width: 1.5, type: 'dashed' },
					itemStyle: { color: '#e04040' },
					symbol: 'none'
				},
				...(hasCardioLoad
					? [
							{
								name: 'Cardio Load',
								type: 'bar' as const,
								data: cardioLoads,
								yAxisIndex: 1,
								itemStyle: {
									color: isDark ? 'rgba(107,101,96,0.5)' : 'rgba(160,153,145,0.4)',
									borderRadius: [2, 2, 0, 0]
								},
								barMaxWidth: 8
							}
						]
					: [])
			]
		};

		chart.setOption(option, true);
	}
</script>

<div class="hr-chart-wrapper">
	<div bind:this={chartContainer} class="chart-container"></div>

	<Callout variant="info" icon={Heart} borderAccent>
		<p>
			Heart rate data from <strong>{data.length} months</strong> of Polar training sessions.
			Strength training HR varies by rest periods — trends across months are more meaningful than individual sessions.
		</p>
	</Callout>
</div>

<style>
	.hr-chart-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.chart-container {
		width: 100%;
		height: 420px;
	}
</style>
