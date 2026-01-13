<script lang="ts">
	import { clsx } from 'clsx';

	interface Props {
		class?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		text?: string;
	}

	let { class: className = '', size = 'md', text = '' }: Props = $props();

	const sizeClasses = {
		sm: 'h-4 w-4 border-2',
		md: 'h-8 w-8 border-2',
		lg: 'h-12 w-12 border-3',
		xl: 'h-16 w-16 border-4'
	};
</script>

<div class={clsx('flex flex-col items-center justify-center gap-4', className)}>
	<div
		class={clsx(
			'animate-spin rounded-full border-solid border-border-default border-t-accent-copper',
			sizeClasses[size]
		)}
	></div>
	{#if text}
		<p class="text-secondary text-sm">{text}</p>
	{/if}
</div>

<style>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	.border-3 {
		border-width: 3px;
	}
</style>
