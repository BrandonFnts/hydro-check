import { createService } from '@/reactive/createService';
import { nodeClient } from '@/sdk/nodeClient';

export const nodeService = createService(nodeClient, {
  collection: 'nodes',
  onSuccess: ({ action, payload, db }) => {
    if (action === 'fetchNodes') {
      db.collection('nodes').bulkWrite(payload);
    }
  },
  onError: ({ action, error }) => {
    console.error(`[NodeService] Error on ${action}:`, error);
  },
});
