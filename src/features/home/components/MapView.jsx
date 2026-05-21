import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from 'antd';

const createIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const icons = {
  success: createIcon('#10b981'),
  warning: createIcon('#f59e0b'),
  danger: createIcon('#ef4444'),
};

const MapView = ({ nodes = [], onNodeSelect }) => {
  return (
    <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <div 
        className="absolute bottom-8 right-8 bg-white p-4 rounded-lg shadow-md border border-gray-100"
        style={{ zIndex: 1000 }}
      >
        <h4 className="font-bold text-sm mb-3 border-b pb-1 text-gray-800">Estado del Nodo</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-sm text-gray-700">Óptimo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-sm text-gray-700">Precaución</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-sm text-gray-700">Crítico</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={[20.3000, -99.2000]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {nodes.map(node => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={icons[node.status] || icons['success']}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">{node.name}</h3>
                <p className="mb-1 text-sm text-gray-600">Aptitud Riego (IAR): <strong>{node.iar}%</strong></p>
                <p className="mb-2 text-sm text-gray-600">Salinidad: <strong>{node.salinity} ppm</strong></p>
                <Button type="primary" size="small" onClick={() => onNodeSelect(node)}>
                  Ver Detalles
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
