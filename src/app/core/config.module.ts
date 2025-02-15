// src/app/core/config.module.ts
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ConfigService } from './services/config.service';
import { environment } from '../../environments/environment';

// Optional: App Initializer for complex configurations
export function initializeApp(configService: ConfigService) {
  return () => {
    // Perform any async initialization if needed
    if (environment.features.logging) {
      console.log('Application initialized with config:', configService.getEnvironment());
    }
  };
}

@NgModule({
  providers: [
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    }
  ]
})
export class ConfigModule {}
