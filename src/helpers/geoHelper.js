/**
 * Geographic calculation helpers for trajectory rendering.
 */

/**
 * Calculates the bearing angle (in degrees) between two geographic points.
 * Uses the forward azimuth formula.
 * @param {{ lat: number, lng: number }} p1 - Origin point
 * @param {{ lat: number, lng: number }} p2 - Destination point
 * @returns {number} Bearing angle in degrees
 */
export const calculateBearing = (p1, p2) => {
  const toRad = (deg) => deg * Math.PI / 180;

  const lat1 = toRad(p1.lat);
  const lon1 = toRad(p1.lng);
  const lat2 = toRad(p2.lat);
  const lon2 = toRad(p2.lng);

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  return Math.atan2(y, x) * 180 / Math.PI;
};
