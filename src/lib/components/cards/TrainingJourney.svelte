<script lang="ts">
	import type { ComponentType } from 'svelte';
	import type { NotableWorkout, Milestone } from '$lib/types/training';
	import { unitSystem } from '$lib/stores';
	import { format } from 'date-fns';
	import { formatCompactNumber } from '$lib/utils';
	import { Card } from '$lib/components/ui';
	import { Flame, Dumbbell, Star, Trophy, BarChart3, TrendingUp, Calendar } from 'lucide-svelte';
	import { SegmentedControl } from '$lib/components/ui';

	interface Props {
		notableWorkouts: NotableWorkout[];
		milestones: Milestone[];
	}

	let { notableWorkouts, milestones }: Props = $props();

	type EventCategory = 'all' | 'pr' | 'milestone' | 'volume' | 'comeback' | 'cardio';

	interface TimelineEvent {
		date: string;
		title: string;
		category: EventCategory;
		volumeLbs?: number;
		volumeKg?: number;
		source: 'workout' | 'milestone';
	}

	let activeFilter: EventCategory = $state('all');
	let showAll = $state(false);

	const isMetric = $derived(unitSystem.current === 'metric');

	// Merge and normalize both data sources into unified timeline events
	const allEvents = $derived.by(() => {
		const events: TimelineEvent[] = [];

		// Add notable workouts
		for (const workout of notableWorkouts) {
			events.push({
				date: workout.date,
				title: workout.reason,
				category: normalizeCategory(workout.category),
				volumeLbs: workout.volumeLbs,
				volumeKg: workout.volumeKg,
				source: 'workout'
			});
		}

		// Add milestones
		for (const milestone of milestones) {
			events.push({
				date: milestone.date,
				title: milestone.milestone,
				category: categorizeMilestone(milestone.milestone),
				volumeLbs: milestone.volumeLbs,
				volumeKg: milestone.volumeKg,
				source: 'milestone'
			});
		}

		// Sort by date descending (newest first)
		return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	});

	// Filter events based on active filter
	const filteredEvents = $derived(
		activeFilter === 'all' ? allEvents : allEvents.filter((e) => e.category === activeFilter)
	);

	// Limit display unless "show all" is enabled
	const displayedEvents = $derived(showAll ? filteredEvents : filteredEvents.slice(0, 15));

	const hasMore = $derived(filteredEvents.length > 15 && !showAll);

	function normalizeCategory(category: string): EventCategory {
		switch (category) {
			case 'comeback':
				return 'comeback';
			case 'volume':
				return 'volume';
			case 'pr':
				return 'pr';
			case 'milestone':
				return 'milestone';
			case 'cardio':
				return 'cardio';
			default:
				return 'volume';
		}
	}

	function categorizeMilestone(text: string | undefined): EventCategory {
		const lower = (text ?? '').toLowerCase();
		if (lower.includes('pr') || lower.includes('record') || lower.includes('personal best')) {
			return 'pr';
		} else if (lower.includes('volume') || lower.includes('lbs') || lower.includes('kg')) {
			return 'volume';
		} else if (lower.includes('workout') || lower.includes('session')) {
			return 'milestone';
		}
		return 'milestone';
	}

	function getIcon(category: EventCategory): ComponentType {
		switch (category) {
			case 'comeback':
				return Flame;
			case 'volume':
				return TrendingUp;
			case 'pr':
				return Star;
			case 'milestone':
				return Trophy;
			case 'cardio':
				return Flame;
			default:
				return BarChart3;
		}
	}

	function getColor(category: EventCategory): string {
		switch (category) {
			case 'comeback':
				return 'var(--status-pr)';
			case 'volume':
				return 'var(--lift-deadlift)';
			case 'pr':
				return 'var(--accent-gold)';
			case 'milestone':
				return 'var(--accent-copper)';
			case 'cardio':
				return '#e04040';
			default:
				return 'var(--text-secondary)';
		}
	}

	function getCategoryLabel(category: EventCategory): string {
		switch (category) {
			case 'all':
				return 'All';
			case 'comeback':
				return 'Comebacks';
			case 'volume':
				return 'Volume';
			case 'pr':
				return 'PRs';
			case 'milestone':
				return 'Milestones';
			case 'cardio':
				return 'Cardio';
			default:
				return 'All';
		}
	}

	const filterOptions: EventCategory[] = ['all', 'milestone', 'volume', 'comeback', 'cardio'];
