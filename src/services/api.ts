import axios from 'axios'
import { AdminStats, AuthResponse, Train, TrainRequest, TrainMode, User } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const client = axios.create({
  baseURL: API_BASE_URL,
})

// Avoid sending Authorization for public auth endpoints to prevent 401 from stale tokens
client.interceptors.request.use((config) => {
  const url = config.url || ''
  const isPublicAuth = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/token/refresh')
  if (isPublicAuth) {
    if (config.headers) {
      delete (config.headers as any).Authorization
      delete (config.headers as any).authorization
    }
  }
  return config
})

export const setAuthToken = (token?: string) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete client.defaults.headers.common.Authorization
  }
}

// Auth
export const loginApi = async (username: string, password: string) => {
  const { data } = await client.post<AuthResponse>('/auth/login/', { username, password })
  return data
}

export const registerApi = async (payload: Partial<User> & { password: string }) => {
  const { data } = await client.post<AuthResponse>('/auth/register/', payload)
  return data
}

export const refreshTokenApi = async (refresh: string) => {
  const { data } = await client.post<{ access: string; refresh: string }>(
    '/token/refresh/',
    { refresh },
  )
  return data
}

// Users
export const fetchUsers = async () => {
  const { data } = await client.get<User[]>('/users/')
  return data
}

export const fetchProfile = async () => {
  const { data } = await client.post<User>('/users/my_profile/')
  return data
}

export const updateProfile = async (userId: number, payload: Partial<User>) => {
  const { data } = await client.patch<User>(`/users/${userId}/`, payload)
  return data
}

// Trains
export const fetchTrains = async () => {
  const { data } = await client.get<Train[]>('/trains/')
  return data
}

export const stopTrain = async (id: number) => {
  const { data } = await client.post<Train>(`/trains/${id}/stop/`)
  return data
}

export const resumeTrain = async (id: number) => {
  const { data } = await client.post<Train>(`/trains/${id}/resume/`)
  return data
}

export const changeTrainMode = async (id: number, mode: TrainMode) => {
  const { data } = await client.post<Train>(`/trains/${id}/change_mode/`, { mode })
  return data
}

export const emergencyStopTrain = async (id: number) => {
  const { data } = await client.post<Train>(`/trains/${id}/emergency_stop/`)
  return data
}

// Train Requests
export const createTrainRequest = async (
  payload: Pick<TrainRequest, 'start_location' | 'end_location'>,
) => {
  const { data } = await client.post<TrainRequest>('/train-requests/', payload)
  return data
}

export const fetchMyRequests = async () => {
  const { data } = await client.get<TrainRequest[]>('/train-requests/my_requests/')
  return data
}

export const fetchAllTrainRequests = async () => {
  const { data } = await client.get<TrainRequest[]>('/train-requests/')
  return data
}

export const searchRequestsByUser = async (username?: string) => {
  const { data } = await client.get<TrainRequest[]>(
    `/train-requests/search_requests/${username ? `?username=${encodeURIComponent(username)}` : ''}`,
  )
  return data
}

export const searchTrainRequests = async (params: {
  username?: string
  status?: string
  start_location?: string
  end_location?: string
  date_from?: string
  date_to?: string
}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.append(key, value)
  })
  const suffix = query.toString() ? `?${query.toString()}` : ''
  const { data } = await client.get<TrainRequest[]>(`/train-requests/search_requests/${suffix}`)
  return data
}

// Admin
export const fetchAdminStats = async () => {
  const { data } = await client.get<AdminStats>('/admin/stats/')
  return data
}

// Admin-only: create user with password and optional is_admin
export const adminCreateUser = async (
  payload: Partial<User> & { password: string; is_admin?: boolean },
) => {
  const { data } = await client.post<User>('/auth/create_user/', payload)
  return data
}

export default client
