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
		name:
			lift.name === 'Overhead Press' ? 'OHP' : lift.name === 'Bench Press' ? 'Bench' : lift.name,
		key: lift.key,
		color: lift.color
	}));
</script>

<div class="days-since-pr">
	<h3 class="section-title">Time Since Last PR</h3>
	<div class="pr-grid">
		{#each lifts as lift (lift.key)}
			{@const days = data[lift.key]}
			<Card hover class="pr-card" style="--lift-color: {lift.color}">
				<div class="pr-card-header">
					<span class="lift-name">{lift.name}</span>
				</div>
				<div class="days-display">
					<span class="days-value">{days}</span>
					<span class="days-label">days ago</span>
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
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.days-display {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: var(--space-2);
	}

	.days-value {
		font-family: var(--font-mono);
		font-size: var(--text-4xl);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		line-height: 1;
	}

	.days-label {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	@media (max-width: 768px) {
		.pr-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.days-value {
			font-size: var(--text-3xl);
		}
	}

	@media (max-width: 480px) {
		.pr-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
