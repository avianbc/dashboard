<script lang="ts">
	import { clsx } from 'clsx';
	import { Inbox } from 'lucide-svelte';

	interface Props {
		class?: string;
		title?: string;
		message?: string;
		icon?: any;
		action?: {
			label: string;
			onclick: () => void;
		};
	}

	let {
		class: className = '',
		title = 'No Data',
		message = 'There is no data to display.',
		icon = Inbox,
		action
	}: Props = $props();
</script>

<div class={clsx('flex flex-col items-center justify-center gap-4 p-8 text-center', className)}>
	<div class="text-text-muted">
		<svelte:component this={icon} size={48} strokeWidth={1.5} />
	</div>

	<div class="space-y-2">
		<h3 class="text-xl text-secondary">{title}</h3>
		<p class="text-muted text-sm max-w-sm">{message}</p>
	</div>

	{#if action}
		<button
			onclick={action.onclick}
			class="mt-2 px-4 py-2 bg-accent-copper text-inverse rounded-md hover:bg-accent-copper-hover transition-colors"
		>
			{action.label}
		</button>
	{/if}
</div>

<style>
	.space-y-2 > * + * {
		margin-top: var(--space-2);
	}

	button {
		transition: background-color var(--transition-fast);
		cursor: pointer;
	}
</style>
