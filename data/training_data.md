## training_data.json Structure

```
training_data:
  summary:                       # Global aggregates & headline stats
    firstWorkoutDate: string     # ISO date
    lastWorkoutDate: string      # ISO date
    totalWorkouts: number
    totalSets: number
    totalReps: number
    totalVolumeLbs: number
    totalVolumeKg: number
    totalHours: number
    avgWorkoutsPerWeek: number
    avgVolumePerWorkoutLbs: number
    avgVolumePerWorkoutKg: number
    bestMonthEver:
      month: string              # YYYY-MM
      volumeLbs: number
      volumeKg: number

  volumeTimeSeries:              # Time-series aggregates at multiple granularities
    daily:
      "YYYY-MM-DD":
        volumeLbs: number
        volumeKg: number
        workoutCount: number
    weekly:
      "YYYY-WW":
        volumeLbs: number
        volumeKg: number
        workoutCount: number
    monthly:
      "YYYY-MM":
        volumeLbs: number
        volumeKg: number
        workoutCount: number

  workoutCalendar:               # Calendar-style lookup (heatmap-ready)
    "YYYY-MM-DD":
      volumeLbs: number
      volumeKg: number
      count: number              # workouts that day

  exerciseProgress:              # Per-exercise longitudinal tracking
    exerciseName:
      firstSeen: string          # ISO date
      lastSeen: string           # ISO date
      totalVolumeLbs: number
      totalVolumeKg: number
      totalSets: number
      totalReps: number
      prs:                        # PR events for this exercise
        - date: string
          weight: number
          reps: number
          estimated1RM: number
      volumeByMonth:
        "YYYY-MM":
          volumeLbs: number
          volumeKg: number

  bigThreeE1RM:                  # Estimated 1RM time series (Squat/Bench/Deadlift)
    squat|bench|deadlift:
      "YYYY-MM":
        estimated1RM: number
        bestSet:
          weight: number
          reps: number

  bigThreeVolume:                # Volume tracking for big three lifts
    squat|bench|deadlift:
      daily:
        "YYYY-MM-DD":
          volumeLbs: number
          volumeKg: number
      totalVolumeLbs: number
      totalVolumeKg: number

  programs:                      # Training blocks / programming phases
    - name: string
      startDate: string          # ISO date
      endDate: string|null
      workoutCount: number
      totalVolumeLbs: number
      totalVolumeKg: number
      prsSet: number             # PRs achieved during this program

  workoutsByDayOfWeek:           # Aggregates by weekday
    Monday|Tuesday|...:
      count: number
      avgVolumeLbs: number
      avgVolumeKg: number

  notableWorkouts:               # Individual standout sessions
    - date: string
      volumeLbs: number
      volumeKg: number
      sets: number
      reps: number
      reason: string             # e.g. "Highest volume day"

  milestones:                    # Narrative / annotation events
    - date: string
      type: string               # e.g. "total_volume", "workout_count"
      value: number
      description: string

  plateMilestones:               # First-time plate achievements
    exerciseName:
      plateCount: number         # e.g. 3 plates = 315 lbs
      date: string

  powerliftingTotals:            # Combined S/B/D totals
    raw:
      bestTotal: number
      date: string
    estimated:
      bestTotal: number
      date: string

  allTimePRs:                    # Absolute lifetime PRs
    exerciseName:
      weight: number
      reps: number
      estimated1RM: number
      date: string

  daysSinceLastPR:               # Recency metric per lift
    exerciseName: number         # days since most recent PR

  barTravel:                     # Biomechanics proxy (volume × ROM)
    exerciseName:
      totalDistanceMeters: number
      avgPerWorkoutMeters: number

  bodyWeight:                    # Bodyweight time series
    "YYYY-MM":
      avgBodyWeightLbs: number
      avgBodyWeightKg: number

  relativeStrength:              # Strength normalized to bodyweight
    squat|bench|deadlift:
      "YYYY-MM":
        estimated1RM: number
        bodyWeightLbs: number
        bwMultiple: number       # e.g. 2.1 × bodyweight
```
