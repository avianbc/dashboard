import { isMetric } from '../state/settings'
import { formatWeight, formatDate } from '../utils/format'
import styles from './PlateMilestones.module.css'

const PLATE_COUNTS = [1, 2, 3, 4, 5]
const LIFTS = [
  { key: 'squat', name: 'Squat', color: 'squat' },
  { key: 'bench', name: 'Bench Press', color: 'bench' },
  { key: 'deadlift', name: 'Deadlift', color: 'deadlift' },
  { key: 'ohp', name: 'Overhead Press', color: 'ohp' },
]

// Calculate plate weight (45lbs per plate + 45lb bar)
const getPlateWeight = (plateCount, metric) => {
  const weightLbs = plateCount * 45 * 2 + 45 // (plates per side * 2) + bar
  if (metric) {
    const weightKg = weightLbs * 0.453592
    return Math.round(weightKg * 10) / 10
  }
  return weightLbs
}

export function PlateMilestones({ plateMilestones }) {
  if (!plateMilestones) return null

  const metric = isMetric.value

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Plate Milestones</h2>
        <p className={styles.subtitle}>
          Strength achievements in plates per side (45 lb / 20 kg plates)
        </p>
      </div>

      <div className={styles.grid}>
        {/* Header row */}
        <div className={styles.headerCell}></div>
        {PLATE_COUNTS.map((count) => (
          <div key={count} className={styles.headerCell}>
            <div className={styles.plateCount}>{count} Plate{count > 1 ? 's' : ''}</div>
            <div className={styles.plateWeight}>
              {formatWeight(getPlateWeight(count, metric), metric)}
            </div>
          </div>
        ))}

        {/* Lift rows */}
        {LIFTS.map((lift) => (
          <div key={lift.key} className={styles.row}>
            <div className={`${styles.liftLabel} ${styles[lift.color]}`}>
              {lift.name}
            </div>
            {PLATE_COUNTS.map((plateCount) => {
              const milestone = plateMilestones[lift.key]?.[plateCount.toString()]
              const isUnlocked = !!milestone

              return (
                <AchievementCard
                  key={`${lift.key}-${plateCount}`}
                  isUnlocked={isUnlocked}
                  milestone={milestone}
                  liftColor={lift.color}
                  plateCount={plateCount}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.unlocked}`}></div>
          <span>Achieved</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.locked}`}></div>
          <span>Locked</span>
        </div>
      </div>
    </section>
  )
}

function AchievementCard({ isUnlocked, milestone, liftColor, plateCount }) {
  const metric = isMetric.value

  if (!isUnlocked) {
    return (
      <div className={`${styles.card} ${styles.locked}`}>
        <div className={styles.lockIcon}>🔒</div>
      </div>
    )
  }

  return (
    <div
      className={`${styles.card} ${styles.unlocked} ${styles[liftColor]}`}
      title={`Achieved on ${formatDate(milestone.date)}`}
    >
      <div className={styles.checkIcon}>✓</div>
      <div className={styles.weight}>
        {formatWeight(
          metric ? milestone.actualWeightKg : milestone.actualWeightLbs,
          metric,
          0
        )}
      </div>
      <div className={styles.date}>
        {formatDate(milestone.date, { month: 'numeric', day: 'numeric', year: '2-digit' })}
      </div>
    </div>
  )
}
