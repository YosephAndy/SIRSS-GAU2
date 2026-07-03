export type AuthCredentials = {
  email: string
  password: string
}

export type Session = {
  user: {
    id: string
    email: string
    role: string
  }
}
