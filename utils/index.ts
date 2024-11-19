import localStore from './localValues'
import LocalStorage from './storage'

export const seprateTextWithSpace = (text: string) => {
  return text.replace(/([A-Z])/g, ' $1').trim()
}

export const removeUserData = async () => {
  try {
    await LocalStorage.removeItem(localStore.profile)
    await LocalStorage.removeItem(localStore.token)
    return true
  } catch (error) {
    console.error('Error removing user data:', error)
    return false
  }
}
