import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { NewCamera } from '../types';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (camera: NewCamera) => void;
}

export function AddCameraModal({ isOpen, onClose, onAdd }: AddCameraModalProps) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !area || !ipAddress || !lat || !lng) return;

    onAdd({
      name,
      area,
      ip_address: ipAddress,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });

    // Reset form
    setName('');
    setArea('');
    setIpAddress('');
    setLat('');
    setLng('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Camera</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-400">Camera Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Cam-N-01" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-400">Area</label>
            <Input 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              placeholder="e.g., Bab El Oued" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-400">IP Address</label>
            <Input 
              value={ipAddress} 
              onChange={(e) => setIpAddress(e.target.value)} 
              placeholder="e.g., 192.168.1.100" 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-400">Latitude</label>
              <Input 
                type="number" 
                step="any" 
                value={lat} 
                onChange={(e) => setLat(e.target.value)} 
                placeholder="36.7538" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-400">Longitude</label>
              <Input 
                type="number" 
                step="any" 
                value={lng} 
                onChange={(e) => setLng(e.target.value)} 
                placeholder="3.0588" 
                required 
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Camera</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
