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

export interface LiftE1RMData {
	exerciseName: string;
	e1rmHistory: E1RMPoint[];
}

export interface BigThreeE1RM {
	squat: LiftE1RMData;
	bench: LiftE1RMData;
	deadlift: LiftE1RMData;
	ohp: LiftE1RMData;
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
	workouts: number;
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
	actualWeightLbs: number;
	actualWeightKg: number;
	date: string;
}

/** Plate milestones keyed by plate number (1-5) */
export type PlateMilestoneMap = Record<string, PlateMilestone>;

export interface PlateMilestones {
	squat: PlateMilestoneMap;
	bench: PlateMilestoneMap;
	deadlift: PlateMilestoneMap;
	ohp: PlateMilestoneMap;
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
	weightLbs: number;
	weightKg: number;
	e1rmLbs: number;
	e1rmKg: number;
}

export interface RepPRs {
	[reps: string]: RepPR;
}

export interface MaxEver {
	weightLbs: number;
	weightKg: number;
	date: string;
}

export interface AllTimePRs {
	squat: {
		repPRs: RepPRs;
		maxEver: MaxEver;
		bestE1rm: E1RMPoint;
	};
	bench: {
		repPRs: RepPRs;
		maxEver: MaxEver;
		bestE1rm: E1RMPoint;
	};
	deadlift: {
		repPRs: RepPRs;
		maxEver: MaxEver;
		bestE1rm: E1RMPoint;
	};
	ohp: {
		repPRs: RepPRs;
		maxEver: MaxEver;
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
	byLift: {
		squat: {
			totalReps: number;
			distancePerRepInches: number;
			totalInches: number;
			totalFeet: number;
			totalMiles: number;
			totalMeters: number;
			totalKm: number;
		};
		bench: {
			totalReps: number;
			distancePerRepInches: number;
			totalInches: number;
			totalFeet: number;
			totalMiles: number;
			totalMeters: number;
			totalKm: number;
		};
		deadlift: {
			totalReps: number;
			distancePerRepInches: number;
			totalInches: number;
			totalFeet: number;
			totalMiles: number;
			totalMeters: number;
			totalKm: number;
		};
		ohp: {
			totalReps: number;
			distancePerRepInches: number;
			totalInches: number;
			totalFeet: number;
			totalMiles: number;
			totalMeters: number;
			totalKm: number;
		};
	};
	total: {
		inches: number;
		feet: number;
		miles: number;
		meters: number;
		km: number;
	};
	landmarks: {
		everestClimbs: number;
		empireStateClimbs: number;
		eiffelTowerClimbs: number;
		statueOfLibertyClimbs: number;
	};
	distancePerRepInches: {
		squat: number;
		bench: number;
		deadlift: number;
		ohp: number;
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

export interface RelativeStrengthRecord {
	date: string;
	liftLbs: number;
	liftKg: number;
	bodyWeightLbs: number;
	bodyWeightKg: number;
	multiple: number;
}

export interface RelativeStrength {
	squat: {
		best: RelativeStrengthRecord;
		current: RelativeStrengthRecord;
		monthlyProgression: {
			month: string;
			maxLiftLbs: number;
			maxLiftKg: number;
			avgBwLbs: number;
			avgBwKg: number;
			bwMultiple: number;
		}[];
	};
	bench: {
		best: RelativeStrengthRecord;
		current: RelativeStrengthRecord;
		monthlyProgression: {
			month: string;
			maxLiftLbs: number;
			maxLiftKg: number;
			avgBwLbs: number;
			avgBwKg: number;
			bwMultiple: number;
		}[];
	};
	deadlift: {
		best: RelativeStrengthRecord;
		current: RelativeStrengthRecord;
		monthlyProgression: {
			month: string;
			maxLiftLbs: number;
			maxLiftKg: number;
			avgBwLbs: number;
			avgBwKg: number;
			bwMultiple: number;
		}[];
	};
	ohp: {
		best: RelativeStrengthRecord;
		current: RelativeStrengthRecord;
		monthlyProgression: {
			month: string;
			maxLiftLbs: number;
			maxLiftKg: number;
			avgBwLbs: number;
			avgBwKg: number;
			bwMultiple: number;
		}[];
	};
}

export interface TrainingData {
	summary: Summary;
	volumeTimeSeries: VolumeTimeSeries;
	workoutCalendar: WorkoutCalendarDay[];
	exerciseProgress: Record<string, ExerciseProgress>;
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

// Split data types for lazy loading optimization

export interface CoreTrainingData {
	summary: Summary;
	allTimePRs: AllTimePRs;
	daysSinceLastPR: DaysSinceLastPR;
	barTravel: BarTravel;
	powerliftingTotals: PowerliftingTotals;
	volumeTimeSeries: {
		weekly: WeeklyTimeSeriesPoint[];
		monthly: MonthlyTimeSeriesPoint[];
		yearly: YearlyTimeSeriesPoint[];
	};
}

export interface DeferredTrainingData {
	volumeTimeSeriesDaily: TimeSeriesPoint[];
	workoutCalendar: WorkoutCalendarDay[];
	exerciseProgress: Record<string, ExerciseProgress>;
	bigThreeE1RM: BigThreeE1RM;
	bigThreeVolume: BigThreeVolume;
	programs: Program[];
	workoutsByDayOfWeek: DayOfWeekStats[];
	notableWorkouts: NotableWorkout[];
	milestones: Milestone[];
	plateMilestones: PlateMilestones;
	bodyWeight: BodyWeight;
	relativeStrength: RelativeStrength;
}

// Unit system types
export type UnitSystem = 'imperial' | 'metric';

export interface UnitPreferences {
	weight: UnitSystem;
	distance: UnitSystem;
}
