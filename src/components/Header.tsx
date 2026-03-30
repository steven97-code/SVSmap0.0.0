import React from 'react';
import { Camera, Search, Plus, Activity } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface HeaderProps {
  onAddClick: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function Header({ onAddClick, searchTerm, onSearchChange }: HeaderProps) {
  return (
    <header className="h-16 border-b border-cyan-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.4)]">
          <Camera className="w-5 h-5 text-cyan-400" />
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          ERSV MAP
        </h1>
      </div>

      <div className="flex-1 max-w-md mx-8 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
        <Input 
          className="pl-10 bg-slate-900/50 border-cyan-900 focus-visible:ring-cyan-600"
          placeholder="Search by camera name or area..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-cyan-500 mr-4">
          <Activity className="w-4 h-4" />
          <span>System Active</span>
        </div>
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Camera
        </Button>
      </div>
    </header>
  );
}
