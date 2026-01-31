<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		value: number;
		duration?: number;
		format?: (value: number) => string;
		class?: string;
	}

	let {
		value,
		duration = 1500,
		format = (v: number) => Math.round(v).toLocaleString(),
		class: className = ''
	}: Props = $props();

	let displayValue = $state('0');
	let hasAnimated = $state(false);
	let containerRef: HTMLSpanElement | undefined = $state();
	let animationFrame: number | null = null;
	let observer: IntersectionObserver | null = null;

	// Easing function (easeOutQuart - starts fast, slows down)
	const easeOutQuart = (t: number): number => {
		return 1 - Math.pow(1 - t, 4);
	};

	// Check for reduced motion preference
	const prefersReducedMotion = (): boolean => {
		if (typeof window === 'undefined') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	};

	const animate = () => {
		// Skip animation if user prefers reduced motion
		if (prefersReducedMotion()) {
			displayValue = format(value);
			return;
		}

		const startTime = performance.now();
		const startValue = 0;

		const tick = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = easeOutQuart(progress);
			const currentValue = startValue + (value - startValue) * easedProgress;

			displayValue = format(currentValue);

			if (progress < 1) {
				animationFrame = requestAnimationFrame(tick);
			}
		};

		animationFrame = requestAnimationFrame(tick);
	};

	onMount(() => {
		if (!containerRef) return;

		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !hasAnimated) {
						hasAnimated = true;
						animate();
						observer?.disconnect();
					}
				});
			},
			{ threshold: 0.3 }
		);

		observer.observe(containerRef);
	});

	onDestroy(() => {
		observer?.disconnect();
		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame);
		}
	});

	// If value changes after animation, update immediately
	$effect(() => {
		if (hasAnimated) {
			displayValue = format(value);
		}
	});
</script>

<span bind:this={containerRef} class={className}>{displayValue}</span>
