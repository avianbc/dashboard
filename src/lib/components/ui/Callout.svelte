<script lang="ts">
	import type { ComponentType } from 'svelte';

	interface Props {
		variant?: 'info' | 'success' | 'warning' | 'error';
		icon?: ComponentType;
		centered?: boolean;
		borderAccent?: boolean;
		class?: string;
	}

	let {
		variant = 'info',
		icon,
		centered = false,
		borderAccent = false,
		class: className = ''
	}: Props = $props();
</script>

<div
	class="callout callout-{variant} {className}"
	class:centered
	class:border-accent={borderAccent}
>
	{#if icon}
		<svelte:component this={icon} class="callout-icon" />
	{/if}
	<div class="callout-content">
		<slot />
	</div>
</div>

<style>
	.callout {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-4);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	.callout.centered {
		text-align: center;
		justify-content: center;
		flex-direction: column;
		gap: var(--space-2);
	}

	.callout.border-accent {
		border-left: 3px solid var(--accent-copper);
	}

	.callout-content {
		flex: 1;
	}

	.callout-content :global(p) {
		margin: 0;
	}

	/* Info variant - neutral, default */
	.callout-info {
		background: var(--bg-elevated);
	}

	/* Success variant - green tint */
	.callout-success {
		background: var(--status-pr);
		color: var(--bg-deep);
	}

	/* Warning variant - amber tint */
	.callout-warning {
		background: var(--status-aging);
		color: var(--bg-deep);
	}

	/* Error variant - red background */
	.callout-error {
		background: var(--status-overdue);
		color: var(--text-primary);
	}

	/* Icon styling */
	.callout :global(.callout-icon) {
		flex-shrink: 0;
	}

	.callout.centered :global(.callout-icon) {
		color: var(--accent-copper);
	}

	.callout-error :global(.callout-icon) {
		color: var(--text-primary);
	}
</style>
