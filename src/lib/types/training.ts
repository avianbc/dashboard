// Training data type definitions

export interface Summary {
	totalWorkouts: number;
	totalSets: number;
	totalVolumeLbs: number;
	totalVolumeKg: number;
	totalHours: number;
	totalReps: number;
	totalTons: number;
	bestMonthEver: {
		month: string;
		volumeLbs: number;
		volumeKg: number;
	};
	bestYearEver: {
		year: number;
		volumeLbs: number;
		volumeKg: number;
		workouts: number;
	};
	firstWorkout: string;
	lastWorkout: string;
	avgWorkoutDuration: number;
	avgVolumePerWorkoutLbs: number;
	avgVolumePerWorkoutKg: number;
	avgSetsPerWorkout: number;
	workoutsPerWeekAvg: number;
}

export interface TimeSeriesPoint {
	date: string;
	volumeLbs: number;
	volumeKg: number;
	workouts: number;
}

export interface WeeklyTimeSeriesPoint {
	week: string;
	volumeLbs: number;
	volumeKg: number;
	workouts: number;
}

export interface MonthlyTimeSeriesPoint {
	month: string;
	volumeLbs: number;
	volumeKg: number;
	workouts: number;
}

export interface YearlyTimeSeriesPoint {
	year: number;
	volumeLbs: number;
	volumeKg: number;
	workouts: number;
}

export interface VolumeTimeSeries {
	daily: TimeSeriesPoint[];
	weekly: WeeklyTimeSeriesPoint[];
	monthly: MonthlyTimeSeriesPoint[];
	yearly: YearlyTimeSeriesPoint[];
}

export interface WorkoutCalendarDay {
	date: string;
	count: number;
	volumeLbs: number;
	volumeKg: number;
}

export interface PRRecord {
	date: string;
	weightLbs: number;
	weightKg: number;
	reps: number;
	e1rmLbs?: number;
	e1rmKg?: number;
}

export interface ExerciseProgress {
	exerciseName: string;
	totalVolumeLbs: number;
	totalVolumeKg: number;
	firstPerformed: string;
	lastPerformed: string;
	prs: PRRecord[];
}

export interface E1RMPoint {
	date: string;
	e1rmLbs: number;
	e1rmKg: number;
	actualWeightLbs: number;
	actualWeightKg: number;
	reps: number;
}

export interface BigThreeE1RM {
	squat: E1RMPoint[];
	bench: E1RMPoint[];
	deadlift: E1RMPoint[];
	ohp: E1RMPoint[];
}

export interface BigThreeVolume {
	squat: TimeSeriesPoint[];
	bench: TimeSeriesPoint[];
	deadlift: TimeSeriesPoint[];
	ohp: TimeSeriesPoint[];
}

export interface Program {
	name: string;
	startDate: string;
	endDate: string;
	totalWorkouts: number;
	totalVolumeLbs: number;
	totalVolumeKg: number;
	prsSet: number;
}

export interface DayOfWeekStats {
	day: string;
	count: number;
	avgVolumeLbs: number;
	avgVolumeKg: number;
}

export interface NotableWorkout {
	date: string;
	reason: string;
	category: string;
	volumeLbs: number;
	volumeKg: number;
}

export interface Milestone {
	date: string;
	milestone: string;
	volumeLbs?: number;
	volumeKg?: number;
}

export interface PlateMilestone {
	weightLbs: number;
	weightKg: number;
	date: string;
}

export interface PlateMilestones {
	squat: PlateMilestone[];
	bench: PlateMilestone[];
	deadlift: PlateMilestone[];
	ohp: PlateMilestone[];
}

export interface PowerliftingTotal {
	totalLbs: number;
	totalKg: number;
	squatE1rmLbs: number;
	squatE1rmKg: number;
	benchE1rmLbs: number;
	benchE1rmKg: number;
	deadliftE1rmLbs: number;
	deadliftE1rmKg: number;
	date: string;
}

export interface PowerliftingTotals {
	current: PowerliftingTotal;
	peak: PowerliftingTotal;
	clubs: {
		name: string;
		totalLbs: number;
		dateAchieved: string;
	}[];
}

export interface RepPR {
	reps: number;
	weightLbs: number;
	weightKg: number;
	date: string;
}

export interface AllTimePRs {
	squat: {
		repPRs: RepPR[];
		maxEver: RepPR;
		bestE1rm: E1RMPoint;
	};
	bench: {
		repPRs: RepPR[];
		maxEver: RepPR;
		bestE1rm: E1RMPoint;
	};
	deadlift: {
		repPRs: RepPR[];
		maxEver: RepPR;
		bestE1rm: E1RMPoint;
	};
	ohp: {
		repPRs: RepPR[];
		maxEver: RepPR;
		bestE1rm: E1RMPoint;
	};
}

export interface DaysSinceLastPR {
	squat: number;
	bench: number;
	deadlift: number;
	ohp: number;
}

export interface BarTravel {
	totalMiles: number;
	totalKm: number;
	byLift: {
		squat: { miles: number; km: number };
		bench: { miles: number; km: number };
		deadlift: { miles: number; km: number };
		ohp: { miles: number; km: number };
	};
	landmarks: {
		everest: number;
		empireState: number;
		eiffelTower: number;
		statueOfLiberty: number;
	};
}

export interface BodyWeight {
	current: number;
	starting: number;
	monthlyTimeline: {
		month: string;
		weight: number;
	}[];
	stalePeriods: {
		startDate: string;
		endDate: string;
		days: number;
	}[];
}

export interface RelativeStrength {
	squat: {
		best: number;
		current: number;
		monthlyProgression: {
			month: string;
			multiple: number;
		}[];
	};
	bench: {
		best: number;
		current: number;
		monthlyProgression: {
			month: string;
			multiple: number;
		}[];
	};
	deadlift: {
		best: number;
		current: number;
		monthlyProgression: {
			month: string;
			multiple: number;
		}[];
	};
	ohp: {
		best: number;
		current: number;
		monthlyProgression: {
			month: string;
			multiple: number;
		}[];
	};
}

export interface TrainingData {
	summary: Summary;
	volumeTimeSeries: VolumeTimeSeries;
	workoutCalendar: WorkoutCalendarDay[];
	exerciseProgress: ExerciseProgress[];
	bigThreeE1RM: BigThreeE1RM;
	bigThreeVolume: BigThreeVolume;
	programs: Program[];
	workoutsByDayOfWeek: DayOfWeekStats[];
	notableWorkouts: NotableWorkout[];
	milestones: Milestone[];
	plateMilestones: PlateMilestones;
	powerliftingTotals: PowerliftingTotals;
	allTimePRs: AllTimePRs;
	daysSinceLastPR: DaysSinceLastPR;
	barTravel: BarTravel;
	bodyWeight: BodyWeight;
	relativeStrength: RelativeStrength;
}

// Unit system types
export type UnitSystem = 'imperial' | 'metric';

export interface UnitPreferences {
	weight: UnitSystem;
	distance: UnitSystem;
}
