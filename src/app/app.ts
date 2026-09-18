import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { LanguageService } from './service/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('i18n-app');
  cookie = inject(SsrCookieService);
  languageService = inject(LanguageService);
  constructor() {
    console.log({ cookie: this.cookie.get('lang') });
    const lang = this.cookie.check('lang') ? this.cookie.get('lang') : 'es';
    // const lang = this.cookie.get('lang');
    console.log({ cookiesv: this.cookie.get('lang') });
    this.languageService.changeLanguage(lang);
  }
}
