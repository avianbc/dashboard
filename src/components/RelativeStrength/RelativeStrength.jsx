import { useEffect, useState } from 'preact/hooks';
import { unit } from '../../state/settings';
import styles from './RelativeStrength.module.css';

const STRENGTH_STANDARDS = {
  squat: {
    untrained: 0,
    novice: 1.0,
    intermediate: 1.5,
    advanced: 2.0,
    elite: 2.5,
  },
  bench: {
    untrained: 0,
    novice: 0.75,
    intermediate: 1.0,
    advanced: 1.5,
    elite: 2.0,
  },
  deadlift: {
    untrained: 0,
    novice: 1.25,
    intermediate: 1.75,
    advanced: 2.25,
    elite: 2.75,
  },
  ohp: {
    untrained: 0,
    novice: 0.5,
    intermediate: 0.75,
    advanced: 1.0,
    elite: 1.25,
  },
};

const LIFT_INFO = {
  squat: { name: 'Squat', color: 'var(--color-squat)' },
  bench: { name: 'Bench Press', color: 'var(--color-bench)' },
  deadlift: { name: 'Deadlift', color: 'var(--color-deadlift)' },
  ohp: { name: 'Overhead Press', color: 'var(--color-ohp)' },
};

const WILKS_BENCHMARKS = [
  { label: 'Beginner', max: 200, color: 'var(--color-benchmark-beginner)' },
  { label: 'Intermediate', max: 300, color: 'var(--color-benchmark-intermediate)' },
  { label: 'Advanced', max: 400, color: 'var(--color-benchmark-advanced)' },
  { label: 'Elite', max: 450, color: 'var(--color-benchmark-elite)' },
  { label: 'World Class', max: 500, color: 'var(--color-benchmark-world)' },
];

function getLevelFromMultiple(lift, multiple) {
  const standards = STRENGTH_STANDARDS[lift];
  if (multiple >= standards.elite) return 'Elite';
  if (multiple >= standards.advanced) return 'Advanced';
  if (multiple >= standards.intermediate) return 'Intermediate';
  if (multiple >= standards.novice) return 'Novice';
  return 'Untrained';
}

function BulletChart({ lift, data }) {
  const standards = STRENGTH_STANDARDS[lift];
  const liftInfo = LIFT_INFO[lift];
  const currentMultiple = data.current.multiple;
  const bestMultiple = data.best.multiple;

  const currentLevel = getLevelFromMultiple(lift, currentMultiple);
  const bestLevel = getLevelFromMultiple(lift, bestMultiple);

  // Calculate percentages for positioning (scale to max elite + buffer)
  const maxScale = standards.elite * 1.2;
  const currentPercent = (currentMultiple / maxScale) * 100;
  const bestPercent = (bestMultiple / maxScale) * 100;

  // Band positions
  const novicePercent = (standards.novice / maxScale) * 100;
  const intermediatePercent = (standards.intermediate / maxScale) * 100;
  const advancedPercent = (standards.advanced / maxScale) * 100;
  const elitePercent = (standards.elite / maxScale) * 100;

  return (
    <div className={styles.bulletChart}>
      <div className={styles.bulletHeader}>
        <div className={styles.bulletTitle}>{liftInfo.name}</div>
        <div className={styles.bulletStats}>
          <div className={styles.bulletStat}>
            <span className={styles.bulletStatLabel}>Best:</span>
            <span className={styles.bulletStatValue} style={{ color: liftInfo.color }}>
              {bestMultiple.toFixed(2)}x ({bestLevel})
            </span>
          </div>
          <div className={styles.bulletStat}>
            <span className={styles.bulletStatLabel}>Current:</span>
            <span className={styles.bulletStatValue}>
              {currentMultiple.toFixed(2)}x ({currentLevel})
            </span>
          </div>
        </div>
      </div>

      <div className={styles.bulletBar}>
        {/* Background bands */}
        <div className={styles.bulletBands}>
          <div
            className={`${styles.bulletBand} ${styles.bandUntrained}`}
            style={{ width: `${novicePercent}%` }}
          />
          <div
            className={`${styles.bulletBand} ${styles.bandNovice}`}
            style={{ width: `${intermediatePercent - novicePercent}%` }}
          />
          <div
            className={`${styles.bulletBand} ${styles.bandIntermediate}`}
            style={{ width: `${advancedPercent - intermediatePercent}%` }}
          />
          <div
            className={`${styles.bulletBand} ${styles.bandAdvanced}`}
            style={{ width: `${elitePercent - advancedPercent}%` }}
          />
          <div
            className={`${styles.bulletBand} ${styles.bandElite}`}
            style={{ width: `${100 - elitePercent}%` }}
          />
        </div>

        {/* Best marker (thinner, behind) */}
        {bestMultiple !== currentMultiple && (
          <div
            className={styles.bulletMarkerBest}
            style={{
              left: `${bestPercent}%`,
              borderColor: liftInfo.color,
            }}
            title={`Best: ${bestMultiple.toFixed(2)}x`}
          />
        )}

        {/* Current value bar */}
        <div
          className={styles.bulletValue}
          style={{
            width: `${currentPercent}%`,
            background: liftInfo.color,
          }}
        >
          <div className={styles.bulletValueLabel}>
            {currentMultiple.toFixed(2)}x
          </div>
        </div>
      </div>

      {/* Scale labels */}
      <div className={styles.bulletScale}>
        <span>Untrained</span>
        <span>Novice</span>
        <span>Intermediate</span>
        <span>Advanced</span>
        <span>Elite</span>
      </div>
    </div>
  );
}

