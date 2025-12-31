#!/usr/bin/env python3
"""
Extract strength training data from MyApp.db and generate training_data.json
for the dashboard visualization.
"""

import sqlite3
import json
from datetime import datetime, timedelta
from collections import defaultdict
import sys

DB_PATH = 'MyApp.db'
OUTPUT_PATH = 'training_data.json'

def connect_db():
    """Connect to the SQLite database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def ms_to_date(ms):
    """Convert milliseconds timestamp to YYYY-MM-DD string."""
    if ms is None:
        return None
    return datetime.fromtimestamp(ms / 1000).strftime('%Y-%m-%d')

def ms_to_datetime(ms):
    """Convert milliseconds timestamp to datetime object."""
    if ms is None:
        return None
    return datetime.fromtimestamp(ms / 1000)

def get_summary_stats(conn):
    """Calculate summary statistics."""
    cursor = conn.cursor()

    # Total workouts
    cursor.execute("SELECT COUNT(*) as count FROM history")
    total_workouts = cursor.fetchone()['count']

    # Total sets (excluding warmups: reps = -1)
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM history_exercises
        WHERE reps > 0
    """)
    total_sets = cursor.fetchone()['count']

    # Total volume in lbs and kg
    cursor.execute("""
        SELECT
            SUM(weightlb * reps) as total_volume_lbs,
            SUM(weightkg * reps) as total_volume_kg
        FROM history_exercises
        WHERE reps > 0
        AND weightlb IS NOT NULL
        AND weightkg IS NOT NULL
    """)
    volume_row = cursor.fetchone()
    total_volume_lbs = round(volume_row['total_volume_lbs'] or 0, 2)
    total_volume_kg = round(volume_row['total_volume_kg'] or 0, 2)

    # Total hours (duration is in seconds based on common conventions)
    cursor.execute("SELECT SUM(duration) as total_seconds FROM history WHERE duration IS NOT NULL")
    total_seconds = cursor.fetchone()['total_seconds'] or 0
    total_hours = round(total_seconds / 3600, 1)

    # Date range
    cursor.execute("SELECT MIN(date) as first, MAX(date) as last FROM history")
    date_range = cursor.fetchone()
    first_workout = ms_to_date(date_range['first'])
    last_workout = ms_to_date(date_range['last'])

    # Calculate streaks
    cursor.execute("SELECT DISTINCT date(date/1000, 'unixepoch') as workout_date FROM history ORDER BY workout_date")
    workout_dates = [datetime.strptime(row['workout_date'], '%Y-%m-%d') for row in cursor.fetchall()]

    current_streak = 0
    longest_streak = 0

    if workout_dates:
        # Current streak (working backwards from last workout)
        last_date = workout_dates[-1]
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        # Check if we should count today
        if last_date.date() == today.date() or last_date.date() == (today - timedelta(days=1)).date():
            streak = 1
            for i in range(len(workout_dates) - 2, -1, -1):
                if (workout_dates[i + 1].date() - workout_dates[i].date()).days == 1:
                    streak += 1
                else:
                    break
            current_streak = streak

        # Longest streak
        streak = 1
        max_streak = 1
        for i in range(1, len(workout_dates)):
            if (workout_dates[i].date() - workout_dates[i - 1].date()).days == 1:
                streak += 1
                max_streak = max(max_streak, streak)
            else:
                streak = 1
        longest_streak = max_streak

    return {
        'totalWorkouts': total_workouts,
        'totalSets': total_sets,
        'totalVolumeLbs': total_volume_lbs,
        'totalVolumeKg': total_volume_kg,
        'totalHours': total_hours,
        'firstWorkout': first_workout,
        'lastWorkout': last_workout,
        'currentStreak': current_streak,
        'longestStreak': longest_streak
    }