</script>

<div class="training-journey">
	<div class="header">
		<div class="header-text">
			<h3 class="title">Training Journey</h3>
			<p class="subtitle">Your milestones, PRs, and notable sessions</p>
		</div>
	</div>

	<!-- Filter controls -->
	<div class="filters">
		<SegmentedControl
			options={filterOptions.map((f) => ({ value: f, label: getCategoryLabel(f) }))}
			value={activeFilter}
			onchange={(v) => {
				activeFilter = v as EventCategory;
				showAll = false;
			}}
			size="sm"
			aria-label="Filter timeline events"
		/>
	</div>

	<!-- Timeline -->
	<div class="timeline">
		{#each displayedEvents as event, i (`${event.date}-${event.title}-${i}`)}
			{@const IconComponent = getIcon(event.category)}
			{@const color = getColor(event.category)}
			<div class="timeline-item">
				<div class="timeline-marker">
					<div class="marker-icon" style="border-color: {color}; color: {color}">
						<IconComponent size={18} strokeWidth={2} />
					</div>
					{#if i < displayedEvents.length - 1}
						<div class="marker-line"></div>
					{/if}
				</div>
				<div class="timeline-content">
					<div class="event-header">
						<span class="event-date">{format(new Date(event.date), 'MMM d, yyyy')}</span>
						<span class="event-badge" style="background: {color}20; color: {color}">
							{getCategoryLabel(event.category)}
						</span>
					</div>
					<div class="event-title">{event.title}</div>
					{#if event.volumeLbs}
						<div class="event-volume">
							{formatCompactNumber(isMetric ? event.volumeKg || 0 : event.volumeLbs)}
							{isMetric ? 'kg' : 'lbs'}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	{#if hasMore}
		<button class="show-more" onclick={() => (showAll = true)}>
			Show all {filteredEvents.length} events
		</button>
	{/if}

	{#if filteredEvents.length === 0}
		<div class="empty-state">
			<Calendar size={48} strokeWidth={1.5} />
			<p>No events found for this filter</p>
		</div>
	{/if}
</div>

<style>
	.training-journey {
		width: 100%;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-4);
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
	}

	.filters {
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

	.timeline-marker {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		flex-shrink: 0;
	}

	.marker-icon {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-elevated);
		border: 2px solid;
		border-radius: 50%;
		z-index: 1;
	}

	.marker-line {
		width: 2px;
		flex: 1;
		min-height: var(--space-4);
		background: linear-gradient(to bottom, var(--border-subtle), transparent);
		position: absolute;
		top: 36px;
		left: 50%;
		transform: translateX(-50%);
		height: calc(100% - 36px);
	}

	.timeline-content {
		flex: 1;
		padding-bottom: var(--space-5);
		min-width: 0;
	}

	.event-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-1);
		flex-wrap: wrap;
	}

	.event-date {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.event-badge {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.event-title {
		font-size: 0.9375rem;
		color: var(--text-primary);
		font-weight: 500;
		line-height: 1.4;
		margin-bottom: var(--space-1);
	}

	.event-volume {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.show-more {
		width: 100%;
		padding: var(--space-3);
		border: 1px dashed var(--border-subtle);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-secondary);
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s ease;
		margin-top: var(--space-2);
	}

	.show-more:hover {
		border-color: var(--accent-copper);
		color: var(--accent-copper);
		background: var(--bg-elevated);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-8);
		color: var(--text-muted);
		gap: var(--space-3);
	}

	.empty-state p {
		font-size: 0.875rem;
	}

	@media (max-width: 640px) {
		.marker-icon {
			width: 32px;
			height: 32px;
		}

		.marker-line {
			top: 32px;
			height: calc(100% - 32px);
		}

		.event-title {
			font-size: 0.875rem;
		}
	}
</style>
