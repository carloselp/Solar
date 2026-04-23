import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpLoadingService } from './services/http-loading.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NgIf],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'InoveCode - InoveSolar';
  protected readonly httpLoadingService = inject(HttpLoadingService);
}
