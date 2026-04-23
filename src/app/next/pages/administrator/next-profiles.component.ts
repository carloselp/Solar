import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {finalize} from 'rxjs/operators';
import {ProfilePagesDialogComponent} from 'src/app/pages/administrator/profile/profile-pages-dialog.component';
import {ProfileDialogContentComponent} from 'src/app/pages/administrator/profile/profile-dialog-content.component';
import {ProfileModel} from 'src/app/pages/administrator/profile/profile.component';
import {ProfileService} from 'src/app/pages/administrator/profile/profile.service';

@Component({
    selector: 'app-next-profiles',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './next-profiles.component.html',
})
export class NextProfilesComponent {
    isLoading = false;
    search = '';
    profiles: ProfileModel[] = [];

    constructor(
        private readonly dialog: MatDialog,
        private readonly profileService: ProfileService
    ) {
        this.loadProfiles();
    }

    get filteredProfiles(): ProfileModel[] {
        return this.profiles.filter((profile) =>
            profile.profile_name.toLowerCase().includes(this.search.toLowerCase())
        );
    }

    loadProfiles(): void {
        this.isLoading = true;
        this.profileService
            .getAll()
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (items) => (this.profiles = items),
                error: () => (this.profiles = []),
            });
    }

    openDialog(action: string, profile: Partial<ProfileModel>): void {
        const ref = this.dialog.open(ProfileDialogContentComponent, {
            data: {...profile, action},
        });

        ref.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }

            const payload = result.data as ProfileModel;
            if (result.event === 'Add') {
                this.profileService.create(payload).subscribe(() => this.loadProfiles());
            } else if (result.event === 'Update') {
                this.profileService.update(payload).subscribe(() => this.loadProfiles());
            } else if (result.event === 'Delete') {
                this.profileService.delete(payload.id).subscribe(() => this.loadProfiles());
            }
        });
    }

    openPagesDialog(profile: ProfileModel): void {
        const ref = this.dialog.open(ProfilePagesDialogComponent, {
            data: profile,
            width: '600px',
            disableClose: true,
        });

        ref.afterClosed().subscribe(() => this.loadProfiles());
    }
}
