// src/environments/environment.prod.ts (Production)
import { Environment } from '../app/core/models/environment.model';
import { baseEnvironment } from './environment.base';

export const environment: Environment = {
  ...baseEnvironment,
  production: true,
  apiBaseUrl: 'https://api.yourdomain.com/api',
  apiEndpoints: {
    auth: '/auth',
    users: '/users',
    dashboard: '/dashboard'
  },
  // @ts-ignore
  features: {
    ...baseEnvironment.features,
    analytics: true
  },
  sentryDsn: 'YOUR_SENTRY_DSN', // Error tracking
  performanceTracking: {
    enabled: true,
    sampleRate: 0.1
  }
};
