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
      projectId: 'ee79868d-5ee4-4cd3-adf2-0f0f849cd0cb',
    },
  },
})
