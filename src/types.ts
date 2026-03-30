export interface Camera {
  id: number;
  name: string;
  area: string;
  ip_address: string;
  status: 'online' | 'offline' | 'unknown';
  offline_reason: string | null;
  lat: number;
  lng: number;
  created_at: string;
}

export type NewCamera = Omit<Camera, 'id' | 'status' | 'offline_reason' | 'created_at'>;
