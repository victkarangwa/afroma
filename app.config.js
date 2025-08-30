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
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    eas: {
      projectId: '657eb666-883a-47cb-bfa2-27ba09f07b1f',
    },
  },
})
