import { inject, InjectionToken, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
export const SERVER_LANG_TOKEN = new InjectionToken<string>('SERVER_LANG_TOKEN');
@Service()
export class LanguageService {
  cookie = inject(SsrCookieService);
  translate = inject(TranslateService);
  changeLanguage(lang: string) {
    this.cookie.set('lang', lang);
    this.translate.use(lang);
  }
}
