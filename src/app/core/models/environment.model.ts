// src/app/core/models/environment.model.ts
export interface FeatureFlags {
  logging: boolean;
  debugMode: boolean;
  analytics: boolean;
}

export interface AuthConfig {
  tokenKey: string;
  refreshTokenKey: string;
  tokenExpiryKey: string;
}

export interface ApiEndpoints {
  auth: string;
  users: string;
  dashboard: string;
}

export interface Environment {
  production: boolean;
  appName: string;
  version: string;

  // API Configuration
  apiBaseUrl: string;
  apiEndpoints: any;

  // Feature Flags
  features: FeatureFlags;

  // Authentication Configuration
  auth: AuthConfig;

  // Logging and Monitoring
  sentryDsn?: string;

  // Performance Monitoring
  performanceTracking: {
    enabled: boolean;
    sampleRate: number;
  };
}
