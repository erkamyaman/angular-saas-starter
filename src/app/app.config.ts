import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  inject,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeuix/themes/material';
import { definePreset } from '@primeuix/themes';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom } from 'rxjs';

import { environment } from '../environments/environment';
import { AuthService } from './core/auth/auth.service';
import { AppErrorHandler } from './core/error-handler';
import { LANG_STORAGE_KEY, SUPPORTED_LANGS } from './core/i18n/language.service';
import { loadInitialPrimary, paletteFor } from './core/theme/theme.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { devMockInterceptor } from './core/interceptors/dev-mock.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { routes } from './app.routes';

function pickInitialLang(): string {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && (SUPPORTED_LANGS as readonly string[]).includes(stored)) return stored;
  } catch {
    // storage unavailable — fall through
  }
  const browser = (typeof navigator !== 'undefined' ? navigator.language : 'en')
    .split('-')[0]
    .toLowerCase();
  return (SUPPORTED_LANGS as readonly string[]).includes(browser) ? browser : 'en';
}

const AppPreset = definePreset(Material, {
  semantic: {
    primary: paletteFor(loadInitialPrimary()),
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        ...(environment.useMockApi ? [devMockInterceptor] : []),
      ]),
    ),
    MessageService,
    ConfirmationService,
    { provide: ErrorHandler, useClass: AppErrorHandler },
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
      fallbackLang: 'en',
      lang: pickInitialLang(),
    }),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return firstValueFrom(auth.loadCurrentUser()).catch(() => null);
    }),
    providePrimeNG({
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: false,
        },
      },
    })
  ]
};
