<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		value: number;
		duration?: number;
		/** Duration for value change animations (default: 400ms, faster than initial) */
		changeDuration?: number;
		format?: (value: number) => string;
		class?: string;
	}

	let {
		value,
		duration = 1500,
		changeDuration = 400,
		format = (v: number) => Math.round(v).toLocaleString(),
		class: className = ''
	}: Props = $props();

	let displayValue = $state('0');
	let hasAnimated = $state(false);
	let containerRef: HTMLSpanElement | undefined = $state();
	let animationFrame: number | null = null;
	let observer: IntersectionObserver | null = null;
	let currentNumericValue = $state(0);

	// Easing function (easeOutQuart - starts fast, slows down)
	const easeOutQuart = (t: number): number => {
		return 1 - Math.pow(1 - t, 4);
	};

	// Check for reduced motion preference
	const prefersReducedMotion = (): boolean => {
		if (typeof window === 'undefined') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	};

	const animateToValue = (targetValue: number, animDuration: number, fromValue: number = 0) => {
		// Cancel any ongoing animation
		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame);
		}

		// Skip animation if user prefers reduced motion
		if (prefersReducedMotion()) {
			displayValue = format(targetValue);
			currentNumericValue = targetValue;
			return;
		}

		const startTime = performance.now();
		const startValue = fromValue;

		const tick = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / animDuration, 1);
			const easedProgress = easeOutQuart(progress);
			const currentValue = startValue + (targetValue - startValue) * easedProgress;

			displayValue = format(currentValue);
			currentNumericValue = currentValue;

			if (progress < 1) {
				animationFrame = requestAnimationFrame(tick);
			} else {
				currentNumericValue = targetValue;
			}
		};

		animationFrame = requestAnimationFrame(tick);
	};

	const animate = () => {
		animateToValue(value, duration, 0);
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

	// Animate when value changes after initial animation (e.g., unit toggle)
	$effect(() => {
		if (hasAnimated && value !== currentNumericValue) {
			animateToValue(value, changeDuration, currentNumericValue);
		}
	});
</script>

<span bind:this={containerRef} class={className}>{displayValue}</span>
