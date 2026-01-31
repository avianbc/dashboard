/**
 * Svelte action for animated count-up effect on number values.
 * Uses Intersection Observer to trigger animation when element comes into view.
 *
 * @example
 * <span use:countUp={{ value: 1000, duration: 1500 }}>0</span>
 */

interface CountUpOptions {
	/** The target value to count up to */
	value: number;
	/** Animation duration in milliseconds (default: 1500) */
	duration?: number;
	/** Easing function (default: easeOutQuart) */
	easing?: (t: number) => number;
	/** Format function for the displayed value (default: Math.round) */
	format?: (value: number) => string;
	/** Whether to only animate once (default: true) */
	once?: boolean;
	/** Intersection Observer threshold (default: 0.3) */
	threshold?: number;
}

// Default easing function (easeOutQuart - starts fast, slows down)
const easeOutQuart = (t: number): number => {
	return 1 - Math.pow(1 - t, 4);
};

// Check for reduced motion preference
const prefersReducedMotion = (): boolean => {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function countUp(node: HTMLElement, options: CountUpOptions) {
	const {
		value,
		duration = 1500,
		easing = easeOutQuart,
		format = (v) => Math.round(v).toLocaleString(),
		once = true,
		threshold = 0.3
	} = options;

	let hasAnimated = false;
	let animationFrame: number | null = null;

	const animate = () => {
		// Skip animation if user prefers reduced motion
		if (prefersReducedMotion()) {
			node.textContent = format(value);
			return;
		}

		const startTime = performance.now();
		const startValue = 0;

		const tick = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = easing(progress);
			const currentValue = startValue + (value - startValue) * easedProgress;

			node.textContent = format(currentValue);

			if (progress < 1) {
				animationFrame = requestAnimationFrame(tick);
			}
		};

		animationFrame = requestAnimationFrame(tick);
	};

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && (!once || !hasAnimated)) {
					hasAnimated = true;
					animate();

					if (once) {
						observer.disconnect();
					}
				}
			});
		},
		{ threshold }
	);

	observer.observe(node);

	return {
		update(newOptions: CountUpOptions) {
			// Update the target value if it changes
			if (newOptions.value !== value) {
				node.textContent = format(newOptions.value);
			}
		},
		destroy() {
			observer.disconnect();
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
		}
	};
}
