import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { withReactive } from '@/reactive/withReactive';
import { AppLayout } from './components/layouts/AppLayout';
import { HomeController } from './features/home/HomeController';
import { DashboardController } from './features/dashboard/DashboardController';

const ReactiveLayout = withReactive(AppLayout, {
  queries: () => ({
    alerts: { collection: 'alerts' }
  }),
  init: ({ services }) => {
    services.alertService.fetchAlerts();
  },
  monitors: ['fetchAlerts']
});

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReactiveLayout />}>
          <Route index element={<HomeController />} />
          <Route path="dashboard" element={<DashboardController />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
