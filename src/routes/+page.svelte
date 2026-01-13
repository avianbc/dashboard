<script lang="ts">
	import type { PageData } from './$types';
	import { Card, Button, Loading, Error as ErrorComponent, LazyChart } from '$lib/components/ui';
	import {
		VolumeChart,
		BigThreeChart,
		ExerciseDistributionChart,
		CalendarHeatmap,
		WorkoutFrequencyChart,
		DayOfWeekChart,
		PowerliftingTotalChart,
		RelativeStrengthChart,
		ProgramComparisonChart
	} from '$lib/components/charts';
	import {
		PRTable,
		DaysSincePR,
		RecentActivity,
		BarTravelCard,
		MilestonesTimeline
	} from '$lib/components/cards';
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
	// Transform powerliftingTotals.clubMilestones from object to clubs array
	const powerliftingTotals = {
		...trainingData.powerliftingTotals,
		clubs: Object.entries(trainingData.powerliftingTotals?.clubMilestones || {}).map(
			([name, milestone]: [string, any]) => ({
				name: `${name}lb Club`,
				totalLbs: milestone.totalLbs,
				dateAchieved: milestone.date
			})
		)
	};
	const bigThreeE1RM = trainingData.bigThreeE1RM;
	const allTimePRs = trainingData.allTimePRs;
	const daysSinceLastPR = trainingData.daysSinceLastPR;
	const exerciseProgress = trainingData.exerciseProgress;
	const workoutCalendar = trainingData.workoutCalendar;
	const notableWorkouts = trainingData.notableWorkouts;
	// Transform workoutsByDayOfWeek from object to array
	const workoutsByDayOfWeek = Object.entries(trainingData.workoutsByDayOfWeek || {}).map(
		([day, stats]: [string, any]) => ({
			day,
			count: stats.count,
			avgVolumeLbs: stats.avgVolumeLbs,
			avgVolumeKg: stats.avgVolumeKg
		})
	);
	const programs = trainingData.programs;
	const milestones = trainingData.milestones;
	const relativeStrength = trainingData.relativeStrength;
	const bodyWeight = trainingData.bodyWeight;
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
	<main class="container py-8" role="main" aria-label="Training Dashboard">
		<!-- Hero Stats Cards -->
		<section class="mb-12" aria-label="Summary Statistics">
			<h2 class="visually-hidden">Training Summary Statistics</h2>
			<div class="stats-grid" role="list">
				<!-- Total Workouts -->
				<Card hover class="stat-card" role="listitem" aria-label="Total workouts: {formatNumber(summary.totalWorkouts)}">
					<div class="stat-icon" aria-hidden="true">
						<Calendar size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Total Workouts</div>
						<div class="stat-value">{formatNumber(summary.totalWorkouts)}</div>
						<div class="stat-subtitle">Since Jan 2019</div>
					</div>
				</Card>

				<!-- Total Volume -->
				<Card hover class="stat-card" role="listitem" aria-label="Total volume: {formatCompactNumber(summary.totalVolumeLbs)} pounds">
					<div class="stat-icon" aria-hidden="true">
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
				<Card hover class="stat-card" role="listitem" aria-label="Time training: {formatNumber(summary.totalHours)} hours">
					<div class="stat-icon" aria-hidden="true">
						<Clock size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Time Training</div>
						<div class="stat-value">{formatNumber(summary.totalHours)}</div>
						<div class="stat-subtitle">{(summary.totalHours / 24).toFixed(0)} days of your life</div>
					</div>
				</Card>

				<!-- Bar Travel -->
				<Card hover class="stat-card" role="listitem" aria-label="Bar travel: {barTravel.total.miles.toFixed(1)} miles">
					<div class="stat-icon" aria-hidden="true">
						<Route size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Bar Travel</div>
						<div class="stat-value">{barTravel.total.miles.toFixed(1)} mi</div>
						<div class="stat-subtitle">{barTravel.landmarks.everestClimbs.toFixed(1)} Everests</div>
					</div>
				</Card>

				<!-- Total Reps -->
				<Card hover class="stat-card" role="listitem" aria-label="Total reps: {formatCompactNumber(summary.totalReps)}">
					<div class="stat-icon" aria-hidden="true">
						<Repeat size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Total Reps</div>
						<div class="stat-value">{formatCompactNumber(summary.totalReps)}</div>
						<div class="stat-subtitle">{formatNumber(summary.totalSets)} total sets</div>
					</div>
				</Card>

				<!-- Powerlifting Total -->
				<Card hover class="stat-card" role="listitem" aria-label="Powerlifting total: {formatNumber(powerliftingTotals.current.totalLbs)} pounds">
					<div class="stat-icon" aria-hidden="true">
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
		<section class="mb-12" aria-label="Volume Over Time">
			<Card padding="lg">
				<LazyChart minHeight="400px">
					<VolumeChart data={volumeTimeSeries} />
				</LazyChart>
			</Card>
		</section>

		<!-- Big Three + OHP Progression Chart -->
		<section class="mb-12" aria-label="Big Three and OHP Progression">
			<Card padding="lg">
				<LazyChart minHeight="400px">
					<BigThreeChart data={bigThreeE1RM} {allTimePRs} />
				</LazyChart>
			</Card>
		</section>

		<!-- Exercise Distribution Chart -->
		<section class="mb-12" aria-label="Exercise Distribution">
			<Card padding="lg">
				<LazyChart minHeight="400px">
					<ExerciseDistributionChart data={exerciseProgress} />
				</LazyChart>
			</Card>
		</section>

		<!-- Calendar Heatmap -->
		<section class="mb-12" aria-label="Workout Calendar">
			<Card padding="lg">
				<LazyChart minHeight="300px">
					<CalendarHeatmap data={workoutCalendar} />
				</LazyChart>
			</Card>
		</section>

		<!-- Phase 4: Personal Records & Recent Activity -->
		<div class="two-column-layout mb-12">
			<!-- Personal Records Section -->
			<section>
				<Card padding="lg">
					<PRTable data={allTimePRs} />
				</Card>
			</section>

			<!-- Days Since Last PR -->
			<section>
				<Card padding="lg">
					<DaysSincePR data={daysSinceLastPR} />
				</Card>
			</section>
		</div>

		<!-- Recent Activity Section -->
		<section class="mb-12">
			<Card padding="lg">
				<RecentActivity data={notableWorkouts} />
			</Card>
		</section>

		<!-- Phase 5: Advanced Features -->
		<div class="phase-divider mb-12">
			<h2 class="phase-title">Phase 5: Advanced Visualizations</h2>
		</div>

		<!-- Workout Frequency Analysis -->
		<section class="mb-12">
			<Card padding="lg">
				<LazyChart minHeight="400px">
					<WorkoutFrequencyChart data={volumeTimeSeries} />
				</LazyChart>
			</Card>
		</section>

		<!-- Two-column layout: Day of Week + Powerlifting Total -->
		<div class="two-column-layout mb-12">
			<section>
				<Card padding="lg">
					<LazyChart minHeight="400px">
						<DayOfWeekChart data={workoutsByDayOfWeek} />
					</LazyChart>
				</Card>
			</section>
			<section>
				<Card padding="lg">
					<LazyChart minHeight="400px">
						<PowerliftingTotalChart powerliftingTotals={powerliftingTotals} bigThreeData={bigThreeE1RM} />
					</LazyChart>
				</Card>
			</section>
		</div>

		<!-- Two-column layout: Bar Travel + Relative Strength -->
		<div class="two-column-layout mb-12">
			<section>
				<Card padding="lg">
					<LazyChart minHeight="400px">
						<BarTravelCard data={barTravel} />
					</LazyChart>
				</Card>
			</section>
			<section>
				<Card padding="lg">
					<LazyChart minHeight="400px">
						<RelativeStrengthChart relativeStrength={relativeStrength} bodyWeight={bodyWeight} />
					</LazyChart>
				</Card>
			</section>
		</div>

		<!-- Program Comparison -->
		<section class="mb-12">
			<Card padding="lg">
				<LazyChart minHeight="400px">
					<ProgramComparisonChart data={programs} />
				</LazyChart>
			</Card>
		</section>

		<!-- Milestones Timeline -->
		<section class="mb-12">
			<Card padding="lg">
				<MilestonesTimeline data={milestones} />
			</Card>
		</section>

		<!-- Phase 5 Complete Badge -->
		<section class="mb-12">
			<Card padding="lg" class="text-center bg-elevated">
				<div class="text-4xl mb-4">✅</div>
				<h3 class="mb-2">Phase 5 Complete</h3>
				<p class="text-secondary">
					Advanced visualizations including workout frequency analysis, day of week patterns,
					powerlifting total progress, bar travel infographic, relative strength tracking, program
					comparison, and milestone timeline.
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

	/* Accessibility - Visually hidden but accessible to screen readers */
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
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
		animation: fadeInUp 0.6s ease-out backwards;
	}

	/* Staggered animation for stat cards */
	.stat-card:nth-child(1) {
		animation-delay: 0.1s;
	}
	.stat-card:nth-child(2) {
		animation-delay: 0.2s;
	}
	.stat-card:nth-child(3) {
		animation-delay: 0.3s;
	}
	.stat-card:nth-child(4) {
		animation-delay: 0.4s;
	}
	.stat-card:nth-child(5) {
		animation-delay: 0.5s;
	}
	.stat-card:nth-child(6) {
		animation-delay: 0.6s;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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

	.stat-card:hover {
		transform: translateY(-2px);
		transition: transform var(--transition-normal);
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

	/* Two-column layout for Phase 4 sections */
	.two-column-layout {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: var(--space-6);
	}

	@media (max-width: 900px) {
		.two-column-layout {
			grid-template-columns: 1fr;
		}
	}

	/* Phase divider */
	.phase-divider {
		padding: var(--space-8) 0;
		border-top: 2px solid var(--bg-card);
		border-bottom: 2px solid var(--bg-card);
		text-align: center;
	}

	.phase-title {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 2rem;
		color: var(--accent-copper);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
</style>
