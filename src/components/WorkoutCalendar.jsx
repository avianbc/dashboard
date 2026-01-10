import { useState, useMemo } from 'preact/hooks'
import ReactECharts from 'echarts-for-react'
import { formatNumber, formatDate } from '../utils/format'
import styles from './WorkoutCalendar.module.css'

export function WorkoutCalendar({ workoutCalendar }) {
  if (!workoutCalendar) return null

  // Convert object to array format
  const calendarArray = useMemo(() => {
    return Object.entries(workoutCalendar).map(([date, data]) => ({
      date,
      volume: data.volumeLbs,
      workoutCount: data.count
    }))
  }, [workoutCalendar])

  // Extract unique years from the calendar data
  const years = useMemo(() => {
    const yearSet = new Set()
    calendarArray.forEach(entry => {
      const year = new Date(entry.date).getFullYear()
      yearSet.add(year)
    })
    return Array.from(yearSet).sort((a, b) => b - a) // Newest first
  }, [calendarArray])

  const [selectedYear, setSelectedYear] = useState(years[0])

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Workout Consistency</h2>
          <p className={styles.subtitle}>Daily training volume heatmap</p>
        </div>

        {/* Year selector for mobile */}
        <select
          className={styles.yearSelect}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Desktop: Show all years stacked */}
      <div className={styles.desktopView}>
        {years.map(year => (
          <YearHeatmap
            key={year}
            year={year}
            calendarArray={calendarArray}
          />
        ))}
      </div>

      {/* Mobile: Show selected year only */}
      <div className={styles.mobileView}>
        <YearHeatmap
          year={selectedYear}
          calendarArray={calendarArray}
        />
      </div>
    </section>
  )
}

function YearHeatmap({ year, calendarArray }) {
  const { chartData, yearData } = useMemo(() => {
    // Filter data for this year
    const yearData = calendarArray.filter(entry => {
      const entryYear = new Date(entry.date).getFullYear()
      return entryYear === year
    })

    // Calculate percentiles for color buckets
    const volumes = yearData.map(d => d.volume).filter(v => v > 0).sort((a, b) => a - b)
    const percentile25 = volumes[Math.floor(volumes.length * 0.25)] || 0
    const percentile50 = volumes[Math.floor(volumes.length * 0.50)] || 0
    const percentile75 = volumes[Math.floor(volumes.length * 0.75)] || 0

    // Transform to ECharts format: [date, value]
    const data = yearData.map(entry => {
      return [entry.date, entry.volume]
    })

    return {
      chartData: { data, percentile25, percentile50, percentile75 },
      yearData
    }
  }, [year, calendarArray])

  const option = useMemo(() => ({
    tooltip: {
      formatter: (params) => {
        const date = params.data[0]
        const volume = params.data[1]
        const entry = yearData.find(e => e.date === date)

        return `
          <div style="font-size: 14px;">
            <strong>${formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' })}</strong><br/>
            Volume: ${formatNumber(volume)} lbs<br/>
            ${entry?.workoutCount ? `Workouts: ${entry.workoutCount}` : 'Rest day'}
          </div>
        `
      }
    },
    visualMap: {
      show: false,
      min: 0,
      max: chartData.percentile75 * 1.2, // Extend max slightly beyond 75th percentile
      type: 'piecewise',
      pieces: [
        { min: 0, max: 0, color: '#ebedf0' }, // No workout - light gray
        { min: 0.01, max: chartData.percentile25, color: '#c6e48b' }, // 0-25%
        { min: chartData.percentile25, max: chartData.percentile50, color: '#7bc96f' }, // 25-50%
        { min: chartData.percentile50, max: chartData.percentile75, color: '#239a3b' }, // 50-75%
        { min: chartData.percentile75, color: '#196127' } // 75%+
      ],
      orient: 'horizontal',
      left: 'center',
      bottom: 10
    },
    calendar: {
      top: 60,
      left: 40,
      right: 30,
      cellSize: ['auto', 13],
      range: year,
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff'
      },
      yearLabel: { show: false },
      monthLabel: {
        nameMap: 'en',
        fontSize: 11
      },
      dayLabel: {
        nameMap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        fontSize: 11
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#eee',
          width: 2,
          type: 'solid'
        }
      }
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: chartData.data
      }
    ]
  }), [year, chartData, yearData])

  return (
    <div className={styles.yearCard}>
      <h3 className={styles.yearTitle}>{year}</h3>
      <ReactECharts
        option={option}
        style={{ height: '200px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
