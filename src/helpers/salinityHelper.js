/**
 * Salinity classification and water quality helpers.
 * Shared across nodeClient, alertClient, and UI components.
 */

const THRESHOLDS = {
  WARNING: 500, // ppm
  DANGER: 1000, // ppm
};

/**
 * Returns the status classification for a given salinity (ppm) reading.
 * @param {number} ppm - Salinity value in ppm
 * @returns {'success' | 'warning' | 'danger'}
 */
export const getSalinityStatus = (ppm) => {
  if (ppm > THRESHOLDS.DANGER) return 'danger';
  if (ppm > THRESHOLDS.WARNING) return 'warning';
  return 'success';
};

/**
 * Returns a hex color representing the contamination level.
 * @param {number} ppm - Salinity value in ppm
 * @returns {string} Hex color code
 */
export const getSalinityColor = (ppm) => {
  const status = getSalinityStatus(ppm);
  const colors = {
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
  };
  return colors[status];
};

/**
 * Returns the alert threshold limit for a given salinity value.
 * @param {number} ppm
 * @returns {number}
 */
export const getSalinityLimit = (ppm) => {
  return ppm > THRESHOLDS.DANGER ? THRESHOLDS.DANGER : THRESHOLDS.WARNING;
};

/**
 * Calculates the Irrigation Aptitude Index (IAR) based on pH and salinity (ppm).
 * @param {number} ph - pH reading
 * @param {number} ppm - Salinity reading in ppm
 * @returns {number} IAR percentage (0-100)
 */
export const calculateIAR = (ph, ppm) => {
  let iar = 100;
  if (ph < 6.5 || ph > 8.5) iar -= 30;
  if (ppm > 750) iar -= 40;      // corresponds to ~1.5 dS/m
  else if (ppm > 500) iar -= 15; // corresponds to ~1.0 dS/m
  return Math.max(0, iar);
};
