import { withReactive } from '@/reactive/withReactive';
import { DashboardView } from './DashboardView';

const queries = () => ({
  alerts: {
    collection: 'alerts',
    orderBy: { field: 'timestamp', dir: 'desc' }
  }
});

const init = ({ services }) => {
  services.alertService.fetchAlerts();
};

export const DashboardController = withReactive(DashboardView, {
  queries,
  init,
  monitors: ['fetchAlerts']
});
