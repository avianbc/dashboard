<script lang="ts">
	import type { Snippet } from 'svelte';
	import { clsx } from 'clsx';

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

	const variantClasses = {
		primary: 'bg-accent-copper text-inverse hover:bg-accent-copper-hover',
		secondary: 'bg-elevated text-primary hover:bg-hover border border-border-default',
		ghost: 'bg-transparent text-primary hover:bg-interactive-hover',
		outline: 'bg-transparent text-primary border border-border-default hover:bg-interactive-hover'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};
</script>

<button
	{type}
	{disabled}
	{title}
	aria-label={ariaLabel}
	onclick={onclick}
	class={clsx(
		'rounded-md font-medium transition-all inline-flex items-center justify-center gap-2',
		'focus:outline-none focus:ring-2 focus:ring-accent-copper focus:ring-offset-2',
		'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
		variantClasses[variant],
		sizeClasses[size],
		className
	)}
>
	{@render children?.()}
</button>

<style>
	button {
		cursor: pointer;
		transition: all var(--transition-fast);
	}
</style>
