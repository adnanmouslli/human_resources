// src/environments/environment.ts (Development)

import { Environment } from '../app/core/models/environment.model';
import { baseEnvironment } from './environment.base';

export const environment: Environment = {
  ...baseEnvironment,
  production: false,
  // apiBaseUrl: 'http://62.171.153.198:4000',
  apiBaseUrl: 'http://localhost:3000/api',
  apiEndpoints: {
    auth: '/auth',
    users: '/users',
    dashboard: '/dashboard',
    employees: '/employees',
    shifts: '/shifts' ,
    jobTitles: '/job_titles',
    attendances: '/attendances',
    advances: '/advances',
    productionPieces: '/production-pieces',
    productionMonitoring: '/production-monitoring',
    professions: "/professions",
    monthlyAttendance: "/monthly-attendance",
    payroll: "/payroll",
  },
  // @ts-ignore
  features: {
    ...baseEnvironment.features,
    debugMode: true,
    logging: true
  },
  sentryDsn: '', // Optional for development
  performanceTracking: {
    enabled: false,
    sampleRate: 0
  }
};
