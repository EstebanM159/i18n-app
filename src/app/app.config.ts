import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: 'http://localhost:4000/i18n/',
        failOnError: true,
      }),
    }),
    provideAppInitializer(() => {
      const cookie = inject(SsrCookieService);
      const translate = inject(TranslateService);

      const lang = cookie.check('lang') ? cookie.get('lang') : 'en';

      return translate.use(lang);
    }),
    // Cookies
    SsrCookieService,
  ],
};
