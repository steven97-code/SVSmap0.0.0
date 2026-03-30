import React from 'react';
import { Camera as CameraType } from '../types';
import { Video, AlertTriangle, CheckCircle2, HelpCircle, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

interface SidebarProps {
  cameras: CameraType[];
  selectedCameraId: number | null;
  onSelectCamera: (id: number) => void;
  filterStatus: 'all' | 'online' | 'offline' | 'unknown';
  onFilterChange: (status: 'all' | 'online' | 'offline' | 'unknown') => void;
}

export function Sidebar({ cameras, selectedCameraId, onSelectCamera, filterStatus, onFilterChange }: SidebarProps) {
  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const offlineCount = cameras.filter(c => c.status === 'offline').length;
  const unknownCount = cameras.filter(c => c.status === 'unknown').length;

  const handleExportOffline = () => {
    const offlineCameras = cameras.filter(c => c.status === 'offline');
    if (offlineCameras.length === 0) {
      alert("No offline cameras to export.");
      return;
    }

    const headers = ['ID', 'Name', 'Area', 'IP Address', 'Status', 'Offline Reason', 'Latitude', 'Longitude'];
    const csvContent = [
      headers.join(','),
      ...offlineCameras.map(c => 
        [
          c.id, 
          `"${c.name}"`, 
          `"${c.area}"`, 
          c.ip_address, 
          c.status, 
          `"${c.offline_reason || ''}"`, 
          c.lat, 
          c.lng
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `offline_cameras_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <aside className="w-80 bg-slate-950/95 border-r border-cyan-900 flex flex-col h-[calc(100vh-4rem)] overflow-hidden z-20">
      <div className="p-4 border-b border-cyan-900/50">
        <h2 className="text-sm font-semibold text-cyan-500 uppercase tracking-wider mb-4">System Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 p-3 rounded-lg border border-cyan-900/50 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-cyan-400">{cameras.length}</span>
            <span className="text-xs text-slate-400">Total Cameras</span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-green-900/50 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-green-400">{onlineCount}</span>
            <span className="text-xs text-slate-400">Online</span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-red-900/50 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-red-400">{offlineCount}</span>
            <span className="text-xs text-slate-400">Offline</span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-yellow-900/50 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-yellow-400">{unknownCount}</span>
            <span className="text-xs text-slate-400">Unknown</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-cyan-900/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-cyan-500 uppercase tracking-wider">Filters</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 px-2 text-xs border-cyan-800 text-cyan-400 hover:bg-cyan-950"
            onClick={handleExportOffline}
            title="Export Offline Cameras to CSV"
          >
            <Download className="w-3 h-3 mr-1" />
            Export Offline
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'online', 'offline', 'unknown'] as const).map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
                filterStatus === status 
                  ? "bg-cyan-900 text-cyan-100 border border-cyan-500 shadow-[0_0_10px_rgba(8,145,178,0.3)]" 
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-cyan-800"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <h2 className="text-sm font-semibold text-cyan-500 uppercase tracking-wider mb-3 sticky top-0 bg-slate-950/90 py-1 z-10">Camera List</h2>
        {cameras.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-8">No cameras found.</div>
        ) : (
          cameras.map((camera) => (
            <div
              key={camera.id}
              onClick={() => onSelectCamera(camera.id)}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all duration-200 group relative overflow-hidden",
                selectedCameraId === camera.id
                  ? "bg-cyan-950/50 border-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.2)]"
                  : "bg-slate-900/30 border-slate-800 hover:border-cyan-800 hover:bg-slate-900/80"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Video className={cn(
                    "w-4 h-4",
                    camera.status === 'online' ? "text-green-400" :
                    camera.status === 'offline' ? "text-red-400" : "text-yellow-400"
                  )} />
                  <span className="font-medium text-slate-200 text-sm">{camera.name}</span>
                </div>
                {camera.status === 'online' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {camera.status === 'offline' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                {camera.status === 'unknown' && <HelpCircle className="w-4 h-4 text-yellow-500" />}
              </div>
              <div className="text-xs text-slate-500 flex justify-between items-center mt-2">
                <span>{camera.area}</span>
                <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{camera.ip_address}</span>
              </div>
              
              {/* Highlight effect on select */}
              {selectedCameraId === camera.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(8,145,178,1)]" />
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
