import { userRepository } from '@/features/users/repositories/user.repository'

export async function getUserById(id: string) {
  return userRepository.findById(id)
}

export async function getAllUsers() {
  return userRepository.findAll()
}
