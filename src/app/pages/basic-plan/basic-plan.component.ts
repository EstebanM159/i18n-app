import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector.component';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-basic-plan',
  imports: [LanguageSelectorComponent, RouterLink, TranslatePipe],
  templateUrl: './basic-plan.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export default class BasicPlanComponent {}
