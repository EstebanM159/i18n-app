import { inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
@Service()
export class LanguageService {
  cookie = inject(SsrCookieService);
  translate = inject(TranslateService);
  changeLanguage(lang: string) {
    this.cookie.set('lang', lang);
    this.translate.use(lang);
  }
}