function WilksScore({ wilks }) {
  const { best, current, benchmarks } = wilks;

  const maxScale = 500; // World class
  const currentPercent = (current / maxScale) * 100;
  const bestPercent = (best / maxScale) * 100;

  return (
    <div className={styles.wilksSection}>
      <div className={styles.wilksHeader}>
        <h3>Wilks Score</h3>
        <div className={styles.wilksStats}>
          <div className={styles.wilksStat}>
            <span className={styles.wilksStatLabel}>Best:</span>
            <span className={styles.wilksStatValue}>{best.toFixed(1)}</span>
          </div>
          <div className={styles.wilksStat}>
            <span className={styles.wilksStatLabel}>Current:</span>
            <span className={styles.wilksStatValue}>{current.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className={styles.wilksBar}>
        {/* Benchmark zones */}
        <div className={styles.wilksBands}>
          <div
            className={styles.wilksBand}
            style={{
              width: `${(benchmarks.beginner / maxScale) * 100}%`,
              background: 'var(--color-benchmark-beginner)',
            }}
          >
            <span className={styles.wilksBandLabel}>Beginner</span>
          </div>
          <div
            className={styles.wilksBand}
            style={{
              width: `${((benchmarks.intermediate - benchmarks.beginner) / maxScale) * 100}%`,
              background: 'var(--color-benchmark-intermediate)',
            }}
          >
            <span className={styles.wilksBandLabel}>Intermediate</span>
          </div>
          <div
            className={styles.wilksBand}
            style={{
              width: `${((benchmarks.advanced - benchmarks.intermediate) / maxScale) * 100}%`,
              background: 'var(--color-benchmark-advanced)',
            }}
          >
            <span className={styles.wilksBandLabel}>Advanced</span>
          </div>
          <div
            className={styles.wilksBand}
            style={{
              width: `${((benchmarks.elite - benchmarks.advanced) / maxScale) * 100}%`,
              background: 'var(--color-benchmark-elite)',
            }}
          >
            <span className={styles.wilksBandLabel}>Elite</span>
          </div>
          <div
            className={styles.wilksBand}
            style={{
              width: `${((maxScale - benchmarks.elite) / maxScale) * 100}%`,
              background: 'var(--color-benchmark-world)',
            }}
          >
            <span className={styles.wilksBandLabel}>World Class</span>
          </div>
        </div>

        {/* Best marker */}
        {best !== current && (
          <div
            className={styles.wilksMarkerBest}
            style={{ left: `${bestPercent}%` }}
          >
            <div className={styles.wilksMarkerLabel}>
              Best: {best.toFixed(1)}
            </div>
          </div>
        )}

        {/* Current marker */}
        <div
          className={styles.wilksMarkerCurrent}
          style={{ left: `${currentPercent}%` }}
        >
          <div className={styles.wilksMarkerLabel}>
            Current: {current.toFixed(1)}
          </div>
        </div>
      </div>

      <div className={styles.wilksScale}>
        <span>0</span>
        <span>200</span>
        <span>300</span>
        <span>400</span>
        <span>500</span>
      </div>
    </div>
  );
}

export default function RelativeStrength({ data }) {
  if (!data) return null;

  const { squat, bench, deadlift, ohp, wilks } = data;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Relative Strength & Benchmarks</h2>
      <p className={styles.sectionDescription}>
        Strength relative to bodyweight compared to established standards
      </p>

      <div className={styles.subsection}>
        <h3 className={styles.subsectionTitle}>Bodyweight Multiples</h3>
        <div className={styles.bulletCharts}>
          <BulletChart lift="squat" data={squat} />
          <BulletChart lift="bench" data={bench} />
          <BulletChart lift="deadlift" data={deadlift} />
          <BulletChart lift="ohp" data={ohp} />
        </div>
      </div>

      <div className={styles.subsection}>
        <WilksScore wilks={wilks} />
      </div>
    </section>
  );
}
