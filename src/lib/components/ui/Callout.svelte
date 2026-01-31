<script lang="ts">
	import type { ComponentType } from 'svelte';

	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'info' | 'success' | 'warning' | 'error';
		icon?: ComponentType;
		borderAccent?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		variant = 'info',
		icon,
		borderAccent = false,
		class: className = '',
		children
	}: Props = $props();
</script>

<div class="callout callout-{variant} {className}" class:border-accent={borderAccent}>
	{#if icon}
		{@const Icon = icon}
		<Icon class="callout-icon" />
	{/if}
	<div class="callout-content">
		{@render children?.()}
	</div>
</div>

<style>
	.callout {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--text-secondary);
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
		border: 1px solid var(--border-subtle);
	}

	/* Success variant - green tint */
	.callout-success {
		background: var(--callout-success-bg, rgba(74, 140, 92, 0.15));
		color: var(--callout-success-text, var(--text-primary));
		border: 1px solid var(--callout-success-border, rgba(74, 140, 92, 0.3));
	}

	/* Warning variant - amber tint */
	.callout-warning {
		background: var(--callout-warning-bg, rgba(201, 162, 39, 0.15));
		color: var(--callout-warning-text, var(--text-primary));
		border: 1px solid var(--callout-warning-border, rgba(201, 162, 39, 0.3));
	}

	/* Error variant - red background */
	.callout-error {
		background: var(--callout-error-bg, rgba(196, 69, 54, 0.15));
		color: var(--text-primary);
		border: 1px solid var(--callout-error-border, rgba(196, 69, 54, 0.3));
	}

	/* Icon styling */
	.callout :global(.callout-icon) {
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		margin-top: 2px;
	}

	.callout-error :global(.callout-icon) {
		color: var(--text-primary);
	}
</style>
