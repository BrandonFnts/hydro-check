import { useState, useEffect, useMemo } from 'react';
import { db } from '@/firebaseConfig';
import { ref, onValue } from 'firebase/database';

/**
 * Custom hook that subscribes to a node's Firebase history,
 * filters by time range, and derives map-ready data.
 *
 * @param {string|null} nodeId - The node identifier
 * @param {boolean} active - Whether the subscription should be active
 * @param {number} timeRangeHours - Time window in hours (24, 48, 72)
 * @returns {{ historyData: Array, mapData: Array, polylinePositions: Array }}
 */
export const useNodeHistory = (nodeId, active, timeRangeHours) => {
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (active && nodeId) {
      const historyRef = ref(db, `historial/${nodeId}`);
      const unsubscribe = onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const allRecords = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);

          const cutoffTime = Date.now() - (timeRangeHours * 3600 * 1000);
          const filteredRecords = allRecords.filter(r => r.timestamp >= cutoffTime);

          const chartData = filteredRecords.map(r => ({
            time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            salinity: Math.round(parseFloat(r.ce) || 0),
            lat: r.lat,
            lng: r.lng
          }));

          setHistoryData(chartData);
        } else {
          setHistoryData([]);
        }
      });
      return () => {
        unsubscribe();
        setHistoryData([]);
      };
    }
  }, [nodeId, active, timeRangeHours]);

  const mapData = useMemo(() => {
    return historyData.filter(d => d.lat && d.lng);
  }, [historyData]);

  const polylinePositions = useMemo(() => {
    return mapData.map(d => [d.lat, d.lng]);
  }, [mapData]);

  return { historyData, mapData, polylinePositions };
};
