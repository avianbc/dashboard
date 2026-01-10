// Number formatting utilities

/**
 * Format a number with commas (e.g., 1234567 -> "1,234,567")
 */
export function formatNumber(value, decimals = 0) {
  if (value == null || isNaN(value)) return '0'

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a large number with K/M suffix (e.g., 1500 -> "1.5K")
 */
export function formatCompact(value) {
  if (value == null || isNaN(value)) return '0'

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

/**
 * Convert weight between imperial and metric
 */
export function convertWeight(lbs, toMetric = false) {
  if (toMetric) {
    return lbs * 0.453592 // lbs to kg
  }
  return lbs / 0.453592 // kg to lbs
}

/**
 * Format weight with unit (e.g., 225 -> "225 lbs" or "102 kg")
 */
export function formatWeight(lbs, isMetric = false, decimals = 0) {
  if (lbs == null || isNaN(lbs)) return '0 lbs'

  if (isMetric) {
    const kg = convertWeight(lbs, true)
    return `${formatNumber(kg, decimals)} kg`
  }
  return `${formatNumber(lbs, decimals)} lbs`
}

/**
 * Convert distance between miles and kilometers
 */
export function convertDistance(miles, toMetric = false) {
  if (toMetric) {
    return miles * 1.60934 // miles to km
  }
  return miles / 1.60934 // km to miles
}

/**
 * Format distance with unit
 */
export function formatDistance(miles, isMetric = false, decimals = 2) {
  if (miles == null || isNaN(miles)) return '0 mi'

  if (isMetric) {
    const km = convertDistance(miles, true)
    return `${formatNumber(km, decimals)} km`
  }
  return `${formatNumber(miles, decimals)} mi`
}

/**
 * Format date
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date)
}

/**
 * Format date range
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate) return ''
  if (!endDate) return formatDate(startDate)

  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

/**
 * Calculate time ago (e.g., "3 days ago")
 */
export function timeAgo(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/**
 * Calculate duration between two dates
 */
export function calculateDuration(startDate, endDate) {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()

  const diffMs = end - start
  const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365))
  const diffMonths = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))

  if (diffYears > 0 && diffMonths > 0) {
    return `${diffYears} year${diffYears > 1 ? 's' : ''}, ${diffMonths} month${diffMonths > 1 ? 's' : ''}`
  } else if (diffYears > 0) {
    return `${diffYears} year${diffYears > 1 ? 's' : ''}`
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`
  }
  return '0 months'
}
