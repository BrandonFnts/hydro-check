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
    <div style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
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
                <p className="mb-2 text-sm text-gray-600">Salinidad: <strong>{node.salinity} ppt</strong></p>
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
