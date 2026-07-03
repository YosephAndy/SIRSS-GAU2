export type User = {
  id: string
  name: string | null
  email: string
  roleId: number
  role?: {
    id: number
    name: string
  }
  createdAt: Date
  updatedAt: Date
}

export type CreateUserInput = {
  name?: string
  email: string
  password: string
}
