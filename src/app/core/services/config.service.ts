// src/app/core/services/config.service.ts
import { Injectable } from '@angular/core';
import { Environment, FeatureFlags } from '../models/environment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private env: Environment = environment;

  constructor() {
    this.validateConfiguration();
  }

  /**
   * Validate and log configuration warnings
   */
  private validateConfiguration(): void {
    // Runtime configuration checks
    if (this.env.production) {
      // Disable debug features in production
      if (this.env.features.debugMode) {
        console.warn('Debug mode should be disabled in production');
      }
    }

    // Validate API endpoints
    if (!this.env.apiBaseUrl) {
      console.error('API Base URL is not configured');
    }
  }

  /**
   * Get full environment configuration
   */
  getEnvironment(): Environment {
    return this.env;
  }

  /**
   * Check if a specific feature is enabled
   * @param feature Feature to check
   */
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.env.features[feature];
  }

  /**
   * Get API endpoint
   * @param endpoint Specific endpoint type
   */
  getApiEndpoint(endpoint: keyof Environment['apiEndpoints']): string {
    return `${this.env.apiBaseUrl}${this.env.apiEndpoints[endpoint]}`;
  }

  /**
   * Get authentication configuration
   */
  getAuthConfig() {
    return this.env.auth;
  }

  /**
   * Check if performance tracking is enabled
   */
  isPerformanceTrackingEnabled(): boolean {
    return this.env.performanceTracking.enabled;
  }
}
