import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import ReactECharts from 'echarts-for-react';
import { unit, theme } from '../state/settings';
import styles from './StrengthProgressionCharts.module.css';

const LIFT_CONFIG = {
  squat: { name: 'Squat', color: '#2563eb', colorDark: '#60a5fa' },
  bench: { name: 'Bench Press', color: '#dc2626', colorDark: '#f87171' },
  deadlift: { name: 'Deadlift', color: '#16a34a', colorDark: '#4ade80' },
  ohp: { name: 'Overhead Press', color: '#9333ea', colorDark: '#c084fc' }
};

const MILESTONES = [500, 750, 1000, 1100, 1200];

// Calculate rolling average
function calculateRollingAverage(data, windowDays = 30) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const currentDate = new Date(data[i].date);
    const windowStart = new Date(currentDate);
    windowStart.setDate(windowStart.getDate() - windowDays);

    const windowData = data.filter(d => {
      const date = new Date(d.date);
      return date >= windowStart && date <= currentDate;
    });

    if (windowData.length > 0) {
      const avg = windowData.reduce((sum, d) => sum + d.e1rm, 0) / windowData.length;
      result.push({ date: data[i].date, e1rm: avg });
    }
  }
  return result;
}

// Calculate running PR (monotonically increasing)
function calculateRunningPR(data) {
  const result = [];
  let maxE1rm = 0;

  for (const point of data) {
    if (point.e1rm > maxE1rm) {
      maxE1rm = point.e1rm;
      result.push({ date: point.date, e1rm: maxE1rm });
    }
  }

  return result;
}

function LiftChart({ lift, data, showRunningPR, isDark }) {
  const config = LIFT_CONFIG[lift];
  const isMetric = unit.value === 'metric';
  const color = isDark ? config.colorDark : config.color;

  const chartData = useMemo(() => {
    // Convert data to array format with selected unit
    const points = data.map(d => ({
      date: d.date,
      e1rm: isMetric ? d.e1rmKg : d.e1rmLbs
    }));

    if (showRunningPR) {
      return calculateRunningPR(points);
    } else {
      return points;
    }
  }, [data, isMetric, showRunningPR]);

  const rollingAvg = useMemo(() => {
    if (showRunningPR) return [];
    const points = data.map(d => ({
      date: d.date,
      e1rm: isMetric ? d.e1rmKg : d.e1rmLbs
    }));
    return calculateRollingAverage(points, 30);
  }, [data, isMetric, showRunningPR]);

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '12%',
      right: '4%',
      top: '15%',
      bottom: '15%'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const date = new Date(params[0].value[0]).toLocaleDateString();
        let content = `<strong>${date}</strong><br/>`;
        params.forEach(param => {
          content += `${param.seriesName}: ${param.value[1].toFixed(1)} ${isMetric ? 'kg' : 'lbs'}<br/>`;
        });
        return content;
      }
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: isDark ? '#666' : '#ccc' } },
      axisLabel: { color: isDark ? '#a0a0a0' : '#666' },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: isMetric ? 'kg' : 'lbs',
      nameTextStyle: { color: isDark ? '#a0a0a0' : '#666' },
      axisLine: { lineStyle: { color: isDark ? '#666' : '#ccc' } },
      axisLabel: { color: isDark ? '#a0a0a0' : '#666' },
      splitLine: { lineStyle: { color: isDark ? '#333' : '#f0f0f0' } }
    },
    series: [
      // Raw data points (if not showing running PR)
      ...(!showRunningPR ? [{
        name: 'Raw E1RM',
        type: 'scatter',
        data: chartData.map(d => [d.date, d.e1rm]),
        symbolSize: 4,
        itemStyle: {
          color: color,
          opacity: 0.3
        },
        emphasis: {
          itemStyle: { opacity: 0.6 }
        }
      }] : []),
      // Rolling average (if not showing running PR)
      ...(rollingAvg.length > 0 ? [{
        name: '30-Day Average',
        type: 'line',
        data: rollingAvg.map(d => [d.date, d.e1rm]),
        smooth: true,
        lineStyle: {
          color: color,
          width: 2
        },
        itemStyle: { color: color },
        showSymbol: false
      }] : []),
      // Running PR or main line
      ...(showRunningPR ? [{
        name: 'Running PR',
        type: 'line',
        data: chartData.map(d => [d.date, d.e1rm]),
        lineStyle: {
          color: color,
          width: 3
        },
        itemStyle: { color: color },
        symbol: 'circle',
        symbolSize: 6,
        step: 'end' // Step chart for PR progression
      }] : [])
    ]
  };

  return (
    <div className={styles.liftChart}>
      <h3 className={styles.liftTitle}>{config.name}</h3>
      <ReactECharts option={option} style={{ height: '250px', width: '100%' }} />
    </div>
  );
}

