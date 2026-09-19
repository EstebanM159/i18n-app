import { Component, inject, signal } from '@angular/core';
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
  private readonly cookie = inject(SsrCookieService);
  private readonly langService = inject(LanguageService);

  constructor() {
    const lang = this.cookie.check('lang') ? this.cookie.get('lang') : 'en';
    this.langService.changeLanguage(lang);
  }
}
