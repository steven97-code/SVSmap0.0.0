import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { AddCameraModal } from './components/AddCameraModal';
import { Camera, NewCamera } from './types';

export default function App() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'unknown'>('all');
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cameras on mount
  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch('/api/cameras');
      if (response.ok) {
        const data = await response.json();
        setCameras(data);
      }
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCamera = async (newCamera: NewCamera) => {
    try {
      const response = await fetch('/api/cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCamera),
      });
      if (response.ok) {
        const addedCamera = await response.json();
        setCameras([addedCamera, ...cameras]);
      }
    } catch (error) {
      console.error('Failed to add camera:', error);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'online' | 'offline' | 'unknown', reason?: string) => {
    try {
      const response = await fetch(`/api/cameras/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, offline_reason: reason }),
      });
      if (response.ok) {
        const updatedCamera = await response.json();
        setCameras(cameras.map(c => c.id === id ? updatedCamera : c));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDeleteCamera = async (id: number) => {
    try {
      const response = await fetch(`/api/cameras/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCameras(cameras.filter(c => c.id !== id));
        if (selectedCameraId === id) setSelectedCameraId(null);
      }
    } catch (error) {
      console.error('Failed to delete camera:', error);
    }
  };

  const filteredCameras = useMemo(() => {
    return cameras.filter(camera => {
      const matchesSearch = 
        camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camera.area.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || camera.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [cameras, searchTerm, filterStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
      <Header 
        onAddClick={() => setIsAddModalOpen(true)} 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <main className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          cameras={filteredCameras}
          selectedCameraId={selectedCameraId}
          onSelectCamera={setSelectedCameraId}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />
        
        <MapView 
          cameras={filteredCameras}
          selectedCameraId={selectedCameraId}
          onSelectCamera={setSelectedCameraId}
          onDeleteCamera={handleDeleteCamera}
          onUpdateStatus={handleUpdateStatus}
        />
      </main>

      <AddCameraModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddCamera} 
      />
    </div>
  );
}
