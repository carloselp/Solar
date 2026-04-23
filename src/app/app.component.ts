import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpLoadingService } from './services/http-loading.service';
import { CoreService } from './services/core.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NgIf],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'InoveCode - InoveSolar';
  protected readonly httpLoadingService = inject(HttpLoadingService);

  constructor() {
      const translate = inject(TranslateService);
      const coreService = inject(CoreService);
      const language = coreService.getLanguage() || 'pt-BR';

      translate.setDefaultLang(language);
      translate.use(language);
  }
}
