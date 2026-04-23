import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {finalize} from 'rxjs/operators';
import {PageDialogContentComponent} from 'src/app/pages/administrator/page/page-dialog-content.component';
import {PageModel} from 'src/app/pages/administrator/page/page.component';
import {PageService} from 'src/app/pages/administrator/page/page.service';

@Component({
    selector: 'app-next-pages',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './next-pages.component.html',
})
export class NextPagesComponent {
    isLoading = false;
    search = '';
    pages: PageModel[] = [];

    constructor(
        private readonly dialog: MatDialog,
        private readonly pageService: PageService
    ) {
        this.loadPages();
    }

    get filteredPages(): PageModel[] {
        return this.pages.filter((page) =>
            `${page.name_page} ${page.route} ${page.group_menu}`
                .toLowerCase()
                .includes(this.search.toLowerCase())
        );
    }

    loadPages(): void {
        this.isLoading = true;
        this.pageService
            .getAll()
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (items) => (this.pages = items),
                error: () => (this.pages = []),
            });
    }

    openDialog(action: string, page: Partial<PageModel>): void {
        const ref = this.dialog.open(PageDialogContentComponent, {
            data: {...page, action},
        });

        ref.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }

            const payload = result.data as PageModel;
            if (result.event === 'Add') {
                this.pageService.create(payload).subscribe(() => this.loadPages());
            } else if (result.event === 'Update') {
                this.pageService.update(payload).subscribe(() => this.loadPages());
            } else if (result.event === 'Delete') {
                this.pageService.delete(payload.id).subscribe(() => this.loadPages());
            }
        });
    }
}
