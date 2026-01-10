import { useEffect, useRef, useState } from 'preact/hooks'
import { isMetric } from '../state/settings'
import { formatNumber, formatWeight, formatDistance, calculateDuration } from '../utils/format'
import styles from './HeroSection.module.css'

export function HeroSection({ summary, barTravel }) {
  if (!summary) return null

  const totalVolumeLbs = summary.totalVolumeLbs || 0
  const totalVolumeTons = Math.round(totalVolumeLbs / 2000)
  const totalWorkouts = summary.totalWorkouts || 0
  const hoursInGym = Math.round(summary.totalHours || 0)
  const barTravelMiles = barTravel?.total?.miles || 0

  return (
    <section className={styles.hero}>
      <div className={styles.grid}>
        <StatCard
          value={totalVolumeTons}
          unit="tons"
          label="Total Volume Lifted"
          context="2,000+ Honda Civics"
          large
        />
        <StatCard
          value={totalWorkouts}
          label="Workouts Completed"
          context="6 years of consistency"
        />
        <StatCard
          value={hoursInGym}
          unit="hours"
          label="Time in the Gym"
          context="30+ days straight"
        />
        <StatCard
          value={barTravelMiles}
          unit="miles"
          label="Bar Travel Distance"
          context="Climbed Everest 5.3×"
          isDistance
        />
        <StatCard
          value={calculateDuration('2019-01-23')}
          label="Training Since"
          context="Jan 2019"
          isText
        />
      </div>
    </section>
  )
}

function StatCard({ value, unit, label, context, large = false, isDistance = false, isText = false }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const cardRef = useRef(null)
  const metric = isMetric.value

  useEffect(() => {
    // Check if we've already animated this card
    const animatedCards = JSON.parse(localStorage.getItem('animatedStats') || '{}')
    if (animatedCards[label]) {
      setHasAnimated(true)
      setDisplayValue(value)
      return
    }

    // Check if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplayValue(value)
      setHasAnimated(true)
      return
    }

    // Set up Intersection Observer for scroll-triggered animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            animateValue()
            setHasAnimated(true)
            // Mark as animated in localStorage
            const animated = JSON.parse(localStorage.getItem('animatedStats') || '{}')
            animated[label] = true
            localStorage.setItem('animatedStats', JSON.stringify(animated))
          }
        })
      },
      { threshold: 0.5 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [value, label, hasAnimated])

  const animateValue = () => {
    if (isText) {
      setDisplayValue(value)
      return
    }

    const duration = 1500
    const steps = 60
    const increment = value / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, stepDuration)
  }

  const getDisplayValue = () => {
    if (isText) {
      return value
    }

    if (isDistance) {
      return formatDistance(displayValue, metric, 1)
    }

    return formatNumber(displayValue)
  }

  const getUnit = () => {
    if (isText || isDistance) return ''
    return unit || ''
  }

  return (
    <div ref={cardRef} className={`${styles.card} ${large ? styles.cardLarge : ''}`}>
      <div className={styles.cardValue}>
        {getDisplayValue()}
        {getUnit() && <span className={styles.cardUnit}>{getUnit()}</span>}
      </div>
      <div className={styles.cardLabel}>{label}</div>
      {context && <div className={styles.cardContext}>{context}</div>}
    </div>
  )
}
