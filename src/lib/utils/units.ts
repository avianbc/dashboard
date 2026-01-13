// Unit conversion utilities

/**
 * Convert pounds to kilograms
 */
export function lbsToKg(lbs: number): number {
	return lbs * 0.453592;
}

/**
 * Convert kilograms to pounds
 */
export function kgToLbs(kg: number): number {
	return kg / 0.453592;
}

/**
 * Convert miles to kilometers
 */
export function milesToKm(miles: number): number {
	return miles * 1.60934;
}

/**
 * Convert kilometers to miles
 */
export function kmToMiles(km: number): number {
	return km / 1.60934;
}

/**
 * Convert weight based on unit system
 */
export function convertWeight(value: number, toMetric: boolean): number {
	return toMetric ? lbsToKg(value) : value;
}

/**
 * Convert distance based on unit system
 */
export function convertDistance(value: number, toMetric: boolean): number {
	return toMetric ? milesToKm(value) : value;
}

/**
 * Get weight unit label
 */
export function getWeightUnit(isMetric: boolean): string {
	return isMetric ? 'kg' : 'lbs';
}

/**
 * Get distance unit label
 */
export function getDistanceUnit(isMetric: boolean): string {
	return isMetric ? 'km' : 'mi';
}
