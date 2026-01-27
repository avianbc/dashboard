<script lang="ts">
	import type { Program } from '$lib/types/training';
	import { unitSystem } from '$lib/stores';
	import { formatNumber, formatCompactNumber } from '$lib/utils';
	import { Badge } from '$lib/components/ui';
	import { format } from 'date-fns';

	interface Props {
		data: Program[];
	}

	let { data }: Props = $props();

	const isMetric = $derived(unitSystem.current === 'metric');

	// Sort programs by total volume (descending)
	const sortedPrograms = $derived(
		[...data].sort((a, b) => {
			const aVol = isMetric ? a.totalVolumeKg : a.totalVolumeLbs;
			const bVol = isMetric ? b.totalVolumeKg : b.totalVolumeLbs;
			return bVol - aVol;
		})
	);

	// Get top 10 programs
	const topPrograms = $derived(sortedPrograms.slice(0, 10));
</script>

<div class="program-comparison">
	<h3 class="title">Training Program Comparison</h3>
	<p class="subtitle">Effectiveness and volume by program</p>

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th class="program-name">Program</th>
					<th class="text-center">Duration</th>
					<th class="text-center">Workouts</th>
					<th class="text-right">Total Volume</th>
					<th class="text-center">PRs Set</th>
				</tr>
			</thead>
			<tbody>
				{#each topPrograms as program, index (program.name)}
					<tr class:highlight={index < 3}>
						<td class="program-name">
							<div class="program-name-cell">
								{#if index < 3}
									<Badge variant="numbered">{index + 1}</Badge>
								{/if}
								<span>{program.name}</span>
							</div>
						</td>
						<td class="text-center duration">
							{format(new Date(program.startDate), 'MMM yyyy')}
							-
							{format(new Date(program.endDate), 'MMM yyyy')}
						</td>
						<td class="text-center workouts">
							{formatNumber(program.workouts)}
						</td>
						<td class="text-right volume">
							{formatCompactNumber(isMetric ? program.totalVolumeKg : program.totalVolumeLbs)}
							{isMetric ? 'kg' : 'lbs'}
						</td>
						<td class="text-center prs">
							<Badge variant="muted">{program.prsSet}</Badge>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.program-comparison {
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

	.table-wrapper {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: var(--bg-elevated);
		border-bottom: 2px solid var(--bg-card);
	}

	th {
		padding: var(--space-3);
		font-family: 'Bebas Neue', sans-serif;
		font-size: 0.875rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: normal;
	}

	td {
		padding: var(--space-3);
		border-bottom: 1px solid var(--bg-card);
		font-size: 0.875rem;
	}

	tr.highlight {
		background: linear-gradient(90deg, rgba(212, 168, 75, 0.1), transparent);
	}

	tr:hover {
		background: var(--bg-elevated);
	}

	tr.highlight:hover {
		background: linear-gradient(90deg, rgba(212, 168, 75, 0.15), rgba(212, 168, 75, 0.05));
	}

	.program-name-cell {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}


	.program-name {
		text-align: left;
		font-weight: 600;
		color: var(--text-primary);
	}

	.text-center {
		text-align: center;
	}

	.text-right {
		text-align: right;
	}

	.duration {
		color: var(--text-secondary);
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.workouts {
		font-family: 'JetBrains Mono', monospace;
		color: var(--text-primary);
	}

	.volume {
		font-family: 'JetBrains Mono', monospace;
		color: var(--text-primary);
		font-weight: 600;
	}


	@media (max-width: 768px) {
		th,
		td {
			padding: var(--space-2);
			font-size: 0.75rem;
		}

		.duration {
			display: none;
		}
	}
</style>
