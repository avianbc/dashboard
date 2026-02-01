<script lang="ts">
	import type { PlateMilestones } from '$lib/types/training';
	import { unitSystem } from '$lib/stores/units.svelte';
	import { Trophy, Lock, Check } from 'lucide-svelte';
	import { LIFTS as LIFT_CONFIG } from '$lib/config';

	interface Props {
		data: PlateMilestones;
	}

	let { data }: Props = $props();

	// Plate numbers and their weights
	const PLATES = [
		{ num: 1, lbs: 135, kg: 60 },
		{ num: 2, lbs: 225, kg: 100 },
		{ num: 3, lbs: 315, kg: 140 },
		{ num: 4, lbs: 405, kg: 180 },
		{ num: 5, lbs: 495, kg: 225 }
	];

	// Lifts in display order with colors from design tokens
	const LIFTS = [
		{ key: 'squat' as const, label: 'Squat', color: LIFT_CONFIG[0].color },
		{ key: 'bench' as const, label: 'Bench', color: LIFT_CONFIG[1].color },
		{ key: 'deadlift' as const, label: 'Deadlift', color: LIFT_CONFIG[2].color },
		{ key: 'ohp' as const, label: 'OHP', color: LIFT_CONFIG[3].color }
	];

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	}

	function getMilestone(liftKey: keyof PlateMilestones, plateNum: number) {
		const milestones = data[liftKey];
		return milestones?.[plateNum.toString()] || null;
	}

	function getWeight(plateNum: number): string {
		const plate = PLATES.find((p) => p.num === plateNum);
		if (!plate) return '';
		return unitSystem.current === 'imperial' ? `${plate.lbs}` : `${plate.kg}`;
	}
</script>

<div class="plate-milestones">
	<div class="header">
		<Trophy size={24} class="icon" />
		<h3>Plate Milestones</h3>
	</div>
	<p class="subtitle">Working sets with standard plate loadings</p>

	<div class="grid">
		<!-- Header row with plate numbers -->
		<div class="grid-header">
			<div class="lift-label"></div>
			{#each PLATES as plate}
				<div class="plate-header">
					<span class="plate-num"
						>{plate.num}
						<span class="plate-suffix">{plate.num === 1 ? 'plate' : 'plates'}</span></span
					>
					<span class="plate-weight"
						>{unitSystem.current === 'imperial' ? plate.lbs : plate.kg}
						{unitSystem.current === 'imperial' ? 'lbs' : 'kg'}</span
					>
				</div>
			{/each}
		</div>

		<!-- Lift rows -->
		{#each LIFTS as lift}
			<div class="grid-row" style="--lift-color: {lift.color}">
				<div class="lift-label">
					<span class="lift-indicator" style="background-color: {lift.color}"></span>
					<span class="lift-name">{lift.label}</span>
				</div>
				{#each PLATES as plate}
					{@const milestone = getMilestone(lift.key, plate.num)}
					<div class="milestone-cell" class:achieved={milestone} class:locked={!milestone}>
						{#if milestone}
							<div class="achieved-content">
								<Check size={18} strokeWidth={3} class="check-icon" />
								<span class="date">{formatDate(milestone.date)}</span>
							</div>
						{:else}
							<div class="locked-content">
								<Lock size={16} />
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<p class="legend">
		<span class="legend-item"
			><Check size={12} strokeWidth={3} class="legend-check" /> Achieved</span
		>
		<span class="legend-item"><Lock size={12} /> Locked</span>
	</p>
</div>

<style>
	.plate-milestones {
		padding: var(--space-4);
	}

	.header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-1);
	}

	.header :global(.icon) {
		color: var(--accent-gold);
	}

	.header h3 {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
	}

	.subtitle {
		margin: 0 0 var(--space-6) 0;
		color: var(--text-tertiary);
		font-size: var(--text-sm);
	}

	.grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.grid-header,
	.grid-row {
		display: grid;
		grid-template-columns: 100px repeat(5, 1fr);
		gap: var(--space-2);
		align-items: center;
	}

	.plate-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.plate-num {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		font-family: var(--font-mono);
	}

	.plate-suffix {
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin-left: 1px;
	}

	.plate-weight {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.lift-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 40px;
	}

	.lift-indicator {
		width: 10px;
		height: 10px;
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}

	.lift-name {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--text-primary);
	}

	.milestone-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 56px;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.milestone-cell.achieved {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--lift-color) 20%, transparent),
			color-mix(in srgb, var(--lift-color) 10%, transparent)
		);
		border: 1px solid color-mix(in srgb, var(--lift-color) 40%, transparent);
	}

	.milestone-cell.locked {
		background: var(--bg-elevated);
		border: 1px dashed var(--border-subtle);
	}

	.achieved-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.achieved-content :global(.check-icon) {
		color: var(--lift-color);
	}

	.date {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.locked-content {
		color: var(--text-tertiary);
		opacity: 0.5;
	}

	.legend {
		display: flex;
		gap: var(--space-6);
		justify-content: center;
		margin-top: var(--space-4);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.legend-item :global(.legend-check) {
		color: var(--status-recent);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.grid-header,
		.grid-row {
			grid-template-columns: 80px repeat(5, 1fr);
			gap: var(--space-1);
		}

		.lift-name {
			display: none;
		}

		.milestone-cell {
			height: 48px;
		}

		.plate-num {
			font-size: var(--text-xs);
		}
	}
</style>
