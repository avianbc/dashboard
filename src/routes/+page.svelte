<script lang="ts">
	import { Card, Button, Loading, Error, Empty } from '$lib/components/ui';
	import { unitSystem, theme } from '$lib/stores';
	import {
		formatNumber,
		formatCompactNumber,
		formatWeight,
		formatDistance,
		formatDate,
		formatDuration,
		formatPercentage,
		formatRatio,
		lbsToKg,
		kgToLbs,
		milesToKm,
		getPRStatusColor,
		getPRStatusEmoji
	} from '$lib/utils';
	import { Activity, Dumbbell, TrendingUp, Award } from 'lucide-svelte';

	let currentTheme = $state('dark');
	let currentUnit = $state('imperial');
	let showLoading = $state(false);
	let showError = $state(false);
	let showEmpty = $state(false);

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

	// Test data
	const testWeight = 315;
	const testDistance = 29.35;
	const testDate = '2019-01-23';
	const testNumber = 6833549;
	const testDuration = 734.1 * 60; // hours to minutes
	const testPercentage = 87.5;
	const testRatio = 2.22;

	// PR status test data
	const prDays = [45, 120, 210];
</script>

<div class="container py-8">
	<!-- Header -->
	<header class="mb-12 text-center">
		<h1 class="mb-4">Phase 2: Core Infrastructure</h1>
		<h2 class="text-secondary mb-6">Verification Dashboard</h2>
		<p class="text-muted max-w-2xl mx-auto">
			Testing all Phase 2 components: TypeScript types, utilities, stores, CSS architecture, and UI
			components.
		</p>
	</header>

	<!-- Controls Section -->
	<section class="mb-12">
		<Card padding="lg" class="max-w-4xl mx-auto">
			<h3 class="mb-6">Controls & Stores</h3>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Theme Toggle -->
				<div>
					<h4 class="text-xl mb-4">Theme System</h4>
					<p class="text-secondary text-sm mb-4">Current: {currentTheme}</p>
					<div class="flex gap-2">
						<Button variant="primary" onclick={() => theme.toggle()}>Toggle Theme</Button>
						<Button variant="outline" onclick={() => theme.setDark()}>Dark</Button>
						<Button variant="outline" onclick={() => theme.setLight()}>Light</Button>
					</div>
				</div>

				<!-- Unit Toggle -->
				<div>
					<h4 class="text-xl mb-4">Unit System</h4>
					<p class="text-secondary text-sm mb-4">Current: {currentUnit}</p>
					<div class="flex gap-2">
						<Button variant="primary" onclick={() => unitSystem.toggle()}>Toggle Units</Button>
						<Button variant="outline" onclick={() => unitSystem.setImperial()}>Imperial</Button>
						<Button variant="outline" onclick={() => unitSystem.setMetric()}>Metric</Button>
					</div>
				</div>
			</div>
		</Card>
	</section>

	<!-- Formatting Utilities -->
	<section class="mb-12">
		<h3 class="mb-6">Formatting Utilities</h3>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card hover>
				<div class="flex items-start gap-3">
					<div class="text-accent-copper">
						<Dumbbell size={24} />
					</div>
					<div>
						<div class="text-sm text-muted mb-1">Weight</div>
						<div class="text-2xl font-mono">
							{formatWeight(testWeight, currentUnit === 'metric')}
						</div>
						<div class="text-xs text-muted mt-1">
							{currentUnit === 'imperial' ? testWeight : lbsToKg(testWeight).toFixed(1)} raw
						</div>
					</div>
				</div>
			</Card>

			<Card hover>
				<div class="flex items-start gap-3">
					<div class="text-accent-copper">
						<Activity size={24} />
					</div>
					<div>
						<div class="text-sm text-muted mb-1">Distance</div>
						<div class="text-2xl font-mono">
							{formatDistance(testDistance, currentUnit === 'metric')}
						</div>
						<div class="text-xs text-muted mt-1">
							{currentUnit === 'imperial' ? testDistance : milesToKm(testDistance).toFixed(2)} raw
						</div>
					</div>
				</div>
			</Card>

			<Card hover>
				<div class="flex items-start gap-3">
					<div class="text-accent-copper">
						<TrendingUp size={24} />
					</div>
					<div>
						<div class="text-sm text-muted mb-1">Large Number</div>
						<div class="text-2xl font-mono">{formatCompactNumber(testNumber)}</div>
						<div class="text-xs text-muted mt-1">{formatNumber(testNumber)}</div>
					</div>
				</div>
			</Card>

			<Card hover>
				<div class="flex items-start gap-3">
					<div class="text-accent-copper">
						<Award size={24} />
					</div>
					<div>
						<div class="text-sm text-muted mb-1">Date</div>
						<div class="text-lg font-mono">{formatDate(testDate)}</div>
						<div class="text-xs text-muted mt-1">{testDate}</div>
					</div>
				</div>
			</Card>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
			<Card>
				<div class="text-sm text-muted mb-1">Duration</div>
				<div class="text-xl font-mono">{formatDuration(testDuration)}</div>
				<div class="text-xs text-muted mt-1">{testDuration.toFixed(0)} minutes</div>
			</Card>

			<Card>
				<div class="text-sm text-muted mb-1">Percentage</div>
				<div class="text-xl font-mono">{formatPercentage(testPercentage)}</div>
				<div class="text-xs text-muted mt-1">{testPercentage} raw</div>
			</Card>

			<Card>
				<div class="text-sm text-muted mb-1">Ratio (Strength Multiple)</div>
				<div class="text-xl font-mono">{formatRatio(testRatio)}</div>
				<div class="text-xs text-muted mt-1">{testRatio} BW</div>
			</Card>
		</div>
	</section>

	<!-- PR Status Colors -->
	<section class="mb-12">
		<h3 class="mb-6">PR Status Utilities</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each prDays as days}
				{@const status = getPRStatusColor(days)}
				{@const emoji = getPRStatusEmoji(days)}
				<Card>
					<div class="flex items-center gap-3">
						<div class="text-2xl">{emoji}</div>
						<div class="flex-1">
							<div class="text-sm text-muted">Days Since PR</div>
							<div class="text-xl font-mono">{days} days</div>
							<div class="text-xs" style="color: var(--status-{status})">Status: {status}</div>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	</section>

	<!-- Lift Colors -->
	<section class="mb-12">
		<h3 class="mb-6">Lift Color Palette</h3>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<Card>
				<div class="h-16 rounded mb-2" style="background-color: var(--lift-squat)"></div>
				<div class="text-sm font-mono">Squat</div>
				<div class="text-xs text-muted">#c44536</div>
			</Card>
			<Card>
				<div class="h-16 rounded mb-2" style="background-color: var(--lift-bench)"></div>
				<div class="text-sm font-mono">Bench</div>
				<div class="text-xs text-muted">#4a7c9b</div>
			</Card>
			<Card>
				<div class="h-16 rounded mb-2" style="background-color: var(--lift-deadlift)"></div>
				<div class="text-sm font-mono">Deadlift</div>
				<div class="text-xs text-muted">#4a8c5c</div>
			</Card>
			<Card>
				<div class="h-16 rounded mb-2" style="background-color: var(--lift-ohp)"></div>
				<div class="text-sm font-mono">OHP</div>
				<div class="text-xs text-muted">#c9a227</div>
			</Card>
		</div>
	</section>

	<!-- UI Components -->
	<section class="mb-12">
		<h3 class="mb-6">UI Components</h3>

		<!-- Buttons -->
		<Card class="mb-6">
			<h4 class="text-xl mb-4">Buttons</h4>
			<div class="flex flex-wrap gap-4">
				<Button variant="primary">Primary Button</Button>
				<Button variant="secondary">Secondary Button</Button>
				<Button variant="outline">Outline Button</Button>
				<Button variant="ghost">Ghost Button</Button>
				<Button variant="primary" disabled>Disabled Button</Button>
			</div>
			<div class="flex flex-wrap gap-4 mt-4">
				<Button variant="primary" size="sm">Small</Button>
				<Button variant="primary" size="md">Medium</Button>
				<Button variant="primary" size="lg">Large</Button>
			</div>
		</Card>

		<!-- State Components -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<Card>
				<h4 class="text-xl mb-4">Loading</h4>
				<Button variant="outline" onclick={() => (showLoading = !showLoading)}>
					Toggle Loading
				</Button>
				{#if showLoading}
					<div class="mt-4">
						<Loading text="Loading data..." />
					</div>
				{/if}
			</Card>

			<Card>
				<h4 class="text-xl mb-4">Error</h4>
				<Button variant="outline" onclick={() => (showError = !showError)}>Toggle Error</Button>
				{#if showError}
					<div class="mt-4">
						<Error
							title="Failed to Load"
							message="Unable to fetch training data."
							retry={() => (showError = false)}
						/>
					</div>
				{/if}
			</Card>

			<Card>
				<h4 class="text-xl mb-4">Empty</h4>
				<Button variant="outline" onclick={() => (showEmpty = !showEmpty)}>Toggle Empty</Button>
				{#if showEmpty}
					<div class="mt-4">
						<Empty
							title="No Workouts"
							message="Start training to see your data."
							action={{ label: 'Get Started', onclick: () => (showEmpty = false) }}
						/>
					</div>
				{/if}
			</Card>
		</div>
	</section>

	<!-- Typography -->
	<section class="mb-12">
		<Card>
			<h3 class="mb-6">Typography Scale</h3>
			<div class="space-y-4">
				<div>
					<h1>Heading 1 - Display Font</h1>
					<p class="text-muted text-sm">Bebas Neue, 5rem, uppercase</p>
				</div>
				<div>
					<h2>Heading 2 - Display Font</h2>
					<p class="text-muted text-sm">Bebas Neue, 3.5rem, uppercase</p>
				</div>
				<div>
					<h3>Heading 3 - Display Font</h3>
					<p class="text-muted text-sm">Bebas Neue, 2.5rem, uppercase</p>
				</div>
				<div>
					<p class="text-xl">Body Large - Source Sans 3, 1.25rem</p>
				</div>
				<div>
					<p>Body Regular - Source Sans 3, 1rem</p>
				</div>
				<div>
					<p class="text-sm">Body Small - Source Sans 3, 0.875rem</p>
				</div>
				<div>
					<code class="font-mono">Monospace - JetBrains Mono</code>
				</div>
			</div>
		</Card>
	</section>

	<!-- Status Message -->
	<section class="mb-12">
		<Card padding="lg" class="text-center bg-elevated">
			<div class="text-4xl mb-4">✅</div>
			<h3 class="mb-2">Phase 2 Complete</h3>
			<p class="text-secondary">
				All core infrastructure is in place and verified. Ready for Phase 3: Data Visualization.
			</p>
		</Card>
	</section>
</div>

<style>
	.space-y-4 > * + * {
		margin-top: var(--space-4);
	}
</style>
