import {Component, ViewChild} from '@angular/core';
import {MaterialModule} from '../../../material.module';
import {TablerIconsModule} from 'angular-tabler-icons';
import {MatNativeDateModule} from '@angular/material/core';
import {NgScrollbarModule} from 'ngx-scrollbar';
import {CommonModule, DatePipe} from '@angular/common';
import {MatTable} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../../services/core.service';
import {AppUserDialogContentComponent} from './user-dialog-content.component';
import {UserService} from 'src/app/pages/administrator/user/user.service';
import {ToastrService} from 'ngx-toastr';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {BaseCrudComponent} from 'src/app/shared/base-crud.component';
import {Observable, of, switchMap} from 'rxjs';
import {finalize, map} from "rxjs/operators";
import {UserProfileService} from "./user-profile.service";

export interface UserModel {
    id: number;
    user_login: string;
    last_name: string;
    first_name: string;
    email: string;
    contact: string;
    status: number;
    access_key: string;
    profileUserId: number;
    profileId: number;
    profileName: string;
}

export interface UserProfileModel {
    id: number;
    id_user: number;
    id_profile: number;
}

@Component({
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    imports: [
        MaterialModule,
        TablerIconsModule,
        MatNativeDateModule,
        NgScrollbarModule,
        CommonModule,
        TranslateModule,
        MatProgressSpinnerModule,
    ],
    providers: [DatePipe],
})
export class UserComponent extends BaseCrudComponent<UserModel> {
    options = this.settings.getOptions();

    @ViewChild(MatTable, {static: true})
    table: MatTable<UserModel> = Object.create(null);

    displayedColumns: string[] = [
        '#',
        'name',
        'email',
        'mobile',
        'profileName',
        'status',
        'action',
    ];

    constructor(
        dialog: MatDialog,
        translate: TranslateService,
        private settings: CoreService,
        private userService: UserService,
        private userProfileService: UserProfileService,
        toastr: ToastrService
    ) {
        super(dialog, translate, toastr);

        const lang = this.options.language || 'pt-BR';
        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
    }

    protected getAll$(): Observable<UserModel[]> {
        return this.userService.getAll();
    }

    protected override create$(user: UserModel): Observable<UserModel> {
        return this.userService.create(user).pipe(
            switchMap((created) => {
                if (!user.profileId || user.profileId <= 0) {
                    return of(created);
                }

                const userProfile: UserProfileModel = {
                    id: 0,
                    id_user: created.id,
                    id_profile: user.profileId,
                };

                return this.userProfileService.create(userProfile).pipe(
                    map(() => ({
                        ...created,
                        profileId: user.profileId,
                    }))
                );
            })
        );
    }

    protected override update$(user: UserModel): Observable<UserModel> {
        return this.userService.update(user).pipe(
            switchMap((updated) => {
                if (!user.profileId || user.profileId <= 0) {
                    return of(updated);
                }

                const userProfile: UserProfileModel = {
                    id: user.profileUserId,
                    id_user: updated.id,
                    id_profile: user.profileId,
                };

                if (userProfile.id == 0) {
                    return this.userProfileService.create(userProfile).pipe(
                        map(() => ({
                            ...updated,
                            profileId: user.profileId,
                        }))
                    );
                } else {
                    return this.userProfileService.update(userProfile).pipe(
                        map(() => ({
                            ...updated,
                            profileId: user.profileId,
                        }))
                    );
                }
            })
        );
    }

    protected delete$(id: number): Observable<void> {
        return this.userService.delete(id);
    }

    protected getId(user: UserModel): number {
        return user.id;
    }

    protected getDialogComponent() {
        return AppUserDialogContentComponent;
    }

    protected override handleDialogResult(result: any): void {
        super.handleDialogResult(result);

        if (result.event === 'Passkey') {
            this.changePasswordRowData(result.data);
        }
    }

    changePasswordRowData(row_obj: UserModel): boolean | any {
        if (!row_obj.id || !row_obj.access_key) {
            return false;
        }

        this.isLoading = true;

        this.userService
            .changePassword(row_obj.id, row_obj.access_key)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: () => {
                    const title = this.translate.instant('Common.Success');
                    const msg = this.translate.instant('Common.Successfully');
                    this.toastr.success(msg, title);
                },
                error: (err) => {
                    console.error('Erro ao alterar senha do usuário', err);
                },
            });

        return true;
    }
}
