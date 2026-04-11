import { db } from '@/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { getSalinityStatus, getSalinityLimit } from '@/helpers/salinityHelper';

export const alertClient = {
  fetchAlerts: () => {
    return new Promise((resolve) => {
      const historialRef = ref(db, 'historial');
      
      onValue(historialRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let allAlerts = [];

          Object.keys(data).forEach(nodeId => {
            const nodeHistory = data[nodeId];
            
            Object.keys(nodeHistory).forEach(pushId => {
              const lectura = nodeHistory[pushId];
              const status = getSalinityStatus(lectura.ce);

              if (status !== 'success') {
                allAlerts.push({
                  id: pushId,
                  nodeId: nodeId,
                  node: nodeId,
                  timestamp: lectura.timestamp,
                  value: lectura.ce,
                  limit: getSalinityLimit(lectura.ce),
                  status
                });
              }
            });
          });

          allAlerts.sort((a, b) => b.timestamp - a.timestamp);
          
          const recentAlerts = allAlerts.slice(0, 50);

          localStorage.setItem('alerts', JSON.stringify(recentAlerts));
          window.dispatchEvent(new Event('storage'));
          
          resolve(recentAlerts);
        } else {
          localStorage.setItem('alerts', JSON.stringify([]));
          window.dispatchEvent(new Event('storage'));
          resolve([]);
        }
      });
    });
  },
};
