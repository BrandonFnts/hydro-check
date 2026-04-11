import { useState } from 'react';
import { Spin } from 'antd';
import MapView from './components/MapView';
import NodeDashboard from './components/NodeDashboard';

export const HomeView = ({ nodes, monitors }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const isLoading = monitors.fetchNodes;

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
          <Spin size="large" description="Cargando nodos..." />
        </div>
      )}
      
      <MapView 
        nodes={nodes} 
        onNodeSelect={(node) => setSelectedNode(node)} 
      />
      
      <NodeDashboard 
        visible={!!selectedNode} 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />
    </div>
  );
};
