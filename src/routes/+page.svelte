<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const { trainingData } = data;
</script>

<main>
	<h1>Strength Training Dashboard</h1>

	{#if trainingData}
		<section>
			<h2>Summary Stats</h2>
			<div class="stats-grid">
				<div class="stat-card">
					<h3>Total Workouts</h3>
					<p class="stat-value">{trainingData.summary.totalWorkouts}</p>
				</div>
				<div class="stat-card">
					<h3>Total Volume</h3>
					<p class="stat-value">{(trainingData.summary.totalVolumeLbs / 1_000_000).toFixed(1)}M lbs</p>
				</div>
				<div class="stat-card">
					<h3>Total Hours</h3>
					<p class="stat-value">{trainingData.summary.totalHours.toFixed(0)}</p>
				</div>
				<div class="stat-card">
					<h3>Total Reps</h3>
					<p class="stat-value">{trainingData.summary.totalReps.toLocaleString()}</p>
				</div>
			</div>
		</section>
	{:else}
		<p>Loading training data...</p>
	{/if}
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 2rem;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: #f5f5f5;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.stat-card h3 {
		font-size: 0.875rem;
		color: #666;
		margin: 0 0 0.5rem 0;
		text-transform: uppercase;
		font-weight: 600;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: bold;
		margin: 0;
		color: #333;
	}
</style>
