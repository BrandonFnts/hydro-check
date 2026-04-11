import { useState } from 'react';
import { Drawer, Select } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import { useNodeHistory } from '@/hooks/useNodeHistory';
import KpiSection from './KpiSection';
import TrajectoryMap from './TrajectoryMap';
import SalinityChart from './SalinityChart';

const NodeDashboard = ({ visible, onClose, node }) => {
  const [timeRange, setTimeRange] = useState(24);
  const [mapStyle, setMapStyle] = useState('points');

  const { historyData, mapData, polylinePositions } = useNodeHistory(
    node?.id,
    visible,
    timeRange
  );

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 font-bold text-xl">
          <DashboardOutlined className="text-blue-500" />
          {node?.name || 'Cargando Detalles...'}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      size="large"
      styles={{ body: { backgroundColor: '#f9fafb', padding: '16px' } }}
    >
      {node && (
        <div className="flex flex-col gap-4">
          <KpiSection node={node} />

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 mb-2 gap-2">
             <h3 className="text-lg font-bold text-gray-700 m-0">Historial y Recorridos</h3>
             <div className="flex gap-2">
                <Select 
                   value={mapStyle} 
                   onChange={setMapStyle}
                   options={[
                     { value: 'points', label: 'Estilo: Puntos' },
                     { value: 'line', label: 'Estilo: Clásico' }
                   ]}
                   style={{ width: 140 }}
                />
                <Select 
                   value={timeRange} 
                   onChange={setTimeRange}
                   options={[
                     { value: 24, label: 'Último día' },
                     { value: 72, label: 'Últimos 3 días' },
                     { value: 168, label: 'Últimos 7 días' }
                   ]}
                   style={{ width: 160 }}
                />
             </div>
          </div>

          <TrajectoryMap 
            nodeId={node.id} 
            mapData={mapData} 
            polylinePositions={polylinePositions}
            mapStyle={mapStyle}
          />

          <SalinityChart data={historyData} timeRange={timeRange / 24} />
        </div>
      )}
    </Drawer>
  );
};

export default NodeDashboard;
