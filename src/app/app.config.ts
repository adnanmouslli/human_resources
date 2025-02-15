import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { addTokenInterceptor } from './interceptor/add-token.interceptor';
import { MessageService } from 'primeng/api';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// استرداد اللغة الافتراضية من localStorage أو تعيين الإنجليزية كافتراضية
const defaultLanguage = localStorage.getItem('language') || 'en';

export const appConfig: ApplicationConfig = {

  providers: [
    MessageService, // إضافة MessageService هنا كمزود عالمي

    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([addTokenInterceptor]) // تسجيل الـ Interceptor
    ),
    provideAnimations(),
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    {
      provide: 'DEFAULT_LANGUAGE',
      useValue: defaultLanguage,
    },
    
  ],
};
