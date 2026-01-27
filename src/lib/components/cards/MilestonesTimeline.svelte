<script lang="ts">
	import type { ComponentType } from 'svelte';
	import type { Milestone } from '$lib/types/training';
	import { unitSystem } from '$lib/stores';
	import { format } from 'date-fns';
	import { formatCompactNumber } from '$lib/utils';
	import { BarChart3, Dumbbell, Trophy, Star } from 'lucide-svelte';

	interface Props {
		data: Milestone[];
	}

	let { data }: Props = $props();

	const isMetric = $derived(unitSystem.current === 'metric');

	// Sort milestones by date (descending - newest first)
	const sortedMilestones = $derived(
		[...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	);

	function getIcon(milestone: string): ComponentType {
		if (milestone.includes('volume') || milestone.includes('lbs')) {
			return BarChart3;
		} else if (milestone.includes('workout')) {
			return Dumbbell;
		} else if (milestone.includes('PR') || milestone.includes('record')) {
			return Trophy;
		} else {
			return Star;
		}
	}
</script>

<div class="milestones-timeline">
	<h3 class="title">Achievement Timeline</h3>
	<p class="subtitle">Major milestones and volume thresholds reached</p>

	<div class="timeline">
		{#each sortedMilestones as milestone (milestone.date)}
			{@const IconComponent = getIcon(milestone.milestone)}
			<div class="timeline-item">
				<div class="timeline-marker">
					<div class="marker-icon"><IconComponent size={20} strokeWidth={2} /></div>
					<div class="marker-line"></div>
				</div>
				<div class="timeline-content">
					<div class="milestone-date">{format(new Date(milestone.date), 'MMM d, yyyy')}</div>
					<div class="milestone-text">{milestone.milestone}</div>
					{#if milestone.volumeLbs}
						<div class="milestone-volume">
							{formatCompactNumber(isMetric ? milestone.volumeKg || 0 : milestone.volumeLbs)}
							{isMetric ? 'kg' : 'lbs'} total volume
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.milestones-timeline {
		padding: var(--space-2);
	}

	.title {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 1.5rem;
		color: var(--text-primary);
		margin-bottom: var(--space-1);
	}

	.subtitle {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-bottom: var(--space-6);
	}

	.timeline {
		position: relative;
	}

	.timeline-item {
		display: flex;
		gap: var(--space-4);
		position: relative;
	}

	.timeline-item:last-child .marker-line {
		display: none;
	}

	.timeline-marker {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.marker-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-elevated);
		border: 2px solid var(--accent-copper);
		border-radius: 50%;
		color: var(--accent-copper);
		z-index: 1;
		flex-shrink: 0;
	}

	.marker-line {
		width: 2px;
		height: 100%;
		background: linear-gradient(to bottom, var(--accent-copper), var(--bg-card));
		position: absolute;
		top: 40px;
		left: 50%;
		transform: translateX(-50%);
	}

	.timeline-content {
		flex: 1;
		padding-bottom: var(--space-6);
	}

	.milestone-date {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-bottom: var(--space-1);
	}

	.milestone-text {
		font-size: 1rem;
		color: var(--text-primary);
		font-weight: 600;
		margin-bottom: var(--space-1);
		line-height: 1.4;
	}

	.milestone-volume {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		color: var(--accent-copper);
	}
</style>
