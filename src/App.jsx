import { useState, useEffect } from 'preact/hooks'
import { Layout } from './components/Layout'
import { HeroSection } from './components/HeroSection'
import { WorkoutCalendar } from './components/WorkoutCalendar'
import StrengthProgressionCharts from './components/StrengthProgressionCharts'
import { PlateMilestones } from './components/PlateMilestones'
import { loadTrainingData } from './utils/data'
import styles from './App.module.css'

export function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTrainingData()
      .then((trainingData) => {
        setData(trainingData)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading workout data...</p>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.error}>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <HeroSection summary={data.summary} barTravel={data.barTravel} />

      <WorkoutCalendar workoutCalendar={data.workoutCalendar} />

      <StrengthProgressionCharts data={data} />

      <PlateMilestones plateMilestones={data.plateMilestones} />

      <div className={styles.placeholder}>
        <p>More sections coming soon...</p>
      </div>
    </Layout>
  )
}
