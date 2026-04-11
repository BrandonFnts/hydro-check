import { createService } from '@/reactive/createService';
import { alertClient } from '@/sdk/alertClient';

export const alertService = createService(alertClient, {
  collection: 'alerts',
  onSuccess: ({ action, payload, db }) => {
    if (action === 'fetchAlerts') {
      db.collection('alerts').bulkWrite(payload);
    }
  },
  onError: ({ action, error }) => {
    console.error(`[AlertService] Error on ${action}:`, error);
  },
});
