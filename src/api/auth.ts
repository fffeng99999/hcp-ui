import http from './http'
import type { AuthUser } from '@/types'

interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
    role: string
    status: string
    created_at: string
    last_login?: string | null
  }
}

const transformUser = (user: LoginResponse['user']): AuthUser => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.created_at,
  lastLogin: user.last_login ?? null
})

export const login = async (username: string, password: string) => {
  const resp = await http.post<LoginResponse>('/auth/login', {
    username,
    password
  })
  return {
    token: resp.token,
    user: transformUser(resp.user)
  }
}

export const getCurrentUser = async (): Promise<AuthUser> => {
  const user = await http.get<LoginResponse['user']>('/auth/me')
  return transformUser(user)
}

export const updateProfile = async (payload: {
  username?: string
  email?: string
}): Promise<{ token: string; user: AuthUser }> => {
  const resp = await http.put<LoginResponse>('/auth/profile', payload)
  return {
    token: resp.token,
    user: transformUser(resp.user)
  }
}

export const changePassword = (payload: {
  currentPassword: string
  newPassword: string
}) => {
  return http.post<void>('/auth/change-password', {
    current_password: payload.currentPassword,
    new_password: payload.newPassword
  })
}

