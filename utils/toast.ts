import Toast from 'react-native-toast-message'

const showToast = (type: string, text1: string, text2: string) => {
  Toast.show({
    type: type,
    text1: text1 || '',
    text2: text2 || '',
    visibilityTime: 4000,
  })
}

export default showToast
