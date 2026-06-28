import * as Joi from 'joi';

export default () => ({
  port:        parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv:     process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  apiUrl:      process.env.API_URL ?? 'http://localhost:3001',

  database: { url: process.env.DATABASE_URL },

  redis: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' },

  jwt: {
    accessSecret:  process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry:  process.env.JWT_ACCESS_EXPIRY  ?? '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  },

  r2: {
    accountId:       process.env.R2_ACCOUNT_ID,
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName:      process.env.R2_BUCKET_NAME ?? 'workledger-files',
    publicUrl:       process.env.R2_PUBLIC_URL,
  },

  storageProvider: process.env.STORAGE_PROVIDER ?? 'local',

  cloudinary: {
    cloudName:    process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:       process.env.CLOUDINARY_API_KEY,
    apiSecret:    process.env.CLOUDINARY_API_SECRET,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET ?? 'workledger-uploads',
  },

  resend: { apiKey: process.env.RESEND_API_KEY },

  pdf: {
    serviceUrl:    process.env.PDF_SERVICE_URL ?? 'http://localhost:8080',
    serviceSecret: process.env.PDF_SERVICE_SECRET,
  },

  google: {
    clientId:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl:  process.env.GOOGLE_CALLBACK_URL,
  },
});

// Validate on startup — app refuses to start if anything is missing
export const validationSchema = Joi.object({
  NODE_ENV:             Joi.string().valid('development','production','test').default('development'),
  PORT:                 Joi.number().default(3001),
  DATABASE_URL:         Joi.string().required(),
  REDIS_URL:            Joi.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET:    Joi.string().min(32).required(),
  JWT_REFRESH_SECRET:   Joi.string().min(32).required(),
  FRONTEND_URL:         Joi.string().default('http://localhost:3000'),
  RESEND_API_KEY:       Joi.string().empty(''),
  R2_ACCOUNT_ID:        Joi.string().empty('').when('STORAGE_PROVIDER', { is: 'r2', then: Joi.required() }),
  R2_ACCESS_KEY_ID:     Joi.string().empty('').when('STORAGE_PROVIDER', { is: 'r2', then: Joi.required() }),
  R2_SECRET_ACCESS_KEY: Joi.string().empty('').when('STORAGE_PROVIDER', { is: 'r2', then: Joi.required() }),
  STORAGE_PROVIDER:     Joi.string().valid('local', 'cloudinary', 'r2').default('local'),
  CLOUDINARY_CLOUD_NAME: Joi.string().empty(''),
  CLOUDINARY_API_KEY:   Joi.string().empty(''),
  CLOUDINARY_API_SECRET: Joi.string().empty(''),
  CLOUDINARY_UPLOAD_PRESET: Joi.string().empty('').default('workledger-uploads'),
});
