import {
    Component,
    Output,
    EventEmitter,
    Input,
    signal,
    ViewEncapsulation,
    OnInit,
} from '@angular/core';
import {CoreService} from 'src/app/services/core.service';
import {MatDialog} from '@angular/material/dialog';
import {navItems} from '../sidebar/sidebar-data';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {TablerIconsModule} from 'angular-tabler-icons';
import {MaterialModule} from 'src/app/material.module';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgScrollbarModule} from 'ngx-scrollbar';
import {AppSettings} from 'src/app/config';
import {AuthService} from 'src/app/pages/authentication/auth.service';
import {LogoutConfirmDialogComponent} from "./logout-confirm-dialog.component";

interface notifications {
    id: number;
    img: string;
    title: string;
    subtitle: string;
}

interface profiledd {
    id: number;
    img: string;
    title: string;
    subtitle: string;
    link: string;
}

interface apps {
    id: number;
    img: string;
    title: string;
    subtitle: string;
    link: string;
}

interface quicklinks {
    id: number;
    title: string;
    link: string;
}

interface UserEntity {
    id: number;
    createdAt: string;
    creatorId: number;
    user_login: string;
    access_key: string;
    last_name: string;
    first_name: string;
    email: string;
    contact: string;
    status: number;
}

@Component({
    selector: 'app-header',
    imports: [
        RouterModule,
        CommonModule,
        NgScrollbarModule,
        TablerIconsModule,
        MaterialModule,
        TranslateModule
    ],
    templateUrl: './header.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
    @Input() showToggle = true;
    @Input() toggleChecked = false;
    @Output() toggleMobileNav = new EventEmitter<void>();
    @Output() toggleMobileFilterNav = new EventEmitter<void>();
    @Output() toggleCollapsed = new EventEmitter<void>();

    options = this.settings.getOptions();
    showFiller = false;
    user: UserEntity | null = null;

    public selectedLanguage: any = {
        language: 'Português',
        code: 'pt-BR',
        icon: '/assets/images/flag/icon-flag-ptbr.png',
    };

    public languages: any[] = [
        {
            language: 'Português',
            code: 'pt-BR',
            icon: '/assets/images/flag/icon-flag-ptbr.png',
        }
    ];

    @Output() optionsChange = new EventEmitter<AppSettings>();

    constructor(
        private settings: CoreService,
        private vsidenav: CoreService,
        public dialog: MatDialog,
        private translate: TranslateService,
        private authService: AuthService,
    ) {
        const lang = this.options.language || 'pt-BR';

        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
    }

    ngOnInit(): void {
        this.loadUserFromStorage();
    }

    logout(): void {
        this.authService.logout();
    }

    private loadUserFromStorage(): void {
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            try {
                this.user = JSON.parse(storedUser) as UserEntity;
            } catch (e) {
                console.error('Erro ao parsear usuário do localStorage', e);
                this.user = null;
            }
        }
    }

    get userFullName(): string {
        if (!this.user) return 'Usuário';
        const first = this.user.first_name ?? '';
        const last = this.user.last_name ?? '';
        const full = `${first} ${last}`.trim();
        return full || 'Usuário';
    }

    get userLogin(): string {
        return this.user?.user_login ?? '';
    }

    get userEmail(): string {
        return this.user?.email ?? '';
    }

    openLogoutDialog(enterAnimationDuration: string,
                     exitAnimationDuration: string): void {
        const dialogRef = this.dialog.open(LogoutConfirmDialogComponent, {
            width: '360px',
            enterAnimationDuration,
            exitAnimationDuration,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirm') {
                this.authService.logout();
            }
        });
    }

    openDialog() {
        const dialogRef = this.dialog.open(AppSearchDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            console.log(`Dialog result: ${result}`);
        });
    }

    changeLanguage(lang: any): void {
        this.translate.use(lang.code);
        this.selectedLanguage = lang;
    }

    setlightDark(theme: string) {
        this.options.theme = theme;
        this.emitOptions();

    }

    private emitOptions() {
        this.optionsChange.emit(this.options);
    }

    notifications: notifications[] = [
        // {
        //   id: 1,
        //   img: '/assets/images/profile/user-1.jpg',
        //   title: 'Roman Joined the Team!',
        //   subtitle: 'Congratulate him sf',
        // },
    ];

    profiledd: profiledd[] = [
        {
            id: 1,
            img: '/assets/images/svgs/icon-account.svg',
            title: 'Header.UserProfile.MyProfile',
            subtitle: 'Header.UserProfile.Settings',
            link: '/',
        },
    ];

    apps: apps[] = [
        // {
        //   id: 1,
        //   img: '/assets/images/svgs/icon-dd-chat.svg',
        //   title: 'Chat Application',
        //   subtitle: 'Messages & Emails',
        //   link: '/',
        // },
    ];

    quicklinks: quicklinks[] = [
        // {
        //   id: 1,
        //   title: 'Pricing Page',
        //   link: '/t',
        // },
    ];
}

@Component({
    selector: 'search-dialog',
    imports: [RouterModule, MaterialModule, TablerIconsModule, FormsModule],
    templateUrl: 'search-dialog.component.html',
})
export class AppSearchDialogComponent {
    searchText: string = '';
    navItems = navItems;

    navItemsData = navItems.filter((navitem) => navitem.displayName);

    // filtered = this.navItemsData.find((obj) => {
    //   return obj.displayName == this.searchinput;
    // });
}
