import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-error',
    standalone: true,
    imports: [RouterLink, MatButtonModule],
    templateUrl: './error.component.html',
})
export class ErrorComponent {}
