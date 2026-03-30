import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera } from '../types';
import { Activity, AlertTriangle, HelpCircle, MapPin, Network, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on status
const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
      animation: pulse 2s infinite;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const onlineIcon = createCustomIcon('#22c55e'); // green-500
const offlineIcon = createCustomIcon('#ef4444'); // red-500
const unknownIcon = createCustomIcon('#eab308'); // yellow-500

interface MapViewProps {
  cameras: Camera[];
  selectedCameraId: number | null;
  onSelectCamera: (id: number) => void;
  onDeleteCamera: (id: number) => void;
  onUpdateStatus: (id: number, status: 'online' | 'offline' | 'unknown', reason?: string) => void;
}

// Component to handle map center changes
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export function MapView({ cameras, selectedCameraId, onSelectCamera, onDeleteCamera, onUpdateStatus }: MapViewProps) {
  // Default center: Algiers
  const defaultCenter: [number, number] = [36.7538, 3.0588];
  
  const [offlineDialog, setOfflineDialog] = useState<{isOpen: boolean, cameraId: number | null}>({isOpen: false, cameraId: null});
  const [offlineReason, setOfflineReason] = useState<string>('ERSV');

  const selectedCamera = cameras.find(c => c.id === selectedCameraId);
  const center = selectedCamera ? [selectedCamera.lat, selectedCamera.lng] as [number, number] : defaultCenter;
  const zoom = selectedCamera ? 15 : 12;

  return (
    <div className="flex-1 relative bg-slate-900 h-[calc(100vh-4rem)] z-0">
      <style>{`
        .leaflet-container {
          background: #0f172a; /* slate-900 */
        }
        .leaflet-popup-content-wrapper {
          background: #020617; /* slate-950 */
          color: #e2e8f0;
          border: 1px solid #164e63; /* cyan-900 */
          border-radius: 0.5rem;
          box-shadow: 0 0 20px rgba(8, 145, 178, 0.3);
        }
        .leaflet-popup-tip {
          background: #020617;
          border: 1px solid #164e63;
        }
        .leaflet-popup-close-button {
          color: #22d3ee !important; /* cyan-400 */
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(var(--tw-colors-cyan-500), 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(var(--tw-colors-cyan-500), 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(var(--tw-colors-cyan-500), 0); }
        }
      `}</style>
      
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Dark mode map tiles (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController center={center} zoom={zoom} />

        {cameras.map((camera) => (
          <Marker
            key={camera.id}
            position={[camera.lat, camera.lng]}
            icon={
              camera.status === 'online' ? onlineIcon :
              camera.status === 'offline' ? offlineIcon : unknownIcon
            }
            eventHandlers={{
              click: () => onSelectCamera(camera.id),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <div className="text-center mb-3 pb-2 border-b border-cyan-900/50">
                  <h3 className="font-bold text-lg text-cyan-400">{camera.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-sm text-slate-400 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{camera.area}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      camera.status === 'online' ? 'bg-green-950/50 text-green-400 border-green-900' :
                      camera.status === 'offline' ? 'bg-red-950/50 text-red-400 border-red-900' :
                      'bg-yellow-950/50 text-yellow-400 border-yellow-900'
                    }`}>
                      {camera.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {camera.status === 'offline' && camera.offline_reason && (
                    <div className="bg-red-950/30 p-2 rounded border border-red-900/50 text-red-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{camera.offline_reason}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                    <span className="text-slate-500">IP Address</span>
                    <div className="flex items-center gap-1 text-cyan-300 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      <Network className="w-3 h-3" />
                      <a href={`http://${camera.ip_address}`} target="_blank" rel="noreferrer" className="hover:underline">
                        {camera.ip_address}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-900/50 flex justify-between items-center gap-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-xs border-green-900 text-green-500 hover:bg-green-950"
                      onClick={() => onUpdateStatus(camera.id, 'online')}
                    >
                      Set Online
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-xs border-red-900 text-red-500 hover:bg-red-950"
                      onClick={() => {
                        setOfflineReason('ERSV');
                        setOfflineDialog({ isOpen: true, cameraId: camera.id });
                      }}
                    >
                      Set Offline
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-950/50"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this camera?')) {
                        onDeleteCamera(camera.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Overlay Elements */}
      <div className="absolute bottom-6 right-6 z-[400] bg-slate-950/80 backdrop-blur-md p-3 rounded-lg border border-cyan-900 shadow-[0_0_20px_rgba(8,145,178,0.2)]">
        <h4 className="text-xs font-semibold text-cyan-500 mb-2 uppercase tracking-wider">Legend</h4>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
            <span>Online / Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
            <span>Offline / Error</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_5px_#eab308]" />
            <span>Unknown Status</span>
          </div>
        </div>
      </div>

      {/* Offline Reason Dialog */}
      <Dialog open={offlineDialog.isOpen} onOpenChange={(isOpen) => setOfflineDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="z-[1000] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Camera Offline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-400">Select Reason</label>
              <select 
                className="flex h-10 w-full rounded-md border border-cyan-800 bg-slate-950 px-3 py-2 text-sm text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                value={offlineReason}
                onChange={(e) => setOfflineReason(e.target.value)}
              >
                <option value="ERSV">ERSV</option>
                <option value="ERMA">ERMA</option>
                <option value="AT">AT</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfflineDialog({ isOpen: false, cameraId: null })}>Cancel</Button>
            <Button onClick={() => {
              if (offlineDialog.cameraId) {
                onUpdateStatus(offlineDialog.cameraId, 'offline', offlineReason);
              }
              setOfflineDialog({ isOpen: false, cameraId: null });
            }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
