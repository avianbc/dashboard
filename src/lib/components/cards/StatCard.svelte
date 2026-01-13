<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { Card } from '$lib/components/ui';

	interface Props {
		title: string;
		value: string | number;
		subtitle?: string;
		icon: ComponentType;
		hover?: boolean;
	}

	let { title, value, subtitle = '', icon: Icon, hover = true }: Props = $props();
</script>

<Card {hover} class="stat-card">
	<div class="stat-icon">
		<Icon size={24} />
	</div>
	<div class="stat-content">
		<div class="stat-label">{title}</div>
		<div class="stat-value">{value}</div>
		{#if subtitle}
			<div class="stat-subtitle">{subtitle}</div>
		{/if}
	</div>
</Card>

<style>
	:global(.stat-card) {
		padding: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		position: relative;
		overflow: hidden;
	}

	:global(.stat-card)::before {
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

	:global(.stat-card:hover)::before {
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

	@media (max-width: 768px) {
		.stat-value {
			font-size: 2rem;
		}
	}
</style>
