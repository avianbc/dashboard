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
	import { formatCompactNumber, formatNumber, lbsToKg, milesToKm } from '$lib/utils';
	import { Calendar, Dumbbell, Clock, Route, Repeat, Trophy, Moon, Sun, AlertTriangle } from 'lucide-svelte';

	// Get data from page load
	let { data }: { data: PageData } = $props();

	// Check for data loading errors
	const hasError = data.error !== undefined;

	// Add defensive checks for missing data with memoization using $derived
	const trainingData = $derived(data.trainingData || {});
	const summary = $derived(
		trainingData.summary || {
			totalWorkouts: 0,
			totalVolumeLbs: 0,
			totalHours: 0,
			totalReps: 0,
			totalSets: 0
		}
	);
	const volumeTimeSeries = $derived(
		trainingData.volumeTimeSeries || { daily: [], weekly: [], monthly: [] }
	);
	const barTravel = $derived(
		trainingData.barTravel || {
			total: { miles: 0, km: 0 },
			landmarks: { everestClimbs: 0 }
		}
	);
	// Transform powerliftingTotals.clubMilestones from object to clubs array
	const powerliftingTotals = $derived({
		...(trainingData.powerliftingTotals || { current: { totalLbs: 0 } }),
		clubs: Object.entries(trainingData.powerliftingTotals?.clubMilestones || {}).map(
			([name, milestone]: [string, any]) => ({
				name: `${name}lb Club`,
				totalLbs: milestone?.totalLbs || 0,
				dateAchieved: milestone?.date || ''
			})
		)
	});
	const bigThreeE1RM = $derived(trainingData.bigThreeE1RM || {});
	const allTimePRs = $derived(trainingData.allTimePRs || {});
	const daysSinceLastPR = $derived(trainingData.daysSinceLastPR || {});
	const exerciseProgress = $derived(trainingData.exerciseProgress || {});
	const workoutCalendar = $derived(trainingData.workoutCalendar || {});
	const notableWorkouts = $derived(trainingData.notableWorkouts || []);
	// Transform workoutsByDayOfWeek from object to array
	const workoutsByDayOfWeek = $derived(
		Object.entries(trainingData.workoutsByDayOfWeek || {}).map(([day, stats]: [string, any]) => ({
			day,
			count: stats?.count || 0,
			avgVolumeLbs: stats?.avgVolumeLbs || 0,
			avgVolumeKg: stats?.avgVolumeKg || 0
		}))
	);
	const programs = $derived(trainingData.programs || []);
	const milestones = $derived(trainingData.milestones || []);
	const relativeStrength = $derived(trainingData.relativeStrength || {});
	const bodyWeight = $derived(trainingData.bodyWeight || {});
</script>

