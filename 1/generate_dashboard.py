#!/usr/bin/env python3
"""
Fitness Data Dashboard Generator
Extracts data from MyApp.db SQLite database and generates JSON for visualization.

Usage:
    python generate_dashboard.py
    python generate_dashboard.py --db path/to/database.db
"""

import sqlite3
import json
import argparse
from datetime import datetime
from collections import defaultdict


def convert_timestamp(ts):
    """Convert Unix timestamp (milliseconds) to ISO date string."""
    if ts:
        return datetime.fromtimestamp(ts / 1000).strftime('%Y-%m-%d')
    return None


def get_progression_data(conn):
    """Extract exercise progression data for main lifts."""
    query = """
    SELECT
        h.date,
        e.exercise_name,
        he.weightkg,
        he.reps,
        he.set_number
    FROM history_exercises he
    JOIN exercises e ON he.exercise_id = e.id
    JOIN history h ON he.history_id = h.id
    WHERE e.exercise_name IN ('Squat', 'Bench Press', 'Deadlift', 'Overhead Press')
        AND he.weightkg > 0
        AND he.reps > 0
    ORDER BY h.date, e.exercise_name, he.set_number
    """

    cursor = conn.execute(query)
    data = defaultdict(list)

    for row in cursor:
        date, exercise, weight, reps, set_num = row
        date_str = convert_timestamp(date)

        # Calculate estimated 1RM using Epley formula
        estimated_1rm = round(weight * (1 + reps / 30.0), 1)

        data[exercise].append({
            'date': date_str,
            'weight': weight,
            'reps': reps,
            'setNumber': set_num,
            'estimated1RM': estimated_1rm
        })

    return dict(data)


def get_workout_calendar(conn):
    """Extract workout calendar data."""
    query = """
    SELECT
        date,
        duration,
        program_id,
        day_name
    FROM history
    ORDER BY date
    """

    cursor = conn.execute(query)
    calendar = []

    for row in cursor:
        date, duration, program_id, day_name = row
        calendar.append({
            'date': convert_timestamp(date),
            'duration': duration or 0,
            'programId': program_id,
            'dayName': day_name
        })

    return calendar


def get_program_timeline(conn):
    """Extract program usage timeline with statistics."""
    query = """
    SELECT
        p.id,
        p.routine,
        MIN(h.date) as first_workout,
        MAX(h.date) as last_workout,
        COUNT(h.id) as total_workouts,
        ROUND(AVG(h.duration)) as avg_duration
    FROM history h
    JOIN programs p ON h.program_id = p.id
    GROUP BY h.program_id
    ORDER BY MIN(h.date)
    """

    cursor = conn.execute(query)
    timeline = []

    for row in cursor:
        prog_id, name, first, last, workouts, avg_dur = row

        # Get volume for this program
        volume_query = """
        SELECT SUM(he.weightkg * he.reps) as total_volume
        FROM history h
        JOIN history_exercises he ON h.id = he.history_id
        WHERE h.program_id = ?
            AND he.weightkg > 0
            AND he.reps > 0
        """
        volume_result = conn.execute(volume_query, (prog_id,)).fetchone()
        total_volume = volume_result[0] or 0

        timeline.append({
            'id': prog_id,
            'name': name,
            'start': convert_timestamp(first),
            'end': convert_timestamp(last),
            'workouts': workouts,
            'avgDuration': avg_dur or 0,
            'totalVolume': round(total_volume, 1)
        })

    return timeline


def get_exercise_stats(conn):
    """Get statistics for all exercises."""
    query = """
    SELECT
        e.exercise_name,
        COUNT(he.id) as total_sets,
        SUM(he.weightkg * he.reps) as total_volume,
        MAX(he.weightkg) as max_weight,
        AVG(he.weightkg) as avg_weight
    FROM history_exercises he
    JOIN exercises e ON he.exercise_id = e.id
    WHERE he.weightkg > 0 AND he.reps > 0
    GROUP BY he.exercise_id
    ORDER BY total_volume DESC
    """

    cursor = conn.execute(query)
    stats = []

    for row in cursor:
        name, sets, volume, max_w, avg_w = row
        stats.append({
            'exercise': name,
            'totalSets': sets,
            'totalVolume': round(volume, 1),
            'maxWeight': max_w,
            'avgWeight': round(avg_w, 1)
        })

    return stats


def get_body_weight(conn):
    """Extract body weight measurements."""
    query = """
    SELECT date, weightkg
    FROM body_weight
    ORDER BY date
    """

    cursor = conn.execute(query)
    weights = []

    for row in cursor:
        date, weight = row
        weights.append({
            'date': convert_timestamp(date),
            'weightKg': round(weight, 1)
        })

    return weights


def get_daily_frequency(conn):
    """Get workout frequency by day of week."""
    query = """
    SELECT
        CASE CAST(strftime('%w', datetime(date/1000, 'unixepoch')) AS INTEGER)
            WHEN 0 THEN 'Sunday'
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
        END as day_name,
        COUNT(*) as count
    FROM history
    GROUP BY strftime('%w', datetime(date/1000, 'unixepoch'))
    ORDER BY CAST(strftime('%w', datetime(date/1000, 'unixepoch')) AS INTEGER)
    """

    cursor = conn.execute(query)
    frequency = {}

    for row in cursor:
        day, count = row
        frequency[day] = count

    return frequency


