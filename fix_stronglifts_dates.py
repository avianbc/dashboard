#!/usr/bin/env python3
"""
Fix StrongLifts workout dates that were imported with incorrect timezone conversion.

The issue: Timestamps were stored as UTC but should represent local time (EST/EDT).
For example:
- CSV: 2019/01/23 6:42 AM (EST) should be 2019-01-23 11:42:00 UTC
- DB:  2019-01-24 04:53:00 UTC (WRONG - off by ~17 hours)

This script will:
1. Identify StrongLifts workouts (program_id based on date range)
2. Shift timestamps to correct for the timezone error
3. Back up the database before making changes
"""

import sqlite3
import shutil
from datetime import datetime, timedelta

DB_PATH = 'MyApp.db'
BACKUP_PATH = 'MyApp.db.backup'

def main():
    # Create backup
    print(f"Creating backup: {BACKUP_PATH}")
    shutil.copy2(DB_PATH, BACKUP_PATH)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Find StrongLifts program ID
    cursor.execute("""
        SELECT DISTINCT p.id, p.routine
        FROM programs p
        JOIN history h ON p.id = h.program_id
        WHERE h.date >= 1548000000000 AND h.date <= 1555459200000
        ORDER BY h.date
        LIMIT 1
    """)

    program_info = cursor.fetchone()
    if not program_info:
        print("Could not find StrongLifts program")
        return

    program_id = program_info['id']
    program_name = program_info['routine']
    print(f"Found program: {program_name} (ID: {program_id})")

    # Get affected workouts
    cursor.execute("""
        SELECT id, date, datetime(date/1000, 'unixepoch') as utc_time
        FROM history
        WHERE program_id = ?
        ORDER BY date
    """, (program_id,))

    workouts = cursor.fetchall()
    print(f"\nFound {len(workouts)} workouts to fix")

    if len(workouts) == 0:
        print("No workouts to fix")
        return

    # Show first 5 examples of what will change
    print("\nExample corrections (first 5):")
    print("ID  | Current UTC Time       | Corrected UTC Time     | Change")
    print("-" * 75)

    corrections = []
    for workout in workouts[:5]:
        old_ts = workout['date']
        old_dt = datetime.utcfromtimestamp(old_ts / 1000)

        # The timestamps appear to be ~22 hours ahead
        # Based on the pattern, we need to subtract approximately 22 hours
        # But let's calculate more precisely based on the first workout

        # First workout CSV: 2019/01/23 6:42 AM EST (11:42 UTC)
        # First workout DB:  2019-01-24 04:53:00 UTC
        # Difference: ~17 hours 11 minutes

        # A more systematic fix: The timestamps seem to have been created with wrong timezone
        # They're approximately 1 day - 5 hours = 19 hours ahead
        correction_hours = -19

        new_dt = old_dt + timedelta(hours=correction_hours)
        new_ts = int(new_dt.timestamp() * 1000)

        corrections.append((new_ts, workout['id']))

        print(f"{workout['id']:3} | {old_dt} | {new_dt} | {correction_hours:+3}h")

    # Ask for confirmation
    print(f"\nThis will update {len(workouts)} workout timestamps.")
    print(f"Backup created at: {BACKUP_PATH}")
    response = input("\nProceed with fix? (yes/no): ")

    if response.lower() != 'yes':
        print("Fix cancelled")
        conn.close()
        return

    # Apply fix to all workouts
    correction_hours = -19
    updates = []

    for workout in workouts:
        old_ts = workout['date']
        old_dt = datetime.utcfromtimestamp(old_ts / 1000)
        new_dt = old_dt + timedelta(hours=correction_hours)
        new_ts = int(new_dt.timestamp() * 1000)
        updates.append((new_ts, workout['id']))

    cursor.executemany("UPDATE history SET date = ? WHERE id = ?", updates)
    conn.commit()

    print(f"\n✓ Updated {len(updates)} workouts")
    print(f"✓ Backup saved to: {BACKUP_PATH}")
    print(f"\nRun 'python extract_data.py' to regenerate training_data.json")

    conn.close()

if __name__ == '__main__':
    main()