function PowerliftingTotalChart({ squatData, benchData, deadliftData, isDark }) {
  const isMetric = unit.value === 'metric';

  const totalHistory = useMemo(() => {
    // Merge all three lifts by date
    const dateMap = new Map();

    [squatData, benchData, deadliftData].forEach((liftData, idx) => {
      liftData.forEach(point => {
        const key = point.date;
        if (!dateMap.has(key)) {
          dateMap.set(key, { date: key, squat: 0, bench: 0, deadlift: 0 });
        }
        const entry = dateMap.get(key);
        if (idx === 0) entry.squat = isMetric ? point.e1rmKg : point.e1rmLbs;
        if (idx === 1) entry.bench = isMetric ? point.e1rmKg : point.e1rmLbs;
        if (idx === 2) entry.deadlift = isMetric ? point.e1rmKg : point.e1rmLbs;
      });
    });

    // Calculate running max for each lift
    const sortedDates = Array.from(dateMap.keys()).sort();
    let maxSquat = 0, maxBench = 0, maxDeadlift = 0;
    const result = [];

    sortedDates.forEach(date => {
      const entry = dateMap.get(date);
      maxSquat = Math.max(maxSquat, entry.squat);
      maxBench = Math.max(maxBench, entry.bench);
      maxDeadlift = Math.max(maxDeadlift, entry.deadlift);
      result.push({
        date,
        total: maxSquat + maxBench + maxDeadlift
      });
    });

    return result;
  }, [squatData, benchData, deadliftData, isMetric]);

  const peakTotal = useMemo(() => {
    return Math.max(...totalHistory.map(d => d.total));
  }, [totalHistory]);

  const peakDate = useMemo(() => {
    const peak = totalHistory.find(d => d.total === peakTotal);
    return peak ? peak.date : null;
  }, [totalHistory, peakTotal]);

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '12%',
      right: '4%',
      top: '15%',
      bottom: '15%'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const date = new Date(params[0].value[0]).toLocaleDateString();
        const value = params[0].value[1].toFixed(1);
        return `<strong>${date}</strong><br/>Total: ${value} ${isMetric ? 'kg' : 'lbs'}`;
      }
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: isDark ? '#666' : '#ccc' } },
      axisLabel: { color: isDark ? '#a0a0a0' : '#666' },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: isMetric ? 'kg' : 'lbs',
      nameTextStyle: { color: isDark ? '#a0a0a0' : '#666' },
      axisLine: { lineStyle: { color: isDark ? '#666' : '#ccc' } },
      axisLabel: { color: isDark ? '#a0a0a0' : '#666' },
      splitLine: { lineStyle: { color: isDark ? '#333' : '#f0f0f0' } }
    },
    series: [
      {
        name: 'Powerlifting Total',
        type: 'line',
        data: totalHistory.map(d => [d.date, d.total]),
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(245, 158, 11, 0.3)' },
              { offset: 1, color: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(245, 158, 11, 0.05)' }
            ]
          }
        },
        lineStyle: {
          color: isDark ? '#fbbf24' : '#f59e0b',
          width: 3
        },
        itemStyle: {
          color: isDark ? '#fbbf24' : '#f59e0b'
        },
        smooth: true,
        showSymbol: false,
        // Mark peak
        markPoint: {
          data: [
            {
              coord: [peakDate, peakTotal],
              value: `Peak: ${peakTotal.toFixed(0)}`,
              itemStyle: { color: isDark ? '#fbbf24' : '#f59e0b' }
            }
          ],
          label: {
            show: true,
            formatter: '{c}',
            color: isDark ? '#e0e0e0' : '#212121'
          }
        },
        // Milestone lines (only show relevant ones in imperial)
        markLine: !isMetric ? {
          silent: true,
          symbol: 'none',
          lineStyle: {
            type: 'dashed',
            color: isDark ? '#666' : '#999',
            width: 1
          },
          label: {
            position: 'end',
            formatter: '{c} lb club',
            color: isDark ? '#a0a0a0' : '#666',
            fontSize: 11
          },
          data: MILESTONES.filter(m => m <= peakTotal + 100).map(milestone => ({
            yAxis: milestone
          }))
        } : undefined
      }
    ]
  };

  return (
    <div className={styles.totalChart}>
      <h3 className={styles.chartTitle}>Powerlifting Total Progression</h3>
      <ReactECharts option={option} style={{ height: '350px', width: '100%' }} />
    </div>
  );
}

export default function StrengthProgressionCharts({ data }) {
  const [showRunningPR, setShowRunningPR] = useState(true);
  const isDark = theme.value === 'dark' ||
                 (theme.value === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!data?.bigThreeE1RM) {
    return (
      <section className={styles.section}>
        <h2>Strength Progression</h2>
        <p>No strength data available.</p>
      </section>
    );
  }

  const { squat, bench, deadlift, ohp } = data.bigThreeE1RM;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Strength Progression</h2>
        <div className={styles.controls}>
          <button
            className={`${styles.toggleButton} ${showRunningPR ? styles.active : ''}`}
            onClick={() => setShowRunningPR(true)}
          >
            Running PR
          </button>
          <button
            className={`${styles.toggleButton} ${!showRunningPR ? styles.active : ''}`}
            onClick={() => setShowRunningPR(false)}
          >
            Raw E1RM
          </button>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <LiftChart lift="squat" data={squat.e1rmHistory} showRunningPR={showRunningPR} isDark={isDark} />
        <LiftChart lift="bench" data={bench.e1rmHistory} showRunningPR={showRunningPR} isDark={isDark} />
        <LiftChart lift="deadlift" data={deadlift.e1rmHistory} showRunningPR={showRunningPR} isDark={isDark} />
        <LiftChart lift="ohp" data={ohp.e1rmHistory} showRunningPR={showRunningPR} isDark={isDark} />
      </div>

      <PowerliftingTotalChart
        squatData={squat.e1rmHistory}
        benchData={bench.e1rmHistory}
        deadliftData={deadlift.e1rmHistory}
        isDark={isDark}
      />
    </section>
  );
}
