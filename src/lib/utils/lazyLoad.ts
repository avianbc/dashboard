/**
 * Svelte action for lazy loading components when they enter the viewport
 * Uses IntersectionObserver to trigger loading when element is near viewport
 */
export function lazyLoad(node: HTMLElement, callback?: () => void) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					// Element is now visible
					node.dispatchEvent(new CustomEvent('lazyload'));
					if (callback) callback();
					// Disconnect after first trigger to avoid repeated calls
					observer.disconnect();
				}
			});
		},
		{
			// Start loading when element is 200px from viewport
			rootMargin: '200px',
			threshold: 0.01
		}
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}

/**
 * Debounce function to limit expensive operations
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			func(...args);
		};

		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
