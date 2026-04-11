import { Card, Statistic, Row, Col } from 'antd';
import { WarningOutlined, FileTextOutlined } from '@ant-design/icons';
import AlertsSection from './components/AlertsSection';

export const DashboardView = ({ alerts }) => {
  const alertCount = alerts?.length || 0;
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard de Análisis</h2>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Alertas Activas (Historial)"
              value={alertCount}
              styles={{ content: { color: '#cf1322' } }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Reportes Generados"
              value={7}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className="shadow-sm p-4">
        <div className="flex items-center gap-2 text-xl text-red-500 font-bold mb-4">
          Historial de Alertas Preventivas
        </div>
        <AlertsSection alerts={alerts} embedded />
      </Card>
    </div>
  );
};
