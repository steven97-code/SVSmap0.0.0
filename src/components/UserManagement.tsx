import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, User, Trash2 } from 'lucide-react';

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export function UserManagement({ isOpen, onClose, currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  
  // New user form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    if (isOpen && currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [isOpen, currentUser]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?adminId=${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAdding(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, adminId: currentUser.id }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([newUser, ...users]);
        setUsername('');
        setPassword('');
        setRole('user');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-100">
            <Shield size={20} className="text-cyan-400" />
            <h2 className="text-lg font-semibold">User Management</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Add User Form */}
          <div className="p-4 border-b md:border-b-0 md:border-r border-slate-800 w-full md:w-1/2 overflow-y-auto">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <UserPlus size={16} /> Add New User
            </h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              {error && (
                <div className="p-2 bg-red-950/50 border border-red-900 text-red-400 rounded text-xs">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="user">User (View Only)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={isAdding}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isAdding ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>

          {/* User List */}
          <div className="p-4 w-full md:w-1/2 overflow-y-auto bg-slate-950/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <User size={16} /> Existing Users
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-cyan-900 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{user.username}</div>
                      <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                        user.role === 'admin' ? 'bg-purple-900/50 text-purple-400 border border-purple-800' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {user.role}
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
