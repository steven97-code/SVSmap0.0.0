import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { AddCameraModal } from './components/AddCameraModal';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { LoginAnimation } from './components/LoginAnimation';
import { Camera, NewCamera } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'unknown'>('all');
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ersv_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAnimating(true);
    }
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

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('ersv_user', JSON.stringify(user));
    setIsAnimating(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ersv_user');
  };

  const handleAddCamera = async (newCamera: NewCamera) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    try {
      const response = await fetch('/api/cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCamera, adminId: currentUser.id }),
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
    if (!currentUser || currentUser.role !== 'admin') return;

    try {
      const response = await fetch(`/api/cameras/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, offline_reason: reason, adminId: currentUser.id }),
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
    if (!currentUser || currentUser.role !== 'admin') return;

    try {
      const response = await fetch(`/api/cameras/${id}?adminId=${currentUser.id}`, { method: 'DELETE' });
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

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (isAnimating) {
    return <LoginAnimation onComplete={() => setIsAnimating(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
      <Header 
        onAddClick={() => setIsAddModalOpen(true)} 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentUser={currentUser}
        onLogout={handleLogout}
        onManageUsers={() => setIsUserManagementOpen(true)}
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
          currentUser={currentUser}
        />
      </main>

      <AddCameraModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddCamera} 
      />

      <UserManagement
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
