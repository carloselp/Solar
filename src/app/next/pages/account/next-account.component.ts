import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from 'src/app/pages/authentication/auth.service';
import {UserService} from 'src/app/pages/administrator/user/user.service';
import {
    AccountCompany,
    AccountPreferences,
    AccountProfile,
    AccountService,
} from './account.service';

interface StoredUser {
    id: number;
    first_name?: string;
    last_name?: string;
    user_login?: string;
    email?: string;
    contact?: string;
}

type AccountTab = 'dados' | 'empresa' | 'notificacoes' | 'seguranca';

type NotificationPreferences = {
    criticalEmail: boolean;
    whatsappAlerts: boolean;
    dailySummary: boolean;
    weeklySummary: boolean;
    lowPerformanceAlerts: boolean;
};

@Component({
    selector: 'app-next-account',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './next-account.component.html',
    styleUrl: './next-account.component.scss',
})
export class NextAccountComponent {
    readonly user = this.readUser();
    activeTab: AccountTab = 'dados';
    hidePassword = true;
    newPassword = '';
    isLoading = false;

    personalForm = this.readPersonalForm();
    companyForm = this.readCompanyForm();
    preferences = this.readPreferences();

    constructor(
        private readonly accountService: AccountService,
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly toastr: ToastrService
    ) {
        this.loadAccountData();
    }

    get fullName(): string {
        const fullName = `${this.personalForm.fullName}`.trim();
        return fullName || 'Usuário SmartGrid';
    }

    get initials(): string {
        return this.fullName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('');
    }

    get roleLabel(): string {
        return this.personalForm.role || 'Administrador';
    }

    get companyLabel(): string {
        return this.companyForm.companyName || 'Empresa não vinculada';
    }

    setTab(tab: AccountTab): void {
        this.activeTab = tab;
    }

    savePersonalData(): void {
        this.accountService
            .updateProfile({
                fullName: this.personalForm.fullName,
                role: this.personalForm.role,
                email: this.personalForm.email,
                contact: this.personalForm.contact,
            })
            .subscribe({
                next: (profile) => {
                    this.personalForm = {
                        fullName: profile.fullName,
                        role: profile.role || 'Administrador',
                        email: profile.email,
                        contact: profile.contact,
                    };
                    this.syncStoredUser(profile);
                    this.toastr.success('Dados pessoais atualizados com sucesso.', 'SmartGrid');
                },
                error: () => {
                    this.toastr.error('Não foi possível atualizar os dados pessoais.', 'SmartGrid');
                },
            });
    }

    savePreferences(): void {
        this.preferences.whatsappAlerts = false;
        this.accountService.updatePreferences(this.preferences).subscribe({
            next: (preferences) => {
                this.preferences = {
                    ...preferences,
                    whatsappAlerts: false,
                };
                this.toastr.success('Preferências de notificação salvas com sucesso.', 'SmartGrid');
            },
            error: () => {
                this.toastr.error('Não foi possível salvar as preferências.', 'SmartGrid');
            },
        });
    }

    updatePassword(): void {
        if (!this.user.id || !this.newPassword) {
            return;
        }

        this.userService.changePassword(this.user.id, this.newPassword).subscribe({
            next: () => {
                this.newPassword = '';
                this.toastr.success('Senha atualizada com sucesso.', 'SmartGrid');
            },
            error: () => {
                this.toastr.error('Não foi possível atualizar a senha.', 'SmartGrid');
            },
        });
    }

    logout(): void {
        this.authService.logout();
    }

    private readUser(): StoredUser {
        const raw = localStorage.getItem('user');
        if (!raw) {
            return {id: 0};
        }

        try {
            return JSON.parse(raw) as StoredUser;
        } catch {
            return {id: 0};
        }
    }

    private readPersonalForm(): {
        fullName: string;
        role: string;
        email: string;
        contact: string;
    } {
        return {
            fullName: `${this.user.first_name ?? ''} ${this.user.last_name ?? ''}`.trim(),
            role: 'Administrador',
            email: this.user.email ?? '',
            contact: this.user.contact ?? '',
        };
    }

    private readCompanyForm(): {
        companyName: string;
        document: string;
        city: string;
        state: string;
    } {
        return {
            companyName: 'INOVESOLAR Ltda',
            document: '12.345.678/0001-99',
            city: 'Fortaleza',
            state: 'CE',
        };
    }

    private readPreferences(): NotificationPreferences {
        return {
            criticalEmail: true,
            whatsappAlerts: false,
            dailySummary: false,
            weeklySummary: true,
            lowPerformanceAlerts: false,
        };
    }

    private loadAccountData(): void {
        this.isLoading = true;

        forkJoin({
            profile: this.accountService.getProfile(),
            company: this.accountService.getCompany(),
            preferences: this.accountService.getPreferences(),
        }).subscribe({
            next: ({profile, company, preferences}) => {
                this.applyProfile(profile);
                this.companyForm = company;
                this.preferences = {
                    ...preferences,
                    whatsappAlerts: false,
                };
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.toastr.error('Não foi possível carregar os dados da conta.', 'SmartGrid');
            },
        });
    }

    private applyProfile(profile: AccountProfile): void {
        this.personalForm = {
            fullName: profile.fullName,
            role: profile.role || 'Administrador',
            email: profile.email,
            contact: profile.contact,
        };
        this.syncStoredUser(profile);
    }

    private syncStoredUser(profile: AccountProfile): void {
        const updatedUser = {
            ...this.user,
            id: profile.id,
            first_name: this.extractFirstName(profile.fullName),
            last_name: this.extractLastName(profile.fullName),
            email: profile.email,
            contact: profile.contact,
            user_login: profile.user_login || this.user.user_login,
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    private extractFirstName(fullName: string): string {
        return fullName.trim().split(' ').filter(Boolean)[0] ?? '';
    }

    private extractLastName(fullName: string): string {
        return fullName.trim().split(' ').filter(Boolean).slice(1).join(' ');
    }
}
