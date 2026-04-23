import { db } from '@/firebaseConfig';
import { ref, onValue, query, limitToLast, orderByChild } from 'firebase/database';
import { getSalinityStatus, calculateIAR } from '@/helpers/salinityHelper';

export const nodeClient = {
  fetchNodes: () => {
    return new Promise((resolve) => {
      const historialRef = ref(db, 'historial');

      onValue(historialRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const alertsData = JSON.parse(localStorage.getItem('alerts') || '[]');
          const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

          const formattedNodes = Object.keys(data).map(key => {
            const nodeHistory = data[key];
            const entries = Object.values(nodeHistory);
            const lectura = entries.reduce((latest, entry) =>
              entry.timestamp > (latest.timestamp || 0) ? entry : latest
              , {});

            const salinity = lectura.ce || 0;
            const ph = lectura.ph || 7.0;
            const turbidez = lectura.turbidez || 0;
            const temp = lectura.temp || 20.0;

            const status = getSalinityStatus(salinity);
            const iar = calculateIAR(ph, salinity);

            const previousReading = alertsData.find(a => a.nodeId === key && a.timestamp < lectura.timestamp);
            let trend = 0;
            if (previousReading) {
              trend = ((salinity - previousReading.value) / previousReading.value) * 100;
            }

            return {
              id: key,
              name: lectura.nombre,
              lat: lectura.lat,
              lng: lectura.lng,
              status,
              salinity,
              ph,
              turbidez,
              temp,
              iar,
              trend,
              timestamp: lectura.timestamp
            };
          }).filter(node =>
            node.lat !== undefined &&
            node.lng !== undefined &&
            node.timestamp &&
            node.timestamp >= thirtyMinutesAgo
          );

          localStorage.setItem('nodes', JSON.stringify(formattedNodes));
          window.dispatchEvent(new Event('storage'));

          resolve(formattedNodes);
        } else {
          resolve([]);
        }
      });
    });
  },
};
