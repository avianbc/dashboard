<script lang="ts">
	import type { Snippet } from 'svelte';
	import { lazyLoad } from '$lib/utils';
	import Loading from './Loading.svelte';

	let { children, minHeight = '400px' } = $props<{
		children: Snippet;
		minHeight?: string;
	}>();

	let isLoaded = $state(false);

	function handleLazyLoad() {
		isLoaded = true;
	}
</script>

<div
	class="lazy-chart-container"
	style="min-height: {minHeight}"
	use:lazyLoad={handleLazyLoad}
	role="region"
	aria-busy={!isLoaded}
>
	{#if isLoaded}
		{@render children()}
	{:else}
		<div class="lazy-chart-placeholder">
			<Loading />
		</div>
	{/if}
</div>

<style>
	.lazy-chart-container {
		position: relative;
		width: 100%;
	}

	.lazy-chart-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		min-height: inherit;
	}
</style>
