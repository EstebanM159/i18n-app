import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector.component';

@Component({
  selector: 'app-products',
  imports: [RouterLink, LanguageSelectorComponent],
  templateUrl: './products.component.html',
})
export default class ProductsComponent {
  pepe = signal<number>(0);
}
