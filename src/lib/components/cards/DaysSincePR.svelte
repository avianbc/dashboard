<script lang="ts">
	import type { DaysSinceLastPR } from '$lib/types/training';
	import { Card } from '$lib/components/ui';
	import { LIFTS } from '$lib/config';

	interface Props {
		data: DaysSinceLastPR;
	}

	let { data }: Props = $props();

	// Use shared lift configuration
	const lifts = LIFTS.map((lift) => ({
		name: lift.name === 'Overhead Press' ? 'OHP' : lift.name === 'Bench Press' ? 'Bench' : lift.name,
		key: lift.key,
		color: lift.color
	}));

	function getTimeRange(days: number): { range: string; color: string } {
		if (days < 90) {
			return { range: '< 3 months', color: 'var(--status-recent)' };
		} else if (days < 180) {
			return { range: '3-6 months', color: 'var(--status-aging)' };
		} else {
			return { range: '6+ months', color: 'var(--status-overdue)' };
		}
	}
</script>

<div class="days-since-pr">
	<h3 class="section-title">Time Since Last PR</h3>
	<div class="pr-grid">
		{#each lifts as lift}
			{@const days = data[lift.key]}
			{@const timeInfo = getTimeRange(days)}
			<Card hover class="pr-card" style="--lift-color: {lift.color}; --status-color: {timeInfo.color}">
				<div class="pr-card-header">
					<span class="lift-name">{lift.name}</span>
				</div>
				<div class="days-value">{days}</div>
				<div class="days-label">days</div>
				<div class="status-badge" style="background: {timeInfo.color}">
					{timeInfo.range}
				</div>
			</Card>
		{/each}
	</div>
</div>

<style>
	.days-since-pr {
		width: 100%;
	}

	.pr-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-4);
	}

	:global(.pr-card) {
		padding: var(--space-5);
		text-align: center;
		border-left: 3px solid var(--lift-color);
		position: relative;
	}

	.pr-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-3);
	}

	.lift-name {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.days-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 2.5rem;
		font-weight: bold;
		color: var(--text-primary);
		line-height: 1;
		margin-bottom: var(--space-1);
	}

	.days-label {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-bottom: var(--space-3);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-badge {
		display: inline-block;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	@media (max-width: 768px) {
		.pr-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.days-value {
			font-size: 2rem;
		}
	}

	@media (max-width: 480px) {
		.pr-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
