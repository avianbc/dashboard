<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Option<T> {
		value: T;
		label: string;
	}

	interface Props<T> {
		options: Option<T>[];
		value: T;
		onchange: (value: T) => void;
		size?: 'sm' | 'md';
		class?: string;
		'aria-label'?: string;
	}

	let {
		options,
		value,
		onchange,
		size = 'md',
		class: className = '',
		'aria-label': ariaLabel = 'Select option'
	}: Props<string> = $props();
</script>

<div class="segmented-control size-{size} {className}" role="group" aria-label={ariaLabel}>
	{#each options as option (option.value)}
		<button
			type="button"
			class="segment"
			class:active={value === option.value}
			onclick={() => onchange(option.value)}
			aria-pressed={value === option.value}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.segmented-control {
		display: inline-flex;
		gap: 2px;
		background: var(--bg-secondary);
		padding: 3px;
		border-radius: var(--radius-md);
	}

	.segment {
		padding: 6px 12px;
		font-family: 'Source Sans 3', sans-serif;
		font-weight: 500;
		color: var(--text-secondary);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.segment:hover:not(.active) {
		color: var(--text-primary);
		background: var(--bg-tertiary);
	}

	.segment.active {
		color: var(--text-primary);
		background: var(--bg-primary);
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.12),
			0 1px 2px rgba(0, 0, 0, 0.08);
	}

	/* Size variants */
	.size-sm .segment {
		padding: 4px 10px;
		font-size: 0.75rem;
	}

	.size-md .segment {
		padding: 6px 14px;
		font-size: 0.8125rem;
	}

	/* Responsive */
	@media (max-width: 480px) {
		.segmented-control {
			width: 100%;
		}

		.segment {
			flex: 1;
			text-align: center;
		}
	}
</style>
