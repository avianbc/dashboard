<script lang="ts">
	import type { PageData } from './$types';
	import { Card, Button, Loading, Error as ErrorComponent } from '$lib/components/ui';
	import { VolumeChart, BigThreeChart } from '$lib/components/charts';
	import { unitSystem, theme } from '$lib/stores';
	import { formatCompactNumber, formatNumber } from '$lib/utils';
	import { Calendar, Dumbbell, Clock, Route, Repeat, Trophy, Moon, Sun } from 'lucide-svelte';

	// Get data from page load
	let { data }: { data: PageData } = $props();

	let currentTheme = $state('dark');
	let currentUnit = $state('imperial');

	// Subscribe to stores
	$effect(() => {
		const unsubTheme = theme.subscribe((value) => {
			currentTheme = value;
		});
		return unsubTheme;
	});

	$effect(() => {
		const unsubUnit = unitSystem.subscribe((value) => {
			currentUnit = value;
		});
		return unsubUnit;
	});

	const trainingData = data.trainingData;
	const summary = trainingData.summary;
	const volumeTimeSeries = trainingData.volumeTimeSeries;
	const barTravel = trainingData.barTravel;
	const powerliftingTotals = trainingData.powerliftingTotals;
	const bigThreeE1RM = trainingData.bigThreeE1RM;
	const allTimePRs = trainingData.allTimePRs;
</script>

<div class="dashboard">
	<!-- Header -->
	<header class="dashboard-header">
		<div class="container">
			<div class="header-content">
				<div>
					<h1>Iron Archive</h1>
					<p class="text-secondary">6+ Years of Training Data</p>
				</div>
				<div class="header-controls">
					<Button
						variant="outline"
						size="sm"
						onclick={() => theme.toggle()}
						title={currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
					>
						{#if currentTheme === 'dark'}
							<Sun size={16} />
						{:else}
							<Moon size={16} />
						{/if}
					</Button>
					<Button variant="outline" size="sm" onclick={() => unitSystem.toggle()}>
						{currentUnit === 'imperial' ? 'lbs → kg' : 'kg → lbs'}
					</Button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container py-8">
		<!-- Hero Stats Cards -->
		<section class="mb-12">
			<div class="stats-grid">
				<!-- Total Workouts -->
				<Card hover class="stat-card">
					<div class="stat-icon">
						<Calendar size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Total Workouts</div>
						<div class="stat-value">{formatNumber(summary.totalWorkouts)}</div>
						<div class="stat-subtitle">Since Jan 2019</div>
					</div>
				</Card>

				<!-- Total Volume -->
				<Card hover class="stat-card">
					<div class="stat-icon">
						<Dumbbell size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Total Volume</div>
						<div class="stat-value">{formatCompactNumber(summary.totalVolumeLbs)}</div>
						<div class="stat-subtitle">
							{(summary.totalVolumeLbs / 2000).toFixed(0)} tons lifted
						</div>
					</div>
				</Card>

				<!-- Time Training -->
				<Card hover class="stat-card">
					<div class="stat-icon">
						<Clock size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Time Training</div>
						<div class="stat-value">{formatNumber(summary.totalHours)}</div>
						<div class="stat-subtitle">{(summary.totalHours / 24).toFixed(0)} days of your life</div>
					</div>
				</Card>

				<!-- Bar Travel -->
				<Card hover class="stat-card">
					<div class="stat-icon">
						<Route size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Bar Travel</div>
						<div class="stat-value">{barTravel.total.miles.toFixed(1)} mi</div>
						<div class="stat-subtitle">{barTravel.landmarks.everestClimbs.toFixed(1)} Everests</div>
					</div>
				</Card>

				<!-- Total Reps -->
				<Card hover class="stat-card">
					<div class="stat-icon">
						<Repeat size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Total Reps</div>
						<div class="stat-value">{formatCompactNumber(summary.totalReps)}</div>
						<div class="stat-subtitle">{formatNumber(summary.totalSets)} total sets</div>
					</div>
				</Card>

				<!-- Powerlifting Total -->
				<Card hover class="stat-card">
					<div class="stat-icon">
						<Trophy size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Powerlifting Total</div>
						<div class="stat-value">{formatNumber(powerliftingTotals.current.totalLbs)}</div>
						<div class="stat-subtitle">1200+ club member</div>
					</div>
				</Card>
			</div>
		</section>

		<!-- Volume Over Time Chart -->
		<section class="mb-12">
			<Card padding="lg">
				<VolumeChart data={volumeTimeSeries} />
			</Card>
		</section>

		<!-- Big Three + OHP Progression Chart -->
		<section class="mb-12">
			<Card padding="lg">
				<BigThreeChart data={bigThreeE1RM} {allTimePRs} />
			</Card>
		</section>

		<!-- Phase 3.2 Complete Badge -->
		<section class="mb-12">
			<Card padding="lg" class="text-center bg-elevated">
				<div class="text-4xl mb-4">💪</div>
				<h3 class="mb-2">Phase 3.2 Complete</h3>
				<p class="text-secondary">
					Big Three + OHP progression chart with lift toggles, PR markers, plate milestones, and
					interactive tooltips showing actual weight × reps.
				</p>
			</Card>
		</section>
	</main>
</div>

<style>
	.dashboard {
		min-height: 100vh;
		background: var(--bg-deep);
	}

	.dashboard-header {
		background: var(--bg-elevated);
		border-bottom: 1px solid var(--bg-card);
		padding: var(--space-6) 0;
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(8px);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
	}

	.header-controls {
		display: flex;
		gap: var(--space-2);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
	}

	.stat-card {
		padding: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		position: relative;
		overflow: hidden;
	}

	.stat-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--accent-copper), var(--accent-gold));
		opacity: 0;
		transition: opacity var(--transition-normal);
	}

	.stat-card:hover::before {
		opacity: 1;
	}

	.stat-icon {
		color: var(--accent-copper);
		width: fit-content;
	}

	.stat-content {
		flex: 1;
	}

	.stat-label {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.875rem;
		color: var(--text-muted);
		margin-bottom: var(--space-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 2.5rem;
		font-weight: bold;
		color: var(--text-primary);
		line-height: 1;
		margin-bottom: var(--space-2);
	}

	.stat-subtitle {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}

		.header-controls {
			justify-content: center;
		}

		.stats-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: var(--space-3);
		}

		.stat-value {
			font-size: 2rem;
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
