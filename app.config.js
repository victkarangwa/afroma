import 'dotenv/config'

export default ({ config }) => ({
  ...config,
  extra: {
    apiUrl: process.env.API_URL,
    jwtSecret: process.env.JWT_SECRET,
    encryptionAlgorithm: process.env.ENCRYPTION_ALGORITHM,
    encryptionKey: process.env.ENCRYPTION_KEY,
    encryptionIV: process.env.ENCRYPTION_IV,
    origin: process.env.ORIGIN,
    eas: {
      projectId: '24a4f53e-d857-4bb4-9a6a-87e1fd9e6e2b',
    },
  },
})
