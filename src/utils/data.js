// Data loading utility
let cachedData = null

export async function loadTrainingData() {
  if (cachedData) {
    return cachedData
  }

  try {
    const response = await fetch('/dashboard/training_data.json')
    if (!response.ok) {
      throw new Error(`Failed to load training data: ${response.statusText}`)
    }
    cachedData = await response.json()
    return cachedData
  } catch (error) {
    console.error('Error loading training data:', error)
    throw error
  }
}

// Clear cache (useful for development)
export function clearDataCache() {
  cachedData = null
}