<div class="dashboard">
	<!-- Skip to main content link for accessibility -->
	<a href="#main-content" class="skip-link">Skip to main content</a>

	<!-- Header -->
	<header class="dashboard-header" role="banner">
		<div class="container">
			<div class="header-content">
				<div>
					<h1 id="page-title">Iron Archive</h1>
					<p class="text-secondary">6+ Years of Training Data</p>
				</div>
				<nav class="header-controls" aria-label="Settings and preferences">
					<Button
						variant="outline"
						size="sm"
						onclick={() => theme.toggle()}
						aria-label={theme.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
						title={theme.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
					>
						{#if theme.current === 'dark'}
							<Sun size={16} aria-hidden="true" />
							<span class="visually-hidden">Light mode</span>
						{:else}
							<Moon size={16} aria-hidden="true" />
							<span class="visually-hidden">Dark mode</span>
						{/if}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onclick={() => unitSystem.toggle()}
						aria-label={`Switch to ${unitSystem.current === 'imperial' ? 'metric' : 'imperial'} units`}
						title={`Currently showing ${unitSystem.current} units. Click to switch.`}
					>
						{unitSystem.current === 'imperial' ? 'lbs → kg' : 'kg → lbs'}
					</Button>
				</nav>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main id="main-content" class="container py-8" role="main" aria-labelledby="page-title">
		<!-- Error Banner -->
		{#if hasError}
			<div class="error-banner" role="alert" aria-live="polite">
				<AlertTriangle size={20} strokeWidth={2} />
				<p>Error loading training data: {data.error}</p>
			</div>
		{/if}

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
				<Card hover class="stat-card" role="listitem" aria-label="Total volume: {formatCompactNumber(unitSystem.current === 'imperial' ? summary.totalVolumeLbs : lbsToKg(summary.totalVolumeLbs))} {unitSystem.current === 'imperial' ? 'pounds' : 'kilograms'}">
					<div class="stat-icon" aria-hidden="true">
						<Dumbbell size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Total Volume</div>
						<div class="stat-value">
						{formatCompactNumber(unitSystem.current === 'imperial' ? summary.totalVolumeLbs : lbsToKg(summary.totalVolumeLbs))}
						<span class="unit-label">{unitSystem.current === 'imperial' ? 'lbs' : 'kg'}</span>
					</div>
						<div class="stat-subtitle">
							{unitSystem.current === 'imperial' ? (summary.totalVolumeLbs / 2000).toFixed(0) : (lbsToKg(summary.totalVolumeLbs) / 1000).toFixed(0)}
							{unitSystem.current === 'imperial' ? 'tons' : 'tonnes'} lifted
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
				<Card hover class="stat-card" role="listitem" aria-label="Bar travel: {(unitSystem.current === 'imperial' ? barTravel.total.miles : milesToKm(barTravel.total.miles)).toFixed(1)} {unitSystem.current === 'imperial' ? 'miles' : 'kilometers'}">
					<div class="stat-icon" aria-hidden="true">
						<Route size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Bar Travel</div>
						<div class="stat-value">
						{(unitSystem.current === 'imperial' ? barTravel.total.miles : milesToKm(barTravel.total.miles)).toFixed(1)}
						<span class="unit-label">{unitSystem.current === 'imperial' ? 'mi' : 'km'}</span>
					</div>
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
				<Card hover class="stat-card" role="listitem" aria-label="Powerlifting total: {formatNumber(unitSystem.current === 'imperial' ? powerliftingTotals.current.totalLbs : lbsToKg(powerliftingTotals.current.totalLbs))} {unitSystem.current === 'imperial' ? 'pounds' : 'kilograms'}">
					<div class="stat-icon" aria-hidden="true">
						<Trophy size={24} />
					</div>
					<div class="stat-content">
						<div class="stat-label">Powerlifting Total</div>
						<div class="stat-value">
						{formatNumber(unitSystem.current === 'imperial' ? powerliftingTotals.current.totalLbs : lbsToKg(powerliftingTotals.current.totalLbs))}
						<span class="unit-label">{unitSystem.current === 'imperial' ? 'lbs' : 'kg'}</span>
					</div>
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
	</main>
</div>

<style>
	.dashboard {
		min-height: 100vh;
		background: var(--bg-deep);
		transition: background-color var(--transition-normal);
	}

	/* Skip link for keyboard navigation */
	.skip-link {
		position: absolute;
		top: -40px;
		left: 0;
		background: var(--accent-copper);
		color: var(--text-inverse);
		padding: var(--space-2) var(--space-4);
		text-decoration: none;
		z-index: 9999;
		border-radius: 0 0 var(--radius-md) 0;
		font-weight: var(--font-weight-semibold);
		transition: top var(--transition-fast);
	}

	.skip-link:focus {
		top: 0;
		outline: 3px solid var(--accent-gold);
		outline-offset: 2px;
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
		z-index: var(--z-sticky);
		backdrop-filter: blur(8px);
		transition: background-color var(--transition-normal), border-color var(--transition-normal);
	}

	@supports not (backdrop-filter: blur(8px)) {
		.dashboard-header {
			background: var(--bg-elevated);
		}
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
		transition: transform var(--transition-normal), box-shadow var(--transition-normal);
	}

	.stat-card:focus-within {
		outline: 3px solid var(--accent-copper);
		outline-offset: 2px;
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

	.unit-label {
		font-size: 1rem;
		color: var(--text-muted);
		font-weight: normal;
	}

	.stat-subtitle {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	/* Reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.stat-card,
		.stat-card:hover,
		*,
		*::before,
		*::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}

		.skip-link {
			transition: none;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
			gap: var(--space-3);
		}

		.header-controls {
			justify-content: center;
			flex-wrap: wrap;
		}

		.stats-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: var(--space-3);
		}

		.stat-value {
			font-size: 2rem;
		}

		.dashboard-header {
			padding: var(--space-4) 0;
		}

		h1 {
			font-size: var(--text-4xl);
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.stat-value {
			font-size: 1.75rem;
		}

		h1 {
			font-size: var(--text-3xl);
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.stat-card {
			border: 2px solid var(--border-strong);
		}

		.skip-link:focus {
			outline-width: 4px;
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

	/* Error banner */
	.error-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		background: var(--status-overdue);
		color: var(--text-primary);
		padding: var(--space-4);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--space-6);
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
