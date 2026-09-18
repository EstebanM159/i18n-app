import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-basic-plan',
  imports: [LanguageSelectorComponent, RouterLink],
  templateUrl: './basic-plan.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export default class BasicPlanComponent {}
