import Axios from 'axios'
import Constants from 'expo-constants'

import config from '@/utils/localValues'
import LocalStorage from '@/utils/storage'

const authRequestInterceptor = async (settings: any) => {
  const token = await LocalStorage.getItem<string>(config.token)

  if (token) settings.headers.Authorization = token
  settings.headers.Origin = Constants.expoConfig?.extra?.origin
  return settings
}

const http = Axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl,
})

http.interceptors.request.use(authRequestInterceptor)

http.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('Axios Error:', error)

    return Promise.reject(error.response)
  },
)

export { http }