def get_volume_time_series(conn):
    """Calculate volume aggregations over time."""
    cursor = conn.cursor()

    # Daily aggregations
    cursor.execute("""
        SELECT
            date(h.date/1000, 'unixepoch') as workout_date,
            SUM(he.weightlb * he.reps) as volume_lbs,
            SUM(he.weightkg * he.reps) as volume_kg,
            COUNT(DISTINCT h.id) as workout_count
        FROM history h
        JOIN history_exercises he ON h.id = he.history_id
        WHERE he.reps > 0
        GROUP BY workout_date
        ORDER BY workout_date
    """)

    daily = []
    for row in cursor.fetchall():
        daily.append({
            'date': row['workout_date'],
            'volumeLbs': round(row['volume_lbs'] or 0, 2),
            'volumeKg': round(row['volume_kg'] or 0, 2),
            'workouts': row['workout_count']
        })

    # Weekly aggregations
    cursor.execute("""
        SELECT
            strftime('%Y-W%W', h.date/1000, 'unixepoch') as week,
            SUM(he.weightlb * he.reps) as volume_lbs,
            SUM(he.weightkg * he.reps) as volume_kg,
            COUNT(DISTINCT h.id) as workout_count
        FROM history h
        JOIN history_exercises he ON h.id = he.history_id
        WHERE he.reps > 0
        GROUP BY week
        ORDER BY week
    """)

    weekly = []
    for row in cursor.fetchall():
        weekly.append({
            'week': row['week'],
            'volumeLbs': round(row['volume_lbs'] or 0, 2),
            'volumeKg': round(row['volume_kg'] or 0, 2),
            'workouts': row['workout_count']
        })

    # Monthly aggregations
    cursor.execute("""
        SELECT
            strftime('%Y-%m', h.date/1000, 'unixepoch') as month,
            SUM(he.weightlb * he.reps) as volume_lbs,
            SUM(he.weightkg * he.reps) as volume_kg,
            COUNT(DISTINCT h.id) as workout_count
        FROM history h
        JOIN history_exercises he ON h.id = he.history_id
        WHERE he.reps > 0
        GROUP BY month
        ORDER BY month
    """)

    monthly = []
    for row in cursor.fetchall():
        monthly.append({
            'month': row['month'],
            'volumeLbs': round(row['volume_lbs'] or 0, 2),
            'volumeKg': round(row['volume_kg'] or 0, 2),
            'workouts': row['workout_count']
        })

    # Yearly aggregations
    cursor.execute("""
        SELECT
            strftime('%Y', h.date/1000, 'unixepoch') as year,
            SUM(he.weightlb * he.reps) as volume_lbs,
            SUM(he.weightkg * he.reps) as volume_kg,
            COUNT(DISTINCT h.id) as workout_count
        FROM history h
        JOIN history_exercises he ON h.id = he.history_id
        WHERE he.reps > 0
        GROUP BY year
        ORDER BY year
    """)

    yearly = []
    for row in cursor.fetchall():
        yearly.append({
            'year': int(row['year']),
            'volumeLbs': round(row['volume_lbs'] or 0, 2),
            'volumeKg': round(row['volume_kg'] or 0, 2),
            'workouts': row['workout_count']
        })

    return {
        'daily': daily,
        'weekly': weekly,
        'monthly': monthly,
        'yearly': yearly
    }

