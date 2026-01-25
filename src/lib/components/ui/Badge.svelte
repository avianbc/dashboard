<script lang="ts">
	interface Props {
		variant?: 'status' | 'accent' | 'muted' | 'numbered';
		color?: string; // For status badges with dynamic colors
		size?: 'sm' | 'md';
		class?: string;
	}

	let {
		variant = 'accent',
		color,
		size = 'md',
		class: className = ''
	}: Props = $props();
</script>

<span
	class="badge badge-{variant} badge-{size} {className}"
	style:background={variant === 'status' && color ? color : undefined}
>
	<slot />
</span>

<style>
	.badge {
		display: inline-block;
		font-weight: 600;
	}

	/* Status variant - pill shape with dynamic color */
	.badge-status {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		font-family: 'Source Sans 3', sans-serif;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Accent variant - gold background */
	.badge-accent {
		padding: var(--space-1) var(--space-3);
		background: var(--accent-gold);
		color: var(--bg-deep);
		border-radius: var(--radius-md);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Muted variant - for PR counts */
	.badge-muted {
		padding: var(--space-1) var(--space-2);
		background: var(--status-pr);
		color: var(--bg-deep);
		border-radius: var(--radius-sm);
		font-family: 'JetBrains Mono', monospace;
		font-weight: bold;
	}

	/* Numbered variant - circular for rank numbers */
	.badge-numbered {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background: var(--accent-gold);
		color: var(--bg-deep);
		border-radius: 50%;
		font-family: 'JetBrains Mono', monospace;
		font-weight: bold;
	}

	/* Size variants */
	.badge-sm {
		font-size: 0.625rem;
	}

	.badge-md {
		font-size: 0.75rem;
	}

	/* Numbered variant size adjustments */
	.badge-numbered.badge-sm {
		width: 20px;
		height: 20px;
		font-size: 0.625rem;
	}

	.badge-numbered.badge-md {
		width: 24px;
		height: 24px;
		font-size: 0.75rem;
	}
</style>
