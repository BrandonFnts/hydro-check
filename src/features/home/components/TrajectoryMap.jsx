import React, { useMemo, useEffect } from 'react';
import { Card } from 'antd';
import { MapContainer, TileLayer, Polyline, Marker, useMap, CircleMarker, Tooltip as MapTooltip } from 'react-leaflet';
import L from 'leaflet';
import { getSalinityColor } from '@/helpers/salinityHelper';
import { calculateBearing } from '@/helpers/geoHelper';

const MapBoundsUpdater = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 });
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, [positions, map]);
  return null;
};

const TrajectoryMap = ({ nodeId, mapData, polylinePositions, mapStyle }) => {

  const arrowMarkers = useMemo(() => {
    if (!mapData || mapData.length < 2) return null;
    const items = [];
    for (let i = 0; i < mapData.length - 1; i++) {
      const p1 = mapData[i];
      const p2 = mapData[i + 1];

      const brng = calculateBearing(p1, p2);
      const rotation = Math.round(brng - 90);

      const midLat = (p1.lat + p2.lat) / 2;
      const midLng = (p1.lng + p2.lng) / 2;

      const arrowIcon = L.divIcon({
        className: 'custom-arrow-icon',
        html: `<div style="transform: rotate(${rotation}deg); font-size: 14px; color: #4b5563; display: flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: -7px; margin-left: -7px; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;">➤</div>`,
        iconSize: [14, 14]
      });

      items.push(
        <Marker key={`arrow-${i}`} position={[midLat, midLng]} icon={arrowIcon} interactive={false} />
      );
    }
    return items;
  }, [mapData]);

  return (
    <Card variant="borderless" className="shadow-sm p-0 overflow-hidden mb-2" styles={{ body: { padding: 0 } }}>
        <div style={{ height: 250, width: '100%' }}>
          {polylinePositions.length > 0 ? (
            <MapContainer 
              key={nodeId}
              center={polylinePositions[0]} 
              zoom={15} 
              style={{ height: '100%', width: '100%', zIndex: 1 }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <Polyline positions={polylinePositions} color="#3b82f6" weight={4} opacity={0.7} />
              
              {mapStyle === 'points' ? (
                <>
                  {arrowMarkers}
                  {mapData.map((d, idx) => {
                    const color = getSalinityColor(d.salinity);
                    return (
                      <CircleMarker 
                        key={idx} 
                        center={[d.lat, d.lng]} 
                        radius={6} 
                        pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 1 }}
                      >
                        <MapTooltip>
                          <div className="text-center">
                            <strong>{d.time}</strong><br/>
                            Salinidad: {d.salinity} ppm
                          </div>
                        </MapTooltip>
                      </CircleMarker>
                    );
                  })}
                </>
              ) : (
                <>
                  <CircleMarker 
                    center={polylinePositions[0]} 
                    radius={6} 
                    pathOptions={{ color: '#fff', fillColor: '#9ca3af', fillOpacity: 1, weight: 2 }}
                  >
                    <MapTooltip permanent direction="top" className="text-xs">Inicio</MapTooltip>
                  </CircleMarker>
                  <CircleMarker 
                    center={polylinePositions[polylinePositions.length - 1]} 
                    radius={6} 
                    pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
                  >
                    <MapTooltip permanent direction="top" className="text-xs font-bold">Actual</MapTooltip>
                  </CircleMarker>
                </>
              )}
              <MapBoundsUpdater positions={polylinePositions} />
            </MapContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
              Esperando lecturas de GPS...
            </div>
          )}
        </div>
      </Card>
  );
};

export default TrajectoryMap;
