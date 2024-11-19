import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

class LocalStorage {
  static async setItem(key: string, value: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving data', error)
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await SecureStore.getItemAsync(key)
      return value ? (JSON.parse(value) as T) : null
    } catch (error) {
      console.error('Error retrieving data', error)
      return null
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch (error) {
      console.error('Error removing data', error)
    }
  }

  static async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)))
    } catch (error) {
      console.error('Error clearing data', error)
    }
  }
}

export default LocalStorage
