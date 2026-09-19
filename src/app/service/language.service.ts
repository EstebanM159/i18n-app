import { inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
@Service()
export class LanguageService {
  cookie = inject(SsrCookieService);
  translate = inject(TranslateService);
  changeLanguage(lang: string) {
    if (this.cookie.get('lang') === lang) return;
    this.cookie.set('lang', lang, { expires: 365, path: '/', sameSite: 'Lax' });
    this.translate.use(lang);
  }
}
