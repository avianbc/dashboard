<script lang="ts">
	import { clsx } from 'clsx';
	import { AlertCircle } from 'lucide-svelte';
	import Button from './Button.svelte';

	interface Props {
		class?: string;
		title?: string;
		message: string;
		retry?: () => void;
	}

	let { class: className = '', title = 'Error', message, retry }: Props = $props();
</script>

<div class={clsx('flex flex-col items-center justify-center gap-4 p-8', className)}>
	<div class="flex items-center gap-3 text-status-overdue">
		<AlertCircle size={32} />
		<h3 class="text-2xl">{title}</h3>
	</div>

	<p class="text-secondary text-center max-w-md">{message}</p>

	{#if retry}
		<Button variant="primary" onclick={retry} class="mt-4">
			Try Again
		</Button>
	{/if}
</div>

