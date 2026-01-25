/**
 * Shared lift configuration
 * Consolidates lift colors, names, and milestones used across components
 */

export const LIFT_COLORS = {
	squat: '#c44536',
	bench: '#4a7c9b',
	deadlift: '#4a8c5c',
	ohp: '#c9a227'
} as const;

export const LIFTS = [
	{ key: 'squat' as const, name: 'Squat', color: LIFT_COLORS.squat },
	{ key: 'bench' as const, name: 'Bench Press', color: LIFT_COLORS.bench },
	{ key: 'deadlift' as const, name: 'Deadlift', color: LIFT_COLORS.deadlift },
	{ key: 'ohp' as const, name: 'Overhead Press', color: LIFT_COLORS.ohp }
] as const;

export const PLATE_MILESTONES = [135, 225, 315, 405, 495, 585] as const;
