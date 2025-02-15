import { Environment } from '../app/core/models/environment.model';

export const baseEnvironment: Partial<Environment> = {
  appName: 'HR Management System',
  version: '1.0.0',
  features: {
    logging: true,
    debugMode: false,
    analytics: false
  },
  auth: {
    tokenKey: 'AccessToken',
    refreshTokenKey: 'RefreshToken',
    tokenExpiryKey: 'TokenExpiry'
  },
  performanceTracking: {
    enabled: false,
    sampleRate: 0.1
  }
};