def get_workout_calendar(conn):
    """Generate workout calendar data for heatmap."""
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            date(h.date/1000, 'unixepoch') as workout_date,
            COUNT(DISTINCT h.id) as workout_count,
            SUM(he.weightlb * he.reps) as volume_lbs,
            SUM(he.weightkg * he.reps) as volume_kg
        FROM history h
        LEFT JOIN history_exercises he ON h.id = he.history_id AND he.reps > 0
        GROUP BY workout_date
        ORDER BY workout_date
    """)

    calendar = {}
    for row in cursor.fetchall():
        calendar[row['workout_date']] = {
            'count': row['workout_count'],
            'volumeLbs': round(row['volume_lbs'] or 0, 2),
            'volumeKg': round(row['volume_kg'] or 0, 2)
        }

    return calendar

def get_exercise_progress(conn):
    """Get exercise-specific statistics and PR history."""
    cursor = conn.cursor()

    # Get all exercises with their total volume
    cursor.execute("""
        SELECT
            e.exercise_name,
            SUM(he.weightlb * he.reps) as total_volume_lbs,
            SUM(he.weightkg * he.reps) as total_volume_kg,
            MIN(date(h.date/1000, 'unixepoch')) as first_performed,
            MAX(date(h.date/1000, 'unixepoch')) as last_performed
        FROM exercises e
        JOIN history_exercises he ON e.id = he.exercise_id
        JOIN history h ON he.history_id = h.id
        WHERE he.reps > 0
        GROUP BY e.exercise_name
        ORDER BY total_volume_lbs DESC
    """)

    exercise_progress = {}

    for row in cursor.fetchall():
        exercise_name = row['exercise_name']

        # Get PR history for this exercise (max weight for each rep range)
        cursor.execute("""
            SELECT
                date(h.date/1000, 'unixepoch') as workout_date,
                he.weightlb,
                he.weightkg,
                he.reps
            FROM history_exercises he
            JOIN history h ON he.history_id = h.id
            JOIN exercises e ON he.exercise_id = e.id
            WHERE e.exercise_name = ? AND he.reps > 0
            ORDER BY h.date, he.weightlb DESC
        """, (exercise_name,))

        # Track PRs (best weight for each rep count)
        prs_by_reps = {}
        prs = []

        for pr_row in cursor.fetchall():
            reps = pr_row['reps']
            weight_lbs = pr_row['weightlb'] or 0
            weight_kg = pr_row['weightkg'] or 0

            if reps not in prs_by_reps or weight_lbs > prs_by_reps[reps]['weightLbs']:
                prs_by_reps[reps] = {
                    'date': pr_row['workout_date'],
                    'weightLbs': round(weight_lbs, 2),
                    'weightKg': round(weight_kg, 2),
                    'reps': reps
                }

        # Convert to sorted list
        prs = sorted(prs_by_reps.values(), key=lambda x: x['date'])

        exercise_progress[exercise_name] = {
            'totalVolumeLbs': round(row['total_volume_lbs'] or 0, 2),
            'totalVolumeKg': round(row['total_volume_kg'] or 0, 2),
            'firstPerformed': row['first_performed'],
            'lastPerformed': row['last_performed'],
            'prs': prs
        }

    return exercise_progress

def get_big_three(conn, exercise_progress):
    """Extract Big 3 lifts (Squat, Bench Press, Deadlift) with detailed progress."""
    big_three = {}

    # Map common variations to canonical names
    squat_names = ['Squat', 'Back Squat', 'Front Squat', 'Squats']
    bench_names = ['Bench Press', 'Bench', 'Flat Bench Press']
    deadlift_names = ['Deadlift', 'Conventional Deadlift', 'Deadlifts']

    for exercise_name, data in exercise_progress.items():
        canonical_name = None
        if any(name.lower() == exercise_name.lower() for name in squat_names):
            canonical_name = 'squat'
        elif any(name.lower() == exercise_name.lower() for name in bench_names):
            canonical_name = 'bench'
        elif any(name.lower() == exercise_name.lower() for name in deadlift_names):
            canonical_name = 'deadlift'

        if canonical_name:
            big_three[canonical_name] = {
                'exerciseName': exercise_name,
                **data
            }

    return big_three

def get_programs(conn):
    """Get program history and statistics."""
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            p.routine as name,
            MIN(date(h.date/1000, 'unixepoch')) as start_date,
            MAX(date(h.date/1000, 'unixepoch')) as end_date,
            COUNT(DISTINCT h.id) as workout_count,
            SUM(he.weightlb * he.reps) as total_volume_lbs,
            SUM(he.weightkg * he.reps) as total_volume_kg
        FROM programs p
        JOIN history h ON p.id = h.program_id
        LEFT JOIN history_exercises he ON h.id = he.history_id AND he.reps > 0
        GROUP BY p.id, p.routine
        ORDER BY start_date
    """)

    programs = []
    for row in cursor.fetchall():
        programs.append({
            'name': row['name'],
            'startDate': row['start_date'],
            'endDate': row['end_date'],
            'workouts': row['workout_count'],
            'totalVolumeLbs': round(row['total_volume_lbs'] or 0, 2),
            'totalVolumeKg': round(row['total_volume_kg'] or 0, 2)
        })

    return programs

