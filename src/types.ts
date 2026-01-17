export type TrainMode = 'automatic' | 'manual'
export type TrainStatus = 'running' | 'stopped' | 'paused' | 'idle'

export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  is_admin?: boolean
  is_staff?: boolean
  is_superuser?: boolean
}

export interface Train {
  id: number
  name: string
  status: TrainStatus
  mode: TrainMode
  speed?: number
  battery?: number
  acceleration?: number
  location?: string
}

export interface TrainRequest {
  id: number
  start_location: string
  end_location: string
  status: string
  created_at?: string
  updated_at?: string
  train?: number | Train
  user?: number | User
}

export interface AuthResponse {
  refresh: string
  access: string
  user: User
}

export interface AdminStats {
  total_users: number
  active_users_today: number
  active_users_week: number
  active_users_month: number
  active_users_year: number
  active_users_all_time: number
  total_requests_today: number
  total_requests_week: number
  total_requests_month: number
  total_requests_year: number
  total_requests_all_time: number
}
