import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

const Spinner = () => (
  <View
    style={[
      styles.container,
      styles.horizontal,
      { backgroundColor: '#0000006e' },
    ]}
  >
    <ActivityIndicator size="large" color="#fff" />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    position: 'absolute',
    zIndex: 9999,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})

export default Spinner
