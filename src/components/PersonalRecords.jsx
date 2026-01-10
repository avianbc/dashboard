import { useEffect, useState } from 'preact/hooks';
import { isMetric } from '../state/settings';
import { formatWeight } from '../utils/format';
import styles from './PersonalRecords.module.css';

const LIFT_NAMES = {
  squat: 'Squat',
  bench: 'Bench Press',
  deadlift: 'Deadlift',
  ohp: 'Overhead Press'
};

const LIFT_COLORS = {
  squat: 'var(--color-squat)',
  bench: 'var(--color-bench)',
  deadlift: 'var(--color-deadlift)',
  ohp: 'var(--color-ohp)'
};

const REP_RANGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function PersonalRecords({ data }) {
  const [selectedLift, setSelectedLift] = useState(null);
  const [selectedReps, setSelectedReps] = useState(null);

  if (!data?.allTimePRs || !data?.daysSinceLastPR) {
    return <div className={styles.error}>Personal records data not available</div>;
  }

  const allTimePRs = data.allTimePRs;
  const daysSinceLastPR = data.daysSinceLastPR;

  const handleCellClick = (lift, reps) => {
    if (selectedLift === lift && selectedReps === reps) {
      setSelectedLift(null);
      setSelectedReps(null);
    } else {
      setSelectedLift(lift);
      setSelectedReps(reps);
    }
  };

  return (
    <section className={styles.personalRecords}>
      <div className={styles.header}>
        <h2>Personal Records</h2>
        <p className={styles.subtitle}>All-time PRs by rep range</p>
      </div>

      {/* Days Since Last PR Indicators */}
      <div className={styles.prIndicators}>
        {Object.entries(daysSinceLastPR).map(([lift, days]) => (
          <div key={lift} className={styles.prIndicator} style={{ '--lift-color': LIFT_COLORS[lift] }}>
            <div className={styles.indicatorIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div className={styles.indicatorContent}>
              <span className={styles.indicatorLift}>{LIFT_NAMES[lift]}</span>
              <span className={styles.indicatorDays}>{days} days since last PR</span>
              <span className={styles.indicatorMessage}>Time to chase a new one?</span>
            </div>
          </div>
        ))}
      </div>

      {/* PR Grid */}
      <div className={styles.gridContainer}>
        <div className={styles.gridWrapper}>
          <table className={styles.prGrid}>
            <thead>
              <tr>
                <th className={styles.liftHeader}>Lift</th>
                {REP_RANGES.map(reps => (
                  <th key={reps} className={styles.repHeader}>
                    {reps} {reps === 1 ? 'Rep' : 'Reps'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(allTimePRs).map(([lift, liftData]) => {
                // Position popup above for bottom 2 rows (deadlift, ohp)
                const isBottomRow = lift === 'deadlift' || lift === 'ohp';

                return (
                  <tr key={lift}>
                    <td className={styles.liftCell} style={{ '--lift-color': LIFT_COLORS[lift] }}>
                      <span className={styles.liftName}>{LIFT_NAMES[lift]}</span>
                    </td>
                    {REP_RANGES.map(reps => {
                      const prData = liftData.repPRs?.[reps];
                      const isSelected = selectedLift === lift && selectedReps === reps;

                      return (
                        <td
                          key={reps}
                          className={`${styles.prCell} ${prData ? styles.hasPR : styles.noPR} ${isSelected ? styles.selected : ''}`}
                          onClick={() => prData && handleCellClick(lift, reps)}
                          style={{ '--lift-color': LIFT_COLORS[lift] }}
                        >
                          {prData ? (
                            <div className={styles.prValue}>
                              <span className={styles.weight}>
                                {formatWeight(
                                  isMetric.value ? prData.weightKg : prData.weightLbs,
                                  isMetric.value
                                )}
                              </span>
                              {isSelected && (
                                <div className={`${styles.prDetails} ${isBottomRow ? styles.prDetailsAbove : ''}`}>
                                <div className={styles.detailRow}>
                                  <span className={styles.detailLabel}>Weight:</span>
                                  <span className={styles.detailValue}>
                                    {formatWeight(
                                      isMetric.value ? prData.weightKg : prData.weightLbs,
                                      isMetric.value
                                    )}
                                  </span>
                                </div>
                                <div className={styles.detailRow}>
                                  <span className={styles.detailLabel}>E1RM:</span>
                                  <span className={styles.detailValue}>
                                    {formatWeight(
                                      isMetric.value ? prData.e1rmKg : prData.e1rmLbs,
                                      isMetric.value
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={styles.noData}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.note}>
        Click on any cell to see detailed E1RM information
      </div>
    </section>
  );
}
