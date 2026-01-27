<script lang="ts">
	import type { BarTravel } from '$lib/types/training';
	import { unitSystem } from '$lib/stores';
	import { Mountain, Building2, Landmark } from 'lucide-svelte';

	interface Props {
		data: BarTravel;
	}

	let { data }: Props = $props();

	const isMetric = $derived(unitSystem.current === 'metric');
	const totalDistance = $derived(isMetric ? data.total.km : data.total.miles);
	const distanceUnit = $derived(isMetric ? 'km' : 'mi');
</script>

<div class="bar-travel-card">
	<h3 class="title">Bar Travel Distance</h3>
	<p class="subtitle">Total distance the bar has traveled through all your reps</p>

	<div class="total-distance">
		<div class="distance-value">{totalDistance.toFixed(1)}</div>
		<div class="distance-unit">{distanceUnit}</div>
	</div>

	<div class="by-lift">
		<h4>By Lift</h4>
		<div class="lift-grid">
			<div class="lift-item">
				<div class="lift-name">Bench Press</div>
				<div class="lift-distance">
					{isMetric
						? data.byLift.bench.totalKm.toFixed(1)
						: data.byLift.bench.totalMiles.toFixed(1)}
					{distanceUnit}
				</div>
			</div>
			<div class="lift-item">
				<div class="lift-name">Squat</div>
				<div class="lift-distance">
					{isMetric
						? data.byLift.squat.totalKm.toFixed(1)
						: data.byLift.squat.totalMiles.toFixed(1)}
					{distanceUnit}
				</div>
			</div>
			<div class="lift-item">
				<div class="lift-name">OHP</div>
				<div class="lift-distance">
					{isMetric ? data.byLift.ohp.totalKm.toFixed(1) : data.byLift.ohp.totalMiles.toFixed(1)}
					{distanceUnit}
				</div>
			</div>
			<div class="lift-item">
				<div class="lift-name">Deadlift</div>
				<div class="lift-distance">
					{isMetric
						? data.byLift.deadlift.totalKm.toFixed(1)
						: data.byLift.deadlift.totalMiles.toFixed(1)}
					{distanceUnit}
				</div>
			</div>
		</div>
	</div>

	<div class="landmarks">
		<h4>Equivalent To</h4>
		<div class="landmark-grid">
			<div class="landmark-item">
				<div class="landmark-icon"><Mountain size={32} strokeWidth={1.5} /></div>
				<div class="landmark-info">
					<div class="landmark-value">{data.landmarks.everestClimbs.toFixed(2)}×</div>
					<div class="landmark-name">Mt. Everest</div>
				</div>
			</div>
			<div class="landmark-item">
				<div class="landmark-icon"><Building2 size={32} strokeWidth={1.5} /></div>
				<div class="landmark-info">
					<div class="landmark-value">{data.landmarks.empireStateClimbs.toFixed(1)}×</div>
					<div class="landmark-name">Empire State</div>
				</div>
			</div>
			<div class="landmark-item">
				<div class="landmark-icon"><Landmark size={32} strokeWidth={1.5} /></div>
				<div class="landmark-info">
					<div class="landmark-value">{data.landmarks.eiffelTowerClimbs.toFixed(1)}×</div>
					<div class="landmark-name">Eiffel Tower</div>
				</div>
			</div>
			<div class="landmark-item">
				<div class="landmark-icon"><Landmark size={32} strokeWidth={1.5} /></div>
				<div class="landmark-info">
					<div class="landmark-value">{data.landmarks.statueOfLibertyClimbs.toFixed(0)}×</div>
					<div class="landmark-name">Statue of Liberty</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.bar-travel-card {
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

	.total-distance {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: var(--space-2);
		margin-bottom: var(--space-8);
		padding: var(--space-6);
		background: linear-gradient(135deg, rgba(193, 127, 89, 0.1), rgba(212, 168, 75, 0.1));
		border-radius: var(--radius-lg);
		border: 2px solid var(--accent-copper);
	}

	.distance-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 3.5rem;
		font-weight: bold;
		color: var(--accent-copper);
		line-height: 1;
	}

	.distance-unit {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 1.5rem;
		color: var(--text-secondary);
	}

	.by-lift,
	.landmarks {
		margin-bottom: var(--space-6);
	}

	.by-lift h4,
	.landmarks h4 {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 1.125rem;
		color: var(--text-primary);
		margin-bottom: var(--space-3);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.lift-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-3);
	}

	.lift-item {
		padding: var(--space-3);
		background: var(--bg-elevated);
		border-radius: var(--radius-md);
		border: 1px solid var(--bg-card);
	}

	.lift-name {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-1);
	}

	.lift-distance {
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.125rem;
		font-weight: bold;
		color: var(--text-primary);
	}

	.landmark-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-3);
	}

	.landmark-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--bg-elevated);
		border-radius: var(--radius-md);
		border: 1px solid var(--bg-card);
	}

	.landmark-icon {
		color: var(--accent-copper);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.landmark-info {
		flex: 1;
	}

	.landmark-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.125rem;
		font-weight: bold;
		color: var(--accent-gold);
	}

	.landmark-name {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	@media (max-width: 768px) {
		.lift-grid,
		.landmark-grid {
			grid-template-columns: 1fr;
		}

		.distance-value {
			font-size: 2.5rem;
		}
	}
</style>
