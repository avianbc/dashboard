import { Sun, Moon, MonitorSmartphone, Weight } from 'lucide-preact'
import { theme, unit, toggleTheme, toggleUnit } from '../state/settings'
import styles from './Header.module.css'

export function Header() {
  const getThemeIcon = () => {
    switch (theme.value) {
      case 'light':
        return <Sun size={20} />
      case 'dark':
        return <Moon size={20} />
      default:
        return <MonitorSmartphone size={20} />
    }
  }

  const getThemeLabel = () => {
    switch (theme.value) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      default:
        return 'Auto'
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.branding}>
          <h1 className={styles.title}>Workout Dashboard</h1>
          <p className={styles.subtitle}>Training Analytics & Progress</p>
        </div>

        <div className={styles.controls}>
          <button
            className={styles.controlButton}
            onClick={toggleUnit}
            aria-label="Toggle unit system"
            title={`Switch to ${unit.value === 'imperial' ? 'metric' : 'imperial'}`}
          >
            <Weight size={20} />
            <span>{unit.value === 'imperial' ? 'lbs' : 'kg'}</span>
          </button>

          <button
            className={styles.controlButton}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Change theme"
          >
            {getThemeIcon()}
            <span>{getThemeLabel()}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
