#!/usr/bin/env python3
"""
Extract strength training data from MyApp.db and generate training_data.json
for the dashboard visualization.
"""

import sqlite3
import json
from datetime import datetime
import sys

DB_PATH = 'MyApp.db'
OUTPUT_PATH = 'training_data.json'

# Big 3 exercise name variations
SQUAT_NAMES = ['Squat', 'Back Squat', 'Front Squat', 'Squats']
BENCH_NAMES = ['Bench Press', 'Bench', 'Flat Bench Press']
DEADLIFT_NAMES = ['Deadlift', 'Conventional Deadlift', 'Deadlifts']
OHP_NAMES = ['Overhead Press', 'OHP', 'Military Press', 'Standing Press', 'Shoulder Press', 'Barbell Overhead Press']

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

    # Total hours (duration is in minutes)
    cursor.execute("SELECT SUM(duration) as total_minutes FROM history WHERE duration IS NOT NULL")
    total_minutes = cursor.fetchone()['total_minutes'] or 0
    total_hours = round(total_minutes / 60, 1)

    # Date range
    cursor.execute("SELECT MIN(date) as first, MAX(date) as last FROM history")
    date_range = cursor.fetchone()
    first_workout = ms_to_date(date_range['first'])
    last_workout = ms_to_date(date_range['last'])

    # Calculate derived statistics
    avg_workout_duration = round(total_minutes / total_workouts, 1) if total_workouts > 0 else 0
    avg_volume_per_workout_lbs = round(total_volume_lbs / total_workouts, 2) if total_workouts > 0 else 0
    avg_volume_per_workout_kg = round(total_volume_kg / total_workouts, 2) if total_workouts > 0 else 0
    avg_sets_per_workout = round(total_sets / total_workouts, 1) if total_workouts > 0 else 0

    # Calculate workouts per week average
    if date_range['first'] and date_range['last']:
        first_date = datetime.fromtimestamp(date_range['first'] / 1000)
        last_date = datetime.fromtimestamp(date_range['last'] / 1000)
        total_days = (last_date - first_date).days + 1
        total_weeks = total_days / 7
        workouts_per_week_avg = round(total_workouts / total_weeks, 1) if total_weeks > 0 else 0
    else:
        workouts_per_week_avg = 0

    # Total reps ever
    cursor.execute("SELECT SUM(reps) as total_reps FROM history_exercises WHERE reps > 0")
    total_reps = cursor.fetchone()['total_reps'] or 0

    # Total tons (lbs / 2000)
    total_tons = round(total_volume_lbs / 2000, 1) if total_volume_lbs > 0 else 0

    # Best month ever
    cursor.execute("""
        SELECT
            strftime('%Y-%m', h.date/1000, 'unixepoch') as month,
            SUM(he.weightlb * he.reps) as volume_lbs,
            SUM(he.weightkg * he.reps) as volume_kg
        FROM history h
        JOIN history_exercises he ON h.id = he.history_id
        WHERE he.reps > 0
        GROUP BY month
        ORDER BY volume_lbs DESC
        LIMIT 1
    """)
    best_month_row = cursor.fetchone()
    best_month_ever = None
    if best_month_row:
        best_month_ever = {
            'month': best_month_row['month'],
            'volumeLbs': round(best_month_row['volume_lbs'] or 0, 2),
            'volumeKg': round(best_month_row['volume_kg'] or 0, 2)
        }

    # Best year ever
    cursor.execute("""
        SELECT
            strftime('%Y', h.date/1000, 'unixepoch') as year,
            SUM(he.weightlb * he.reps) as volume_lbs,
            SUM(he.weightkg * he.reps) as volume_kg,
            COUNT(DISTINCT h.id) as workouts
        FROM history h
        JOIN history_exercises he ON h.id = he.history_id
        WHERE he.reps > 0
        GROUP BY year
        ORDER BY volume_lbs DESC
        LIMIT 1
    """)
    best_year_row = cursor.fetchone()
    best_year_ever = None
    if best_year_row:
        best_year_ever = {
            'year': int(best_year_row['year']),
            'volumeLbs': round(best_year_row['volume_lbs'] or 0, 2),
            'volumeKg': round(best_year_row['volume_kg'] or 0, 2),
            'workouts': best_year_row['workouts']
        }

    return {
        'totalWorkouts': total_workouts,
        'totalSets': total_sets,
        'totalVolumeLbs': total_volume_lbs,
        'totalVolumeKg': total_volume_kg,
        'totalHours': total_hours,
        'totalReps': total_reps,
        'totalTons': total_tons,
        'bestMonthEver': best_month_ever,
        'bestYearEver': best_year_ever,
        'firstWorkout': first_workout,
        'lastWorkout': last_workout,
        'avgWorkoutDuration': avg_workout_duration,
        'avgVolumePerWorkoutLbs': avg_volume_per_workout_lbs,
        'avgVolumePerWorkoutKg': avg_volume_per_workout_kg,
        'avgSetsPerWorkout': avg_sets_per_workout,
        'workoutsPerWeekAvg': workouts_per_week_avg
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

def calculate_e1rm(weight, reps):
    """Calculate estimated 1RM using Epley formula."""
    if reps == 1:
        return weight
    # Epley formula: weight × (1 + reps/30)
    return weight * (1 + reps / 30)

def get_big_three_e1rm(conn):
    """Get estimated 1RM data for Big 3 lifts from every workout."""
    cursor = conn.cursor()
    big_three_e1rm = {}

    for canonical_name, name_list in [('squat', SQUAT_NAMES), ('bench', BENCH_NAMES), ('deadlift', DEADLIFT_NAMES), ('ohp', OHP_NAMES)]:
        # Get all sets for this exercise
        cursor.execute(f"""
            SELECT
                date(h.date/1000, 'unixepoch') as workout_date,
                he.weightlb,
                he.weightkg,
                he.reps,
                e.exercise_name
            FROM history_exercises he
            JOIN history h ON he.history_id = h.id
            JOIN exercises e ON he.exercise_id = e.id
            WHERE LOWER(e.exercise_name) IN ({','.join(['LOWER(?)'] * len(name_list))})
            AND he.reps > 0
            ORDER BY h.date
        """, name_list)

        rows = cursor.fetchall()
        if not rows:
            continue

        # Group by workout date and find best e1RM per workout
        workout_e1rms = {}
        for row in rows:
            date = row['workout_date']
            weight_lbs = row['weightlb'] or 0
            weight_kg = row['weightkg'] or 0
            reps = row['reps']

            # Skip sets with more than 10 reps (e1RM formula less accurate)
            if reps > 10:
                continue

            e1rm_lbs = calculate_e1rm(weight_lbs, reps)
            e1rm_kg = calculate_e1rm(weight_kg, reps)

            if date not in workout_e1rms or e1rm_lbs > workout_e1rms[date]['e1rmLbs']:
                workout_e1rms[date] = {
                    'date': date,
                    'e1rmLbs': round(e1rm_lbs, 2),
                    'e1rmKg': round(e1rm_kg, 2),
                    'actualWeightLbs': round(weight_lbs, 2),
                    'actualWeightKg': round(weight_kg, 2),
                    'reps': reps
                }

        # Convert to sorted list
        e1rm_data = sorted(workout_e1rms.values(), key=lambda x: x['date'])

        if e1rm_data:
            big_three_e1rm[canonical_name] = {
                'exerciseName': rows[0]['exercise_name'],
                'e1rmHistory': e1rm_data
            }

    return big_three_e1rm

def get_big_three_volume(conn):
    """Get volume time series for Big 3 lifts (daily aggregation)."""
    cursor = conn.cursor()
    big_three_volume = {}

    for canonical_name, name_list in [('squat', SQUAT_NAMES), ('bench', BENCH_NAMES), ('deadlift', DEADLIFT_NAMES), ('ohp', OHP_NAMES)]:
        # Get daily volume for this exercise
        cursor.execute(f"""
            SELECT
                date(h.date/1000, 'unixepoch') as workout_date,
                SUM(he.weightlb * he.reps) as volume_lbs,
                SUM(he.weightkg * he.reps) as volume_kg,
                e.exercise_name
            FROM history_exercises he
            JOIN history h ON he.history_id = h.id
            JOIN exercises e ON he.exercise_id = e.id
            WHERE LOWER(e.exercise_name) IN ({','.join(['LOWER(?)'] * len(name_list))})
            AND he.reps > 0
            GROUP BY workout_date
            ORDER BY workout_date
        """, name_list)

        rows = cursor.fetchall()
        if not rows:
            continue

        daily_volume = []
        for row in rows:
            daily_volume.append({
                'date': row['workout_date'],
                'volumeLbs': round(row['volume_lbs'] or 0, 2),
                'volumeKg': round(row['volume_kg'] or 0, 2)
            })

        if daily_volume:
            big_three_volume[canonical_name] = {
                'exerciseName': rows[0]['exercise_name'],
                'dailyVolume': daily_volume
            }

    return big_three_volume



def get_programs(conn):
    """Get program history and statistics."""
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            p.id as program_id,
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
        program_id = row['program_id']
        start_date = row['start_date']
        end_date = row['end_date']

        # Count unique PRs set during this program's date range (distinct exercise+rep combinations where weight increased)
        cursor.execute("""
            SELECT COUNT(DISTINCT exercise_id || '-' || reps) as pr_count
            FROM (
                SELECT
                    date(h.date/1000, 'unixepoch') as pr_date,
                    he.exercise_id,
                    he.reps,
                    MAX(he.weightlb) as max_weight_day,
                    MAX(MAX(he.weightlb)) OVER (
                        PARTITION BY he.exercise_id, he.reps
                        ORDER BY h.date
                        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                    ) as prev_max
                FROM history_exercises he
                JOIN history h ON he.history_id = h.id
                WHERE he.reps > 0
                GROUP BY he.exercise_id, he.reps, h.date
            ) subq
            WHERE prev_max IS NOT NULL AND max_weight_day > prev_max
            AND pr_date BETWEEN ? AND ?
        """, (start_date, end_date))

        pr_count = cursor.fetchone()['pr_count']

        programs.append({
            'name': row['name'],
            'startDate': start_date,
            'endDate': end_date,
            'workouts': row['workout_count'],
            'totalVolumeLbs': round(row['total_volume_lbs'] or 0, 2),
            'totalVolumeKg': round(row['total_volume_kg'] or 0, 2),
            'prsSet': pr_count
        })

    return programs

def get_workouts_by_day_of_week(conn):
    """Calculate average volume and frequency by day of week."""
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            CAST(strftime('%w', h.date/1000, 'unixepoch') AS INTEGER) as day_num,
            CASE CAST(strftime('%w', h.date/1000, 'unixepoch') AS INTEGER)
                WHEN 0 THEN 'Sunday'
                WHEN 1 THEN 'Monday'
                WHEN 2 THEN 'Tuesday'
                WHEN 3 THEN 'Wednesday'
                WHEN 4 THEN 'Thursday'
                WHEN 5 THEN 'Friday'
                WHEN 6 THEN 'Saturday'
            END as day_name,
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
        GROUP BY day_num
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
    """Identify notable workouts (volume records, set records, comebacks)."""
    cursor = conn.cursor()
    notable = []

    # Top 5 Volume Records
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
        LIMIT 5
    """)

    for i, row in enumerate(cursor.fetchall(), 1):
        notable.append({
            'date': row['workout_date'],
            'reason': f'Volume Record #{i}',
            'volumeLbs': round(row['volume_lbs'] or 0, 2),
            'volumeKg': round(row['volume_kg'] or 0, 2),
            'details': row['program_name'] or 'Unknown Program',
            'category': 'volume'
        })

    # Top 5 Most Sets
    cursor.execute("""
        SELECT
            date(h.date/1000, 'unixepoch') as workout_date,
            COUNT(*) as set_count,
            SUM(he.weightlb * he.reps) as volume_lbs,
            SUM(he.weightkg * he.reps) as volume_kg,
            p.routine as program_name
        FROM history h
        LEFT JOIN history_exercises he ON h.id = he.history_id AND he.reps > 0
        LEFT JOIN programs p ON h.program_id = p.id
        GROUP BY h.id
        ORDER BY set_count DESC
        LIMIT 5
    """)

    for i, row in enumerate(cursor.fetchall(), 1):
        notable.append({
            'date': row['workout_date'],
            'reason': f'Most Sets #{i} ({row["set_count"]} sets)',
            'volumeLbs': round(row['volume_lbs'] or 0, 2),
            'volumeKg': round(row['volume_kg'] or 0, 2),
            'details': row['program_name'] or 'Unknown Program',
            'category': 'sets'
        })

    # Find comeback workouts (first workout after 14+ day gap)
    cursor.execute("""
        SELECT
            workout_date,
            volume_lbs,
            volume_kg,
            program_name,
            days_gap
        FROM (
            SELECT
                date(h.date/1000, 'unixepoch') as workout_date,
                SUM(he.weightlb * he.reps) as volume_lbs,
                SUM(he.weightkg * he.reps) as volume_kg,
                p.routine as program_name,
                JULIANDAY(datetime(h.date/1000, 'unixepoch')) - JULIANDAY(LAG(datetime(h.date/1000, 'unixepoch')) OVER (ORDER BY h.date)) as days_gap
            FROM history h
            LEFT JOIN history_exercises he ON h.id = he.history_id AND he.reps > 0
            LEFT JOIN programs p ON h.program_id = p.id
            GROUP BY h.id
        ) subq
        WHERE days_gap >= 14
        ORDER BY workout_date DESC
        LIMIT 5
    """)

    for row in cursor.fetchall():
        notable.append({
            'date': row['workout_date'],
            'reason': f'Comeback ({int(row["days_gap"])} days off)',
            'volumeLbs': round(row['volume_lbs'] or 0, 2),
            'volumeKg': round(row['volume_kg'] or 0, 2),
            'details': row['program_name'] or 'Unknown Program',
            'category': 'comeback'
        })

    # Sort by date descending
    notable.sort(key=lambda x: x['date'], reverse=True)

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
    volume_milestones = [100000, 250000, 500000, 750000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000, 6000000, 7000000]
    workout_milestones = [100, 250, 500, 750, 1000, 1250, 1500]

    volume_idx = 0
    workout_idx = 0

    for row in cursor.fetchall():
        cumulative_volume += (row['volume_lbs'] or 0)
        workout_count += 1

        # Check volume milestones
        while volume_idx < len(volume_milestones) and cumulative_volume >= volume_milestones[volume_idx]:
            milestones.append({
                'date': row['workout_date'],
                'milestone': f'{volume_milestones[volume_idx]:,} lbs total volume',
                'type': 'volume',
                'icon': '📊'
            })
            volume_idx += 1

        # Check workout count milestones
        while workout_idx < len(workout_milestones) and workout_count >= workout_milestones[workout_idx]:
            milestones.append({
                'date': row['workout_date'],
                'milestone': f'{workout_milestones[workout_idx]} workouts completed',
                'type': 'workouts',
                'icon': '🏋️'
            })
            workout_idx += 1

    # Sort by date
    milestones.sort(key=lambda x: x['date'])

    return milestones

def get_plate_milestones(conn):
    """Calculate when plate milestones were first achieved for Big 3 lifts."""
    cursor = conn.cursor()

    # Plate thresholds in lbs
    plate_thresholds = {
        1: 135,   # 1 plate per side
        2: 225,   # 2 plates per side
        3: 315,   # 3 plates per side
        4: 405,   # 4 plates per side
        5: 495,   # 5 plates per side
    }

    plate_milestones = {}

    for canonical_name, name_list in [('squat', SQUAT_NAMES), ('bench', BENCH_NAMES), ('deadlift', DEADLIFT_NAMES), ('ohp', OHP_NAMES)]:
        # Get all sets ordered by date
        cursor.execute(f"""
            SELECT
                date(h.date/1000, 'unixepoch') as workout_date,
                MAX(he.weightlb) as max_weight_lbs,
                MAX(he.weightkg) as max_weight_kg
            FROM history_exercises he
            JOIN history h ON he.history_id = h.id
            JOIN exercises e ON he.exercise_id = e.id
            WHERE LOWER(e.exercise_name) IN ({','.join(['LOWER(?)'] * len(name_list))})
            AND he.reps > 0
            GROUP BY workout_date
            ORDER BY h.date
        """, name_list)

        rows = cursor.fetchall()
        if not rows:
            continue

        achieved = {}
        for row in rows:
            max_weight = row['max_weight_lbs'] or 0
            for plates, threshold in plate_thresholds.items():
                if plates not in achieved and max_weight >= threshold:
                    achieved[plates] = {
                        'date': row['workout_date'],
                        'weightLbs': threshold,
                        'weightKg': round(threshold * 0.453592, 1),
                        'actualWeightLbs': round(max_weight, 2),
                        'actualWeightKg': round(row['max_weight_kg'] or 0, 2)
                    }

        plate_milestones[canonical_name] = achieved

    return plate_milestones

def get_powerlifting_totals(conn):
    """Calculate combined S+B+D totals over time for 1000 lb club tracking."""
    cursor = conn.cursor()

    # Get all e1RM data for each lift by date
    lift_e1rms = {}

    for canonical_name, name_list in [('squat', SQUAT_NAMES), ('bench', BENCH_NAMES), ('deadlift', DEADLIFT_NAMES)]:
        cursor.execute(f"""
            SELECT
                date(h.date/1000, 'unixepoch') as workout_date,
                he.weightlb,
                he.weightkg,
                he.reps
            FROM history_exercises he
            JOIN history h ON he.history_id = h.id
            JOIN exercises e ON he.exercise_id = e.id
            WHERE LOWER(e.exercise_name) IN ({','.join(['LOWER(?)'] * len(name_list))})
            AND he.reps > 0 AND he.reps <= 10
            ORDER BY h.date
        """, name_list)

        # Track best e1RM for each workout date
        workout_e1rms = {}
        for row in cursor.fetchall():
            date = row['workout_date']
            weight_lbs = row['weightlb'] or 0
            weight_kg = row['weightkg'] or 0
            reps = row['reps']

            e1rm_lbs = calculate_e1rm(weight_lbs, reps)
            e1rm_kg = calculate_e1rm(weight_kg, reps)

            if date not in workout_e1rms or e1rm_lbs > workout_e1rms[date]['lbs']:
                workout_e1rms[date] = {'lbs': e1rm_lbs, 'kg': e1rm_kg}

        lift_e1rms[canonical_name] = workout_e1rms

    # Get all unique dates and track running max for each lift
    all_dates = set()
    for lift_data in lift_e1rms.values():
        all_dates.update(lift_data.keys())
    all_dates = sorted(all_dates)

    # Calculate running total for each date
    totals_history = []
    running_max = {'squat': 0, 'bench': 0, 'deadlift': 0}
    running_max_kg = {'squat': 0, 'bench': 0, 'deadlift': 0}

    club_milestones = {
        500: None,
        750: None,
        1000: None,
        1100: None,
        1200: None,
        1300: None,
        1400: None,
        1500: None,
    }

    for date in all_dates:
        # Update running max for any lift trained on this date
        for lift in ['squat', 'bench', 'deadlift']:
            if date in lift_e1rms.get(lift, {}):
                if lift_e1rms[lift][date]['lbs'] > running_max[lift]:
                    running_max[lift] = lift_e1rms[lift][date]['lbs']
                    running_max_kg[lift] = lift_e1rms[lift][date]['kg']

        total_lbs = sum(running_max.values())
        total_kg = sum(running_max_kg.values())

        totals_history.append({
            'date': date,
            'totalLbs': round(total_lbs, 2),
            'totalKg': round(total_kg, 2),
            'squatE1rm': round(running_max['squat'], 2),
            'benchE1rm': round(running_max['bench'], 2),
            'deadliftE1rm': round(running_max['deadlift'], 2)
        })

        # Check club milestones
        for threshold in sorted(club_milestones.keys()):
            if club_milestones[threshold] is None and total_lbs >= threshold:
                club_milestones[threshold] = {
                    'date': date,
                    'totalLbs': round(total_lbs, 2),
                    'totalKg': round(total_kg, 2),
                    'squat': round(running_max['squat'], 2),
                    'bench': round(running_max['bench'], 2),
                    'deadlift': round(running_max['deadlift'], 2)
                }

    # Get current (latest) total
    current = totals_history[-1] if totals_history else None
    peak = max(totals_history, key=lambda x: x['totalLbs']) if totals_history else None

    return {
        'history': totals_history,
        'current': current,
        'peak': peak,
        'clubMilestones': {k: v for k, v in club_milestones.items() if v is not None}
    }

def get_all_time_prs(conn):
    """Get all-time PR records for Big 3 lifts."""
    cursor = conn.cursor()

    all_time_prs = {}

    for canonical_name, name_list in [('squat', SQUAT_NAMES), ('bench', BENCH_NAMES), ('deadlift', DEADLIFT_NAMES), ('ohp', OHP_NAMES)]:
        # Get max weight for each rep range
        cursor.execute(f"""
            SELECT
                he.reps,
                MAX(he.weightlb) as max_weight_lbs,
                MAX(he.weightkg) as max_weight_kg
            FROM history_exercises he
            JOIN exercises e ON he.exercise_id = e.id
            WHERE LOWER(e.exercise_name) IN ({','.join(['LOWER(?)'] * len(name_list))})
            AND he.reps > 0 AND he.reps <= 10
            GROUP BY he.reps
            ORDER BY he.reps
        """, name_list)

        rep_prs = {}
        for row in cursor.fetchall():
            reps = row['reps']
            weight_lbs = row['max_weight_lbs'] or 0
            weight_kg = row['max_weight_kg'] or 0
            e1rm_lbs = calculate_e1rm(weight_lbs, reps)
            e1rm_kg = calculate_e1rm(weight_kg, reps)

            rep_prs[reps] = {
                'weightLbs': round(weight_lbs, 2),
                'weightKg': round(weight_kg, 2),
                'e1rmLbs': round(e1rm_lbs, 2),
                'e1rmKg': round(e1rm_kg, 2)
            }

        # Get absolute max weight ever lifted (any reps)
        cursor.execute(f"""
            SELECT
                MAX(he.weightlb) as max_weight_lbs,
                MAX(he.weightkg) as max_weight_kg
            FROM history_exercises he
            JOIN exercises e ON he.exercise_id = e.id
            WHERE LOWER(e.exercise_name) IN ({','.join(['LOWER(?)'] * len(name_list))})
            AND he.reps > 0
        """, name_list)

        max_row = cursor.fetchone()
        max_ever = {
            'weightLbs': round(max_row['max_weight_lbs'] or 0, 2),
            'weightKg': round(max_row['max_weight_kg'] or 0, 2)
        }

        # Find best e1RM
        best_e1rm = max(rep_prs.values(), key=lambda x: x['e1rmLbs']) if rep_prs else None

        all_time_prs[canonical_name] = {
            'repPRs': rep_prs,
            'maxEver': max_ever,
            'bestE1rm': best_e1rm
        }

    return all_time_prs

def get_days_since_last_pr(conn):
    """Calculate days since most recent PR for each Big 3 lift."""
    from datetime import datetime, date
    cursor = conn.cursor()

    days_since = {}
    today = date.today()

    for canonical_name, name_list in [('squat', SQUAT_NAMES), ('bench', BENCH_NAMES), ('deadlift', DEADLIFT_NAMES), ('ohp', OHP_NAMES)]:
        # Get most recent PR date for this lift
        cursor.execute(f"""
            SELECT MAX(date(h.date/1000, 'unixepoch')) as latest_pr_date
            FROM (
                SELECT
                    h.date,
                    he.weightlb,
                    he.reps,
                    MAX(he.weightlb) OVER (
                        PARTITION BY he.reps
                        ORDER BY h.date
                        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                    ) as prev_max
                FROM history_exercises he
                JOIN history h ON he.history_id = h.id
                JOIN exercises e ON he.exercise_id = e.id
                WHERE LOWER(e.exercise_name) IN ({','.join(['LOWER(?)'] * len(name_list))})
                AND he.reps > 0 AND he.reps <= 10
            ) subq
            JOIN history h ON subq.date = h.date
            WHERE prev_max IS NULL OR weightlb > prev_max
        """, name_list)

        result = cursor.fetchone()
        if result and result['latest_pr_date']:
            latest_pr = datetime.strptime(result['latest_pr_date'], '%Y-%m-%d').date()
            days_since[canonical_name] = (today - latest_pr).days
        else:
            days_since[canonical_name] = None

    return days_since

def get_bar_travel_stats(conn):
    """Calculate bar travel distance statistics for Big 4 lifts."""
    cursor = conn.cursor()
    
    # Bar travel distance per rep in inches (measured by user)
    # These are full rep distances (down + up for squat/bench, up + down for deadlift/ohp)
    BAR_TRAVEL_INCHES = {
        'squat': 47,        # 23.5" down + 23.5" up
        'bench': 38,        # 19" down + 19" up  
        'deadlift': 50.3,   # (34" - 8.85") × 2 = 25.15" × 2
        'ohp': 48,          # 24" up + 24" down
    }
    
    # Landmark heights in inches for fun comparisons
    LANDMARKS = {
        'everest': 29032 * 12,      # 29,032 feet = 348,384 inches
        'empire_state': 1454 * 12,  # 1,454 feet = 17,448 inches
        'statue_liberty': 305 * 12, # 305 feet = 3,660 inches
        'eiffel_tower': 1083 * 12,  # 1,083 feet = 12,996 inches
        'big_ben': 316 * 12,        # 316 feet = 3,792 inches
    }
    
    bar_travel = {}
    total_distance_inches = 0
    
    for canonical_name, name_list in [('squat', SQUAT_NAMES), ('bench', BENCH_NAMES), 
                                        ('deadlift', DEADLIFT_NAMES), ('ohp', OHP_NAMES)]:
        # Get total reps for this exercise
        cursor.execute(f"""
            SELECT SUM(he.reps) as total_reps
            FROM history_exercises he
            JOIN exercises e ON he.exercise_id = e.id
            WHERE LOWER(e.exercise_name) IN ({','.join(['LOWER(?)'] * len(name_list))})
            AND he.reps > 0
        """, name_list)
        
        row = cursor.fetchone()
        total_reps = row['total_reps'] or 0
        
        distance_per_rep = BAR_TRAVEL_INCHES.get(canonical_name, 0)
        total_inches = total_reps * distance_per_rep
        total_distance_inches += total_inches
        
        # Convert to various units
        total_feet = total_inches / 12
        total_miles = total_feet / 5280
        total_meters = total_inches * 0.0254
        total_km = total_meters / 1000
        
        bar_travel[canonical_name] = {
            'totalReps': total_reps,
            'distancePerRepInches': distance_per_rep,
            'totalInches': round(total_inches, 2),
            'totalFeet': round(total_feet, 2),
            'totalMiles': round(total_miles, 2),
            'totalMeters': round(total_meters, 2),
            'totalKm': round(total_km, 2),
        }
    
    # Calculate totals across all lifts
    total_feet = total_distance_inches / 12
    total_miles = total_feet / 5280
    total_meters = total_distance_inches * 0.0254
    total_km = total_meters / 1000
    
    # Fun landmark comparisons
    everest_climbs = total_distance_inches / LANDMARKS['everest']
    empire_state_climbs = total_distance_inches / LANDMARKS['empire_state']
    eiffel_tower_climbs = total_distance_inches / LANDMARKS['eiffel_tower']
    statue_liberty_climbs = total_distance_inches / LANDMARKS['statue_liberty']
    
    return {
        'byLift': bar_travel,
        'total': {
            'inches': round(total_distance_inches, 2),
            'feet': round(total_feet, 2),
            'miles': round(total_miles, 2),
            'meters': round(total_meters, 2),
            'km': round(total_km, 2),
        },
        'landmarks': {
            'everestClimbs': round(everest_climbs, 2),
            'empireStateClimbs': round(empire_state_climbs, 1),
            'eiffelTowerClimbs': round(eiffel_tower_climbs, 1),
            'statueOfLibertyClimbs': round(statue_liberty_climbs, 1),
        },
        'distancePerRepInches': BAR_TRAVEL_INCHES,
    }

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

    print("Calculating Big 3 estimated 1RM progression...")
    big_three_e1rm = get_big_three_e1rm(conn)

    print("Extracting Big 3 volume history...")
    big_three_volume = get_big_three_volume(conn)

    print("Getting program history...")
    programs = get_programs(conn)

    print("Analyzing workout patterns...")
    workouts_by_day = get_workouts_by_day_of_week(conn)

    print("Finding notable workouts...")
    notable_workouts = get_notable_workouts(conn)

    print("Calculating milestones...")
    milestones = get_milestones(conn, summary)

    print("Calculating plate milestones...")
    plate_milestones = get_plate_milestones(conn)

    print("Calculating powerlifting totals...")
    powerlifting_totals = get_powerlifting_totals(conn)

    print("Extracting all-time PRs...")
    all_time_prs = get_all_time_prs(conn)

    print("Calculating days since last PR...")
    days_since_last_pr = get_days_since_last_pr(conn)

    print("Calculating bar travel statistics...")
    bar_travel_stats = get_bar_travel_stats(conn)

    # Compile all data
    data = {
        'summary': summary,
        'volumeTimeSeries': volume_time_series,
        'workoutCalendar': workout_calendar,
        'exerciseProgress': exercise_progress,
        'bigThreeE1RM': big_three_e1rm,
        'bigThreeVolume': big_three_volume,
        'programs': programs,
        'workoutsByDayOfWeek': workouts_by_day,
        'notableWorkouts': notable_workouts,
        'milestones': milestones,
        'plateMilestones': plate_milestones,
        'powerliftingTotals': {
            'current': powerlifting_totals['current'],
            'peak': powerlifting_totals['peak'],
            'clubMilestones': powerlifting_totals['clubMilestones']
        },
        'allTimePRs': all_time_prs,
        'daysSinceLastPR': days_since_last_pr,
        'barTravel': bar_travel_stats
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

    # Print powerlifting total info
    if powerlifting_totals.get('current'):
        current = powerlifting_totals['current']
        print(f"  - Current Total: {current['totalLbs']:.0f} lbs (S:{current['squatE1rm']:.0f} B:{current['benchE1rm']:.0f} D:{current['deadliftE1rm']:.0f})")

    # Print bar travel info
    if bar_travel_stats:
        print(f"  - Total Bar Travel: {bar_travel_stats['total']['miles']:.1f} miles ({bar_travel_stats['landmarks']['everestClimbs']:.1f}× Mt. Everest)")

    conn.close()

if __name__ == '__main__':
    main()
