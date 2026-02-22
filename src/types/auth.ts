export interface AuthUser {
  id: string
  username: string
  email: string
  role: string
  status: string
  createdAt: string
  lastLogin?: string | null
}

