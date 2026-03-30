import React, { useState } from 'react';
import { Camera, Lock, User, UserPlus, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering && password !== retypePassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isRegistering ? '/api/register' : '/api/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user = await response.json();
        onLogin(user);
      } else {
        const data = await response.json();
        setError(data.error || (isRegistering ? 'Registration failed' : 'Login failed'));
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setPassword('');
    setRetypePassword('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-8 text-center border-b border-slate-800 bg-slate-900/50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-950 text-cyan-400 mb-4">
            <Camera size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">ERSV Map System</h1>
          <p className="text-slate-400 mt-2">
            {isRegistering ? 'Create a new account' : 'Sign in to access the dashboard'}
          </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-950/50 border border-red-900 text-red-400 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder={isRegistering ? "Choose a username (e.g., admin)" : "Enter your username"}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder={isRegistering ? "Create a password" : "Enter your password"}
                  required
                />
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Retype Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={retypePassword}
                    onChange={(e) => setRetypePassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isRegistering ? (
                <><UserPlus size={18} /> Register</>
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              {isRegistering 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Register manually"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
