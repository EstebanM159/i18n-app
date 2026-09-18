import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LanguageService } from '../../service/language.service';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
@Component({
  selector: 'app-language-selector',
  imports: [TranslatePipe],
  templateUrl: './language-selector.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LanguageSelectorComponent {
  languageService = inject(LanguageService);
  currentLanguage = signal(this.languageService.cookie.get('lang') || 'es');
  languages = signal([
    { code: 'en', flag: '🇺🇸' },
    { code: 'es', flag: '🇪🇸' },
    { code: 'fr', flag: '🇫🇷' },
    { code: 'it', flag: '🇮🇹' },
  ]);

  changeLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;
    this.currentLanguage.set(lang);
    this.languageService.changeLanguage(lang);
    // console.log({ lang });
  }
}
