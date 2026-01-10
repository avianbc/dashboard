import { useMemo } from 'preact/hooks'
import { unit } from '../state/settings'
import { formatNumber } from '../utils/format'
import styles from './TrainingPrograms.module.css'

export function TrainingPrograms({ programs }) {
  const currentUnit = unit.value

  // Sort programs by start date (oldest first) and add year markers
  const sortedPrograms = useMemo(() => {
    if (!programs) return []

    const sorted = [...programs].sort((a, b) =>
      new Date(a.startDate) - new Date(b.startDate)
    )

    // Add year markers
    const withYearMarkers = []
    let lastYear = null

    sorted.forEach(program => {
      const year = new Date(program.startDate).getFullYear()
      if (year !== lastYear) {
        withYearMarkers.push({ type: 'year', year })
        lastYear = year
      }
      withYearMarkers.push({ type: 'program', ...program })
    })

    return withYearMarkers
  }, [programs])

  // Format date range
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    }

    // Calculate duration in months
    const months = (end.getFullYear() - start.getFullYear()) * 12 +
                   (end.getMonth() - start.getMonth())

    let duration = ''
    if (months === 0) {
      // Calculate days
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      duration = `${days} ${days === 1 ? 'day' : 'days'}`
    } else {
      duration = `${months} ${months === 1 ? 'month' : 'months'}`
    }

    return {
      range: `${formatDate(start)} - ${formatDate(end)}`,
      duration
    }
  }

  if (!programs || programs.length === 0) {
    return (
      <section className={styles.trainingPrograms}>
        <h2>Training Programs</h2>
        <p>No training program data available</p>
      </section>
    )
  }

  return (
    <section className={styles.trainingPrograms}>
      <div className={styles.header}>
        <h2>Training Programs</h2>
        <p className={styles.subtitle}>
          {programs.length} programs over {new Date().getFullYear() - new Date(programs[0].startDate).getFullYear()} years
        </p>
      </div>

      <div className={styles.timeline}>
        {sortedPrograms.map((item, index) => {
          if (item.type === 'year') {
            return (
              <div key={`year-${item.year}`} className={styles.yearMarker}>
                <div className={styles.yearLine}></div>
                <div className={styles.yearLabel}>{item.year}</div>
              </div>
            )
          }

          const { range, duration } = formatDateRange(item.startDate, item.endDate)
          const volume = currentUnit === 'imperial' ? item.totalVolumeLbs : item.totalVolumeKg
          const unitLabel = currentUnit === 'imperial' ? 'lbs' : 'kg'

          return (
            <div key={`program-${item.name}-${item.startDate}`} className={styles.programCard}>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.programName}>{item.name}</h3>
                  <span className={styles.duration}>{duration}</span>
                </div>

                <p className={styles.dateRange}>{range}</p>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Workouts</span>
                    <span className={styles.statValue}>{item.workouts}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>PRs Set</span>
                    <span className={styles.statValue}>{item.prsSet}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Total Volume</span>
                    <span className={styles.statValue}>
                      {formatNumber(volume)} {unitLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
