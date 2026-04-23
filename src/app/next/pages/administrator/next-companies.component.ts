import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {finalize} from 'rxjs/operators';
import {CompanyDialogContentComponent} from 'src/app/pages/administrator/company/company-dialog-content.component';
import {CompanyModel} from 'src/app/pages/administrator/company/company.component';
import {CompanyService} from 'src/app/pages/administrator/company/company.service';

@Component({
    selector: 'app-next-companies',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './next-companies.component.html',
})
export class NextCompaniesComponent {
    isLoading = false;
    search = '';
    companies: CompanyModel[] = [];

    constructor(
        private readonly dialog: MatDialog,
        private readonly companyService: CompanyService
    ) {
        this.loadCompanies();
    }

    get filteredCompanies(): CompanyModel[] {
        return this.companies.filter((company) =>
            `${company.name} ${company.document} ${company.city} ${company.state}`
                .toLowerCase()
                .includes(this.search.toLowerCase())
        );
    }

    loadCompanies(): void {
        this.isLoading = true;
        this.companyService
            .getAll()
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (items) => (this.companies = items),
                error: () => (this.companies = []),
            });
    }

    openDialog(action: string, company: Partial<CompanyModel>): void {
        const ref = this.dialog.open(CompanyDialogContentComponent, {
            data: {...company, action},
        });

        ref.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }

            const payload = result.data as CompanyModel;
            if (result.event === 'Add') {
                this.companyService.create(payload).subscribe(() => this.loadCompanies());
            } else if (result.event === 'Update') {
                this.companyService.update(payload).subscribe(() => this.loadCompanies());
            } else if (result.event === 'Delete') {
                this.companyService.delete(payload.id).subscribe(() => this.loadCompanies());
            }
        });
    }

    statusLabel(status: number): string {
        return status === 1 ? 'Ativa' : 'Inativa';
    }

    statusClass(status: number): string {
        return status === 1 ? 'active' : 'inactive';
    }
}
