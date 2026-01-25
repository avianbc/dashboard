<script lang="ts">
	import type { ComponentType } from 'svelte';
	import type { NotableWorkout } from '$lib/types/training';
	import { formatDate, formatCompactNumber } from '$lib/utils';
	import { Card } from '$lib/components/ui';
	import { Flame, Dumbbell, Star, Trophy, BarChart3 } from 'lucide-svelte';

	interface Props {
		data: NotableWorkout[];
	}

	let { data }: Props = $props();

	// Take the most recent 10 notable workouts
	const recentWorkouts = $derived(data.slice(0, 10));

	function getCategoryIcon(category: string): ComponentType {
		switch (category) {
			case 'comeback':
				return Flame;
			case 'volume':
				return Dumbbell;
			case 'pr':
				return Star;
			case 'milestone':
				return Trophy;
			default:
				return BarChart3;
		}
	}

	function getCategoryColor(category: string): string {
		switch (category) {
			case 'comeback':
				return 'var(--status-pr)';
			case 'volume':
				return 'var(--lift-deadlift)';
			case 'pr':
				return 'var(--accent-gold)';
			case 'milestone':
				return 'var(--accent-copper)';
			default:
				return 'var(--text-secondary)';
		}
	}
</script>

<div class="recent-activity">
	<h3 class="section-title">Notable Workouts</h3>
	<div class="activity-list">
		{#each recentWorkouts as workout}
			{@const IconComponent = getCategoryIcon(workout.category)}
			<Card hover class="activity-item">
				<div class="activity-icon" style="color: {getCategoryColor(workout.category)}">
					<IconComponent size={24} strokeWidth={2} />
				</div>
				<div class="activity-content">
					<div class="activity-reason">{workout.reason}</div>
					<div class="activity-meta">
						<span class="activity-date">{formatDate(workout.date)}</span>
						<span class="activity-separator">•</span>
						<span class="activity-volume">{formatCompactNumber(workout.volumeLbs)} lbs</span>
					</div>
				</div>
			</Card>
		{/each}
	</div>
</div>

<style>
	.recent-activity {
		width: 100%;
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	:global(.activity-item) {
		padding: var(--space-4);
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
	}

	.activity-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.activity-content {
		flex: 1;
		min-width: 0;
	}

	.activity-reason {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.875rem;
		color: var(--text-primary);
		margin-bottom: var(--space-2);
		line-height: 1.4;
	}

	.activity-meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.activity-separator {
		color: var(--text-muted);
	}

	.activity-date,
	.activity-volume {
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.activity-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-1);
		}

		.activity-separator {
			display: none;
		}
	}
</style>
