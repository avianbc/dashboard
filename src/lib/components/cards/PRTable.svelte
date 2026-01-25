<script lang="ts">
	import type { AllTimePRs } from '$lib/types/training';
	import { formatDate, lbsToKg } from '$lib/utils';
	import { unitSystem } from '$lib/stores';
	import { LIFTS } from '$lib/config';

	interface Props {
		data: AllTimePRs;
	}

	let { data }: Props = $props();

	// Use shared lift configuration
	const lifts = LIFTS.map((lift) => ({
		name: lift.name === 'Overhead Press' ? 'OHP' : lift.name === 'Bench Press' ? 'Bench' : lift.name,
		key: lift.key,
		color: lift.color
	}));

	// Get common rep ranges we care about
	const repRanges = [1, 3, 5, 8, 10];

	function getPRForReps(liftData: any, reps: number) {
		// repPRs is an object with keys being the rep numbers
		const pr = liftData.repPRs[reps];
		return pr ? pr.weightLbs : null;
	}

	function displayWeight(weightLbs: number | null): string {
		if (weightLbs === null) return '—';
		const weight = unitSystem.current === 'imperial' ? weightLbs : lbsToKg(weightLbs);
		return Math.round(weight).toString();
	}
</script>

<div class="pr-table-container">
	<h3 class="section-title">Personal Records by Rep Range</h3>
	<div class="table-wrapper">
		<table class="pr-table">
			<thead>
				<tr>
					<th>Lift</th>
					{#each repRanges as reps}
						<th>{reps}RM</th>
					{/each}
					<th>Best E1RM</th>
				</tr>
			</thead>
			<tbody>
				{#each lifts as lift}
					{@const liftData = data[lift.key]}
					<tr style="--lift-color: {lift.color}">
						<td class="lift-name">{lift.name}</td>
						{#each repRanges as reps}
							{@const prWeight = getPRForReps(liftData, reps)}
							<td class="pr-value">
								{displayWeight(prWeight)}
							</td>
						{/each}
						<td class="e1rm-value">
							{displayWeight(liftData.bestE1rm.e1rmLbs)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="table-note">All weights in {unitSystem.current === 'imperial' ? 'lbs' : 'kg'}. E1RM = Estimated 1 Rep Max</p>
</div>

<style>
	.pr-table-container {
		width: 100%;
	}

	.table-wrapper {
		overflow-x: auto;
		border-radius: var(--radius-md);
		border: 1px solid var(--bg-card);
	}

	.pr-table {
		width: 100%;
		border-collapse: collapse;
		font-family: 'JetBrains Mono', monospace;
	}

	.pr-table thead {
		background: var(--bg-elevated);
	}

	.pr-table th {
		padding: var(--space-3);
		text-align: left;
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		border-bottom: 2px solid var(--bg-card);
	}

	.pr-table td {
		padding: var(--space-3);
		border-bottom: 1px solid var(--bg-card);
	}

	.pr-table tbody tr {
		transition: background-color var(--transition-fast);
		border-left: 3px solid var(--lift-color);
	}

	.pr-table tbody tr:hover {
		background: var(--bg-elevated);
	}

	.lift-name {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 0.875rem;
	}

	.pr-value,
	.e1rm-value {
		text-align: center;
		color: var(--text-primary);
		font-size: 0.875rem;
	}

	.e1rm-value {
		font-weight: 600;
		color: var(--accent-copper);
	}

	.table-note {
		margin-top: var(--space-2);
		font-size: 0.75rem;
		color: var(--text-muted);
		font-family: 'Source Sans 3', sans-serif;
	}

	@media (max-width: 768px) {
		.pr-table {
			font-size: 0.75rem;
		}

		.pr-table th,
		.pr-table td {
			padding: var(--space-2);
		}
	}
</style>
