/**
 * Salinity classification and water quality helpers.
 * Shared across nodeClient, alertClient, and UI components.
 */

const THRESHOLDS = {
  WARNING: 1.0,
  DANGER: 2.0,
};

/**
 * Returns the status classification for a given salinity (CE) reading.
 * @param {number} ce - Conductivity / salinity value in dS/m
 * @returns {'success' | 'warning' | 'danger'}
 */
export const getSalinityStatus = (ce) => {
  if (ce > THRESHOLDS.DANGER) return 'danger';
  if (ce > THRESHOLDS.WARNING) return 'warning';
  return 'success';
};

/**
 * Returns a hex color representing the contamination level.
 * @param {number} ce - Conductivity / salinity value
 * @returns {string} Hex color code
 */
export const getSalinityColor = (ce) => {
  const status = getSalinityStatus(ce);
  const colors = {
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
  };
  return colors[status];
};

/**
 * Returns the alert threshold limit for a given salinity value.
 * @param {number} ce
 * @returns {number}
 */
export const getSalinityLimit = (ce) => {
  return ce > THRESHOLDS.DANGER ? THRESHOLDS.DANGER : THRESHOLDS.WARNING;
};

/**
 * Calculates the Irrigation Aptitude Index (IAR) based on pH and salinity.
 * @param {number} ph - pH reading
 * @param {number} ce - Salinity (CE) reading
 * @returns {number} IAR percentage (0-100)
 */
export const calculateIAR = (ph, ce) => {
  let iar = 100;
  if (ph < 6.5 || ph > 8.5) iar -= 30;
  if (ce > 1.5) iar -= 40;
  else if (ce > 1.0) iar -= 15;
  return Math.max(0, iar);
};
