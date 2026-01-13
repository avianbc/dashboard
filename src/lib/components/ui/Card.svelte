<script lang="ts">
	import { clsx } from 'clsx';

	interface Props {
		class?: string;
		padding?: 'sm' | 'md' | 'lg';
		shadow?: 'sm' | 'md' | 'lg' | 'none';
		hover?: boolean;
		children?: any;
	}

	let { class: className = '', padding = 'md', shadow = 'md', hover = false, children }: Props = $props();

	const paddingClasses = {
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};

	const shadowClasses = {
		sm: 'shadow-sm',
		md: 'shadow-md',
		lg: 'shadow-lg',
		none: ''
	};
</script>

<div
	class={clsx(
		'bg-card rounded-lg transition-all',
		paddingClasses[padding],
		shadowClasses[shadow],
		hover && 'hover:shadow-lg hover:translate-y-[-2px] cursor-pointer',
		className
	)}
>
	{@render children?.()}
</div>

<style>
	div {
		transition: transform var(--transition-normal), box-shadow var(--transition-normal);
	}
</style>
