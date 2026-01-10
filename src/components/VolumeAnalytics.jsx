import { useState, useMemo } from 'preact/hooks'
import ReactECharts from 'echarts-for-react'
import { unit } from '../state/settings'
import { formatNumber } from '../utils/format'
import styles from './VolumeAnalytics.module.css'

export function VolumeAnalytics({ volumeTimeSeries, workoutsByDayOfWeek }) {
  const [showAllMonths, setShowAllMonths] = useState(false)
  const currentUnit = unit.value

  // Calculate 3-month rolling average
  const calculateRollingAverage = (data, windowSize = 3) => {
    const result = []
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1)
      const window = data.slice(start, i + 1)
      const avg = window.reduce((sum, item) => sum + (currentUnit === 'imperial' ? item.volumeLbs : item.volumeKg), 0) / window.length
      result.push(avg)
    }
    return result
  }

  // Filter monthly data to last 2 years if showAllMonths is false
  const filteredMonthlyData = useMemo(() => {
    if (showAllMonths || !volumeTimeSeries?.monthly) {
      return volumeTimeSeries?.monthly || []
    }
    // Get last 24 months
    return volumeTimeSeries.monthly.slice(-24)
  }, [volumeTimeSeries, showAllMonths])

  // Find best month
  const bestMonth = useMemo(() => {
    if (!filteredMonthlyData.length) return null
    return filteredMonthlyData.reduce((max, item) => {
      const volume = currentUnit === 'imperial' ? item.volumeLbs : item.volumeKg
      const maxVolume = currentUnit === 'imperial' ? max.volumeLbs : max.volumeKg
      return volume > maxVolume ? item : max
    })
  }, [filteredMonthlyData, currentUnit])

  // Calculate rolling average
  const rollingAverage = useMemo(() => {
    return calculateRollingAverage(filteredMonthlyData)
  }, [filteredMonthlyData, currentUnit])

  // Monthly volume chart options
  const monthlyVolumeOptions = useMemo(() => {
    if (!filteredMonthlyData.length) return {}

    const months = filteredMonthlyData.map(d => d.month)
    const volumes = filteredMonthlyData.map(d => currentUnit === 'imperial' ? d.volumeLbs : d.volumeKg)
    const unitLabel = currentUnit === 'imperial' ? 'lbs' : 'kg'
    const bestMonthIndex = filteredMonthlyData.findIndex(d => d.month === bestMonth?.month)

    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: (params) => {
          const dataIndex = params[0].dataIndex
          const item = filteredMonthlyData[dataIndex]
          const volume = currentUnit === 'imperial' ? item.volumeLbs : item.volumeKg
          return `
            <strong>${item.month}</strong><br/>
            Volume: ${formatNumber(volume)} ${unitLabel}<br/>
            Workouts: ${item.workouts}<br/>
            ${params[1] ? `3-mo avg: ${formatNumber(params[1].data)} ${unitLabel}` : ''}
          `
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        boundaryGap: false,
        axisLabel: {
          rotate: 45,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        name: `Volume (${unitLabel})`,
        axisLabel: {
          formatter: (value) => formatNumber(value)
        }
      },
      series: [
        {
          name: 'Monthly Volume',
          type: 'line',
          data: volumes,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(37, 99, 235, 0.5)' },
                { offset: 1, color: 'rgba(37, 99, 235, 0.1)' }
              ]
            }
          },
          lineStyle: {
            color: '#2563eb',
            width: 2
          },
          itemStyle: {
            color: '#2563eb'
          },
          markPoint: bestMonthIndex >= 0 ? {
            data: [
              {
                name: 'Best Month',
                coord: [bestMonthIndex, volumes[bestMonthIndex]],
                value: formatNumber(volumes[bestMonthIndex]),
                itemStyle: {
                  color: '#f59e0b'
                },
                label: {
                  show: true,
                  formatter: 'Best\n{c} ' + unitLabel,
                  position: 'top',
                  fontSize: 11,
                  fontWeight: 'bold'
                }
              }
            ]
          } : undefined
        },
        {
          name: '3-Month Avg',
          type: 'line',
          data: rollingAverage,
          lineStyle: {
            color: '#f59e0b',
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: '#f59e0b'
          },
          showSymbol: false
        }
      ]
    }
  }, [filteredMonthlyData, currentUnit, bestMonth, rollingAverage])

  // Workouts by day of week chart
  const dayOfWeekOptions = useMemo(() => {
    if (!workoutsByDayOfWeek) return {}

    // Convert to array and sort by count (descending)
    const dayData = Object.entries(workoutsByDayOfWeek)
      .map(([day, data]) => ({
        day,
        count: data.count,
        avgVolume: currentUnit === 'imperial' ? data.avgVolumeLbs : data.avgVolumeKg
      }))
      .sort((a, b) => b.count - a.count)

    const mostActiveDay = dayData[0]
    const unitLabel = currentUnit === 'imperial' ? 'lbs' : 'kg'

    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params) => {
          const dataIndex = params[0].dataIndex
          const item = dayData[dataIndex]
          return `
            <strong>${item.day}</strong><br/>
            Workouts: ${item.count}<br/>
            Avg Volume: ${formatNumber(item.avgVolume)} ${unitLabel}
          `
        }
      },
      grid: {
        left: '15%',
        right: '8%',
        bottom: '3%',
        top: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value) => formatNumber(value)
        }
      },
      yAxis: {
        type: 'category',
        data: dayData.map(d => d.day),
        axisLabel: {
          fontSize: 12
        }
      },
      series: [
        {
          name: 'Workout Count',
          type: 'bar',
          data: dayData.map(d => d.count),
          itemStyle: {
            color: '#2563eb'
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c} workouts',
            fontSize: 11
          },
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              show: false
            },
            lineStyle: {
              color: '#f59e0b',
              type: 'dashed',
              width: 2
            }
          }
        }
      ]
    }
  }, [workoutsByDayOfWeek, currentUnit])

  // Get most active day info
  const mostActiveDayInfo = useMemo(() => {
    if (!workoutsByDayOfWeek) return null
    const dayData = Object.entries(workoutsByDayOfWeek)
      .map(([day, data]) => ({ day, count: data.count }))
      .sort((a, b) => b.count - a.count)
    return dayData[0]
  }, [workoutsByDayOfWeek])

  if (!volumeTimeSeries || !workoutsByDayOfWeek) {
    return (
      <section className={styles.volumeAnalytics}>
        <h2>Volume Analytics</h2>
        <p>No volume data available</p>
      </section>
    )
  }

  return (
    <section className={styles.volumeAnalytics}>
      <h2>Volume Analytics</h2>

      {/* Monthly Volume Trend */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Monthly Volume Trend</h3>
            <p className={styles.subtitle}>
              Total volume lifted per month with 3-month rolling average
            </p>
          </div>
          <button
            className={styles.toggleButton}
            onClick={() => setShowAllMonths(!showAllMonths)}
          >
            {showAllMonths ? 'Show Last 2 Years' : 'Show All Time'}
          </button>
        </div>
        <div className={styles.chartContainer}>
          <ReactECharts
            option={monthlyVolumeOptions}
            style={{ height: '400px', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>

      {/* Workouts by Day of Week */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Workouts by Day of Week</h3>
            <p className={styles.subtitle}>
              Most active: <strong>{mostActiveDayInfo?.day}</strong> ({mostActiveDayInfo?.count} workouts)
            </p>
          </div>
        </div>
        <div className={styles.chartContainer}>
          <ReactECharts
            option={dayOfWeekOptions}
            style={{ height: '350px', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>
    </section>
  )
}
