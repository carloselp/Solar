import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {finalize, map, of, switchMap} from 'rxjs';
import {UserModel, UserProfileModel} from 'src/app/pages/administrator/user/user.component';
import {AppUserDialogContentComponent} from 'src/app/pages/administrator/user/user-dialog-content.component';
import {UserService} from 'src/app/pages/administrator/user/user.service';
import {UserProfileService} from 'src/app/pages/administrator/user/user-profile.service';

@Component({
    selector: 'app-next-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './next-users.component.html',
    styleUrl: './next-users.component.scss',
})
export class NextUsersComponent {
    isLoading = false;
    search = '';
    selectedStatus = '';
    selectedProfile = '';
    users: UserModel[] = [];

    constructor(
        private readonly dialog: MatDialog,
        private readonly userService: UserService,
        private readonly userProfileService: UserProfileService
    ) {
        this.loadUsers();
    }

    get filteredUsers(): UserModel[] {
        return this.users.filter((user) => {
            const bySearch = this.search
                ? `${user.first_name} ${user.last_name} ${user.email} ${user.user_login} ${user.companyName ?? ''}`
                      .toLowerCase()
                      .includes(this.search.toLowerCase())
                : true;
            const byStatus = this.selectedStatus
                ? String(user.status) === this.selectedStatus
                : true;
            const byProfile = this.selectedProfile
                ? user.profileName === this.selectedProfile
                : true;
            return bySearch && byStatus && byProfile;
        });
    }

    get profileOptions(): string[] {
        return Array.from(new Set(this.users.map((user) => user.profileName).filter(Boolean)));
    }

    loadUsers(): void {
        this.isLoading = true;
        this.userService
            .getAll()
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (items) => (this.users = items),
                error: () => (this.users = []),
            });
    }

    openDialog(action: string, user: Partial<UserModel>): void {
        const ref = this.dialog.open(AppUserDialogContentComponent, {
            data: {...user, action},
        });

        ref.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }

            const payload = result.data as UserModel;
            if (result.event === 'Add') {
                this.createUser(payload);
            } else if (result.event === 'Update') {
                this.updateUser(payload);
            } else if (result.event === 'Delete') {
                this.deleteUser(payload.id);
            } else if (result.event === 'Passkey') {
                this.userService
                    .changePassword(payload.id, payload.access_key)
                    .subscribe(() => this.loadUsers());
            }
        });
    }

    statusLabel(status: number): string {
        return status === 1 ? 'Ativo' : 'Inativo';
    }

    statusClass(status: number): string {
        return status === 1 ? 'active' : 'inactive';
    }

    private createUser(user: UserModel): void {
        this.userService
            .create(user)
            .pipe(
                switchMap((created) => {
                    if (!user.profileId) {
                        return of(created);
                    }

                    const profile: UserProfileModel = {
                        id: 0,
                        id_user: created.id,
                        id_profile: user.profileId,
                    };

                    return this.userProfileService.create(profile).pipe(map(() => created));
                })
            )
            .subscribe(() => this.loadUsers());
    }

    private updateUser(user: UserModel): void {
        this.userService
            .update(user)
            .pipe(
                switchMap((updated) => {
                    if (!user.profileId) {
                        return of(updated);
                    }

                    const profile: UserProfileModel = {
                        id: user.profileUserId,
                        id_user: updated.id,
                        id_profile: user.profileId,
                    };

                    if (!profile.id) {
                        return this.userProfileService.create(profile).pipe(map(() => updated));
                    }

                    return this.userProfileService.update(profile).pipe(map(() => updated));
                })
            )
            .subscribe(() => this.loadUsers());
    }

    private deleteUser(id: number): void {
        this.userService.delete(id).subscribe(() => this.loadUsers());
    }
}