def get_workouts_by_day_of_week(conn):
    """Calculate average volume and frequency by day of week."""
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            CASE CAST(strftime('%w', h.date/1000, 'unixepoch') AS INTEGER)
                WHEN 0 THEN 'Sunday'
                WHEN 1 THEN 'Monday'
                WHEN 2 THEN 'Tuesday'
                WHEN 3 THEN 'Wednesday'
                WHEN 4 THEN 'Thursday'
                WHEN 5 THEN 'Friday'
                WHEN 6 THEN 'Saturday'
            END as day_name,
            CAST(strftime('%w', h.date/1000, 'unixepoch') AS INTEGER) as day_num,
            COUNT(DISTINCT h.id) as workout_count,
            AVG(daily_volume_lbs) as avg_volume_lbs,
            AVG(daily_volume_kg) as avg_volume_kg
        FROM history h
        LEFT JOIN (
            SELECT
                history_id,
                SUM(weightlb * reps) as daily_volume_lbs,
                SUM(weightkg * reps) as daily_volume_kg
            FROM history_exercises
            WHERE reps > 0
            GROUP BY history_id
        ) volumes ON h.id = volumes.history_id
        GROUP BY day_num, day_name
        ORDER BY day_num
    """)

    by_day = {}
    for row in cursor.fetchall():
        by_day[row['day_name']] = {
            'count': row['workout_count'],
            'avgVolumeLbs': round(row['avg_volume_lbs'] or 0, 2),
            'avgVolumeKg': round(row['avg_volume_kg'] or 0, 2)
        }

    return by_day

def get_notable_workouts(conn):
    """Identify notable workouts (high volume, PRs, milestones)."""
    cursor = conn.cursor()

    # Top 10 highest volume workouts
    cursor.execute("""
        SELECT
            date(h.date/1000, 'unixepoch') as workout_date,
            SUM(he.weightlb * he.reps) as volume_lbs,
            SUM(he.weightkg * he.reps) as volume_kg,
            p.routine as program_name
        FROM history h
        LEFT JOIN history_exercises he ON h.id = he.history_id AND he.reps > 0
        LEFT JOIN programs p ON h.program_id = p.id
        GROUP BY h.id
        ORDER BY volume_lbs DESC
        LIMIT 10
    """)

    notable = []
    for i, row in enumerate(cursor.fetchall(), 1):
        notable.append({
            'date': row['workout_date'],
            'reason': f'#{i} Highest Volume',
            'volumeLbs': round(row['volume_lbs'] or 0, 2),
            'volumeKg': round(row['volume_kg'] or 0, 2),
            'details': row['program_name'] or 'Unknown Program'
        })

    return notable

def get_milestones(conn, summary):
    """Calculate volume and workout count milestones."""
    cursor = conn.cursor()

    # Get cumulative volume over time
    cursor.execute("""
        SELECT
            date(h.date/1000, 'unixepoch') as workout_date,
            SUM(he.weightlb * he.reps) as volume_lbs
        FROM history h
        LEFT JOIN history_exercises he ON h.id = he.history_id AND he.reps > 0
        GROUP BY h.id
        ORDER BY h.date
    """)

    milestones = []
    cumulative_volume = 0
    workout_count = 0
    volume_milestones = [100000, 250000, 500000, 750000, 1000000, 1500000, 2000000, 2500000]
    workout_milestones = [100, 250, 500, 750, 1000]

    volume_idx = 0
    workout_idx = 0

    for row in cursor.fetchall():
        cumulative_volume += (row['volume_lbs'] or 0)
        workout_count += 1

        # Check volume milestones
        while volume_idx < len(volume_milestones) and cumulative_volume >= volume_milestones[volume_idx]:
            milestones.append({
                'date': row['workout_date'],
                'milestone': f'{volume_milestones[volume_idx]:,} lbs total volume'
            })
            volume_idx += 1

        # Check workout count milestones
        while workout_idx < len(workout_milestones) and workout_count >= workout_milestones[workout_idx]:
            milestones.append({
                'date': row['workout_date'],
                'milestone': f'{workout_milestones[workout_idx]} workouts completed'
            })
            workout_idx += 1

    # Sort by date
    milestones.sort(key=lambda x: x['date'])

    return milestones

def main():
    """Main execution function."""
    print("Connecting to database...")
    conn = connect_db()

    print("Extracting summary statistics...")
    summary = get_summary_stats(conn)

    print("Calculating volume time series...")
    volume_time_series = get_volume_time_series(conn)

    print("Generating workout calendar...")
    workout_calendar = get_workout_calendar(conn)

    print("Analyzing exercise progress...")
    exercise_progress = get_exercise_progress(conn)

    print("Extracting Big 3 lifts...")
    big_three = get_big_three(conn, exercise_progress)

    print("Getting program history...")
    programs = get_programs(conn)

    print("Analyzing workout patterns...")
    workouts_by_day = get_workouts_by_day_of_week(conn)

    print("Finding notable workouts...")
    notable_workouts = get_notable_workouts(conn)

    print("Calculating milestones...")
    milestones = get_milestones(conn, summary)

    # Compile all data
    data = {
        'summary': summary,
        'volumeTimeSeries': volume_time_series,
        'workoutCalendar': workout_calendar,
        'exerciseProgress': exercise_progress,
        'bigThree': big_three,
        'programs': programs,
        'workoutsByDayOfWeek': workouts_by_day,
        'notableWorkouts': notable_workouts,
        'milestones': milestones
    }

    print(f"Writing output to {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"Successfully generated {OUTPUT_PATH}")
    print(f"\nSummary:")
    print(f"  - Total Workouts: {summary['totalWorkouts']}")
    print(f"  - Total Volume: {summary['totalVolumeLbs']:,.0f} lbs / {summary['totalVolumeKg']:,.0f} kg")
    print(f"  - Date Range: {summary['firstWorkout']} to {summary['lastWorkout']}")
    print(f"  - Unique Exercises: {len(exercise_progress)}")

    conn.close()

if __name__ == '__main__':
    main()
