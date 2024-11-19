import { jwtDecode } from 'jwt-decode'

import LocalStorage from './storage'
import localStore from './localValues'

class Encryption {
  static async decrypt<T extends { user: string }>(
    hash: string,
  ): Promise<T | null> {
    try {
      LocalStorage.setItem(localStore.token, hash)
      hash = hash.replace('Bearer ', '')
      const decoded = jwtDecode<T>(hash)
      return decoded as T
    } catch (error) {
      return JSON.stringify(error) as unknown as T
    }
  }
}

export default Encryption
