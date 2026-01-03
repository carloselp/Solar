import {
    ApplicationConfig,
    provideZoneChangeDetection,
    importProvidersFrom,
} from '@angular/core';
import {
    HttpClient,
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { routes } from './app.routes';
import {
    provideRouter,
    withComponentInputBinding,
    withInMemoryScrolling,
} from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ToastrModule } from 'ngx-toastr';
import { provideToastr } from 'ngx-toastr';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthHeaderInterceptor } from './interceptors/auth-header.interceptor';
import { GlobalErrorInterceptor } from './interceptors/global-error.interceptor';

import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDateFormats, provideNativeDateAdapter } from '@angular/material/core';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

// perfect scrollbar
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxPermissionsModule } from 'ngx-permissions';

//Import all material modules
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// code view
import { provideHighlightOptions } from 'ngx-highlightjs';
import 'highlight.js/styles/atom-one-dark.min.css';

export const BR_DATE_FORMATS: MatDateFormats = {
    parse: {
        dateInput: 'DD/MM/YYYY', // como o usuário digita
    },
    display: {
        dateInput: 'dd/MM/yyyy',       // como aparece no input
        monthYearLabel: 'MMM yyyy',    // label do mês/ano no header
        dateA11yLabel: 'dd/MM/yyyy',   // acessibilidade
        monthYearA11yLabel: 'MMMM yyyy',
    },
};

export function HttpLoaderFactory(http: HttpClient): any {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        provideToastr(),
        provideNativeDateAdapter(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideHighlightOptions({
            coreLibraryLoader: () => import('highlight.js/lib/core'),
            lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
            languages: {
                typescript: () => import('highlight.js/lib/languages/typescript'),
                css: () => import('highlight.js/lib/languages/css'),
                xml: () => import('highlight.js/lib/languages/xml'),
            },
        }),
        provideRouter(
            routes,
            withInMemoryScrolling({
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
            }),
            withComponentInputBinding()
        ),
        provideHttpClient(withInterceptorsFromDi()),
        provideClientHydration(),
        provideAnimationsAsync(),
        { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
        { provide: MAT_DATE_FORMATS, useValue: BR_DATE_FORMATS },
        importProvidersFrom(
            FormsModule,
            ToastrModule.forRoot(),
            ReactiveFormsModule,
            MaterialModule,
            NgxPermissionsModule.forRoot(),
            TablerIconsModule.pick(TablerIcons),
            NgScrollbarModule,
            CalendarModule.forRoot({
                provide: DateAdapter,
                useFactory: adapterFactory,
            }),
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient],
                },
            })
        ),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthHeaderInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: GlobalErrorInterceptor,
            multi: true,
        },
    ],
};
