<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		'aria-label'?: string;
		title?: string;
	}

	let {
		class: className = '',
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		onclick,
		children,
		'aria-label': ariaLabel,
		title
	}: Props = $props();
</script>

<button
	{type}
	{disabled}
	{title}
	aria-label={ariaLabel}
	{onclick}
	class="btn btn-{variant} btn-{size} {className}"
>
	{@render children?.()}
</button>

<style>
	.btn {
		/* Reset browser defaults */
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		border-style: solid;
		cursor: pointer;

		/* Base styles */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		border-radius: var(--radius-lg);
		font-family: var(--font-body);
		font-weight: var(--font-weight-semibold);
		transition: all var(--transition-normal);
		user-select: none;

		/* Focus styles */
		&:focus {
			outline: none;
			box-shadow:
				0 0 0 3px var(--accent-copper),
				0 0 0 5px rgba(193, 127, 89, 0.3);
		}

		/* Disabled styles */
		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
			pointer-events: none;
		}

		/* Active state */
		&:active:not(:disabled) {
			transform: scale(0.98);
		}
	}

	/* Variant styles */
	.btn-primary {
		background-color: var(--accent-copper);
		color: var(--text-inverse);
		border: 2px solid var(--accent-copper);
		box-shadow: var(--shadow-sm);

		&:hover:not(:disabled) {
			background-color: var(--accent-copper-hover);
			border-color: var(--accent-copper-hover);
			box-shadow: var(--shadow-md);
		}
	}

	.btn-secondary {
		background-color: var(--bg-elevated);
		color: var(--text-primary);
		border: 2px solid var(--border-default);
		box-shadow: var(--shadow-sm);

		&:hover:not(:disabled) {
			background-color: var(--bg-hover);
			border-color: var(--border-hover);
		}
	}

	.btn-ghost {
		background-color: transparent;
		color: var(--text-primary);
		border: 2px solid transparent;

		&:hover:not(:disabled) {
			background-color: var(--interactive-hover);
		}
	}

	.btn-outline {
		background-color: var(--bg-card);
		color: var(--text-primary);
		border: 2px solid var(--border-default);
		box-shadow: var(--shadow-sm);

		&:hover:not(:disabled) {
			border-color: var(--accent-copper);
			background-color: var(--interactive-hover);
		}
	}

	/* Size styles */
	.btn-sm {
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
	}

	.btn-md {
		padding: var(--space-3) var(--space-5);
		font-size: var(--text-base);
	}

	.btn-lg {
		padding: var(--space-4) var(--space-6);
		font-size: var(--text-lg);
	}
</style>