def get_monthly_stats(conn):
    """Get monthly workout statistics."""
    query = """
    SELECT
        strftime('%Y-%m', datetime(date/1000, 'unixepoch')) as month,
        COUNT(*) as workouts,
        SUM(duration) as total_duration
    FROM history
    GROUP BY month
    ORDER BY month
    """

    cursor = conn.execute(query)
    stats = []

    for row in cursor:
        month, workouts, duration = row
        stats.append({
            'month': month,
            'workouts': workouts,
            'totalDuration': duration or 0
        })

    return stats


def get_program_comparison(conn):
    """Get detailed program comparison data."""
    query = """
    SELECT
        p.routine,
        COUNT(h.id) as workouts,
        COUNT(DISTINCT he.exercise_id) as unique_exercises,
        SUM(he.weightkg * he.reps) as total_volume,
        COUNT(he.id) as total_sets,
        ROUND(AVG(h.duration)) as avg_duration
    FROM history h
    JOIN programs p ON h.program_id = p.id
    JOIN history_exercises he ON h.id = he.history_id
    WHERE he.weightkg > 0 AND he.reps > 0
    GROUP BY p.id
    ORDER BY total_volume DESC
    """

    cursor = conn.execute(query)
    comparison = []

    for row in cursor:
        name, workouts, exercises, volume, sets, avg_dur = row
        comparison.append({
            'program': name,
            'workouts': workouts,
            'uniqueExercises': exercises,
            'totalVolume': round(volume, 1),
            'totalSets': sets,
            'avgDuration': avg_dur or 0,
            'volumePerWorkout': round(volume / workouts, 1) if workouts > 0 else 0
        })

    return comparison


def get_personal_records(conn):
    """Calculate personal records for main exercises."""
    exercises = ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press']
    records = {}

    for exercise in exercises:
        query = """
        SELECT
            h.date,
            MAX(he.weightkg * (1 + he.reps / 30.0)) as best_estimated_1rm,
            he.weightkg,
            he.reps
        FROM history_exercises he
        JOIN exercises e ON he.exercise_id = e.id
        JOIN history h ON he.history_id = h.id
        WHERE e.exercise_name = ?
            AND he.weightkg > 0
            AND he.reps > 0
        GROUP BY h.date
        ORDER BY best_estimated_1rm DESC
        LIMIT 1
        """

        result = conn.execute(query, (exercise,)).fetchone()
        if result:
            date, est_1rm, weight, reps = result
            records[exercise] = {
                'date': convert_timestamp(date),
                'estimated1RM': round(est_1rm, 1),
                'weight': weight,
                'reps': reps
            }

    return records


def get_metadata(conn):
    """Get overall database metadata."""
    queries = {
        'totalWorkouts': 'SELECT COUNT(*) FROM history',
        'totalSets': 'SELECT COUNT(*) FROM history_exercises',
        'totalVolume': 'SELECT SUM(weightkg * reps) FROM history_exercises WHERE weightkg > 0 AND reps > 0',
        'uniqueExercises': 'SELECT COUNT(DISTINCT exercise_id) FROM history_exercises',
        'dateRangeStart': 'SELECT MIN(date) FROM history',
        'dateRangeEnd': 'SELECT MAX(date) FROM history'
    }

    metadata = {
        'generated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

    for key, query in queries.items():
        result = conn.execute(query).fetchone()[0]
        if key.startswith('dateRange'):
            metadata[key] = convert_timestamp(result)
        elif key == 'totalVolume':
            metadata[key] = round(result, 1) if result else 0
        else:
            metadata[key] = result or 0

    return metadata


def generate_dashboard_data(db_path):
    """Main function to generate all dashboard data."""
    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)

    print("Extracting data...")
    data = {
        'metadata': get_metadata(conn),
        'progressionData': get_progression_data(conn),
        'workoutCalendar': get_workout_calendar(conn),
        'programTimeline': get_program_timeline(conn),
        'exerciseStats': get_exercise_stats(conn),
        'bodyWeight': get_body_weight(conn),
        'dailyFrequency': get_daily_frequency(conn),
        'monthlyStats': get_monthly_stats(conn),
        'programComparison': get_program_comparison(conn),
        'personalRecords': get_personal_records(conn)
    }

    conn.close()

    return data


def main():
    parser = argparse.ArgumentParser(description='Generate fitness dashboard data from SQLite database')
    parser.add_argument('--db', default='MyApp.db', help='Path to SQLite database (default: MyApp.db)')
    parser.add_argument('--output', default='workout_data.json', help='Output JSON file (default: workout_data.json)')

    args = parser.parse_args()

    try:
        data = generate_dashboard_data(args.db)

        print(f"Writing data to {args.output}...")
        with open(args.output, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"\nSuccess! Dashboard data generated.")
        print(f"  Total workouts: {data['metadata']['totalWorkouts']}")
        print(f"  Total sets: {data['metadata']['totalSets']}")
        print(f"  Date range: {data['metadata']['dateRangeStart']} to {data['metadata']['dateRangeEnd']}")
        print(f"  Total volume: {data['metadata']['totalVolume']:,.0f} kg")
        print(f"\nNow open dashboard.html in your browser to view visualizations.")

    except Exception as e:
        print(f"Error: {e}")
        return 1

    return 0


if __name__ == '__main__':
    exit(main())
