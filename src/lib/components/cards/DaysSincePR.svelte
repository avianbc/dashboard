<script lang="ts">
	import type { ComponentType } from 'svelte';
	import type { DaysSinceLastPR } from '$lib/types/training';
	import { Card } from '$lib/components/ui';
	import { CircleCheck, CircleAlert, CircleX } from 'lucide-svelte';

	interface Props {
		data: DaysSinceLastPR;
	}

	let { data }: Props = $props();

	const lifts = [
		{ name: 'Squat', key: 'squat' as const, color: 'var(--lift-squat)' },
		{ name: 'Bench', key: 'bench' as const, color: 'var(--lift-bench)' },
		{ name: 'Deadlift', key: 'deadlift' as const, color: 'var(--lift-deadlift)' },
		{ name: 'OHP', key: 'ohp' as const, color: 'var(--lift-ohp)' }
	];

	function getStatus(days: number): { status: string; color: string; icon: ComponentType } {
		if (days < 90) {
			return { status: 'Recent', color: 'var(--status-recent)', icon: CircleCheck };
		} else if (days < 180) {
			return { status: 'Aging', color: 'var(--status-aging)', icon: CircleAlert };
		} else {
			return { status: 'Overdue', color: 'var(--status-overdue)', icon: CircleX };
		}
	}
</script>

<div class="days-since-pr">
	<h3 class="section-title">Days Since Last PR</h3>
	<div class="pr-grid">
		{#each lifts as lift}
			{@const days = data[lift.key]}
			{@const statusInfo = getStatus(days)}
			{@const StatusIcon = statusInfo.icon}
			<Card hover class="pr-card" style="--lift-color: {lift.color}; --status-color: {statusInfo.color}">
				<div class="pr-card-header">
					<span class="lift-name">{lift.name}</span>
					<span class="status-icon"><StatusIcon size={20} strokeWidth={2} /></span>
				</div>
				<div class="days-value">{days}</div>
				<div class="days-label">days</div>
				<div class="status-badge" style="background: {statusInfo.color}">
					{statusInfo.status}
				</div>
			</Card>
		{/each}
	</div>
</div>

<style>
	.days-since-pr {
		width: 100%;
	}

	.section-title {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 1.5rem;
		color: var(--text-primary);
		margin-bottom: var(--space-4);
		letter-spacing: 0.05em;
	}

	.pr-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--space-3);
	}

	:global(.pr-card) {
		padding: var(--space-4);
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

	.status-icon {
		color: var(--status-color);
		display: flex;
		align-items: center;
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
