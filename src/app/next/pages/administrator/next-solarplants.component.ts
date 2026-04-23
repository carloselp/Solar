import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {finalize} from 'rxjs/operators';
import {SolarplantDialogContentComponent} from 'src/app/pages/administrator/solarplant/solarplant-dialog-content.component';
import {SolarplantModel} from 'src/app/pages/administrator/solarplant/solarplant.component';
import {SolarplantService} from 'src/app/pages/administrator/solarplant/solarplant.service';

@Component({
    selector: 'app-next-solarplants',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './next-solarplants.component.html',
})
export class NextSolarplantsComponent {
    isLoading = false;
    search = '';
    plants: SolarplantModel[] = [];

    constructor(
        private readonly dialog: MatDialog,
        private readonly solarplantService: SolarplantService
    ) {
        this.loadPlants();
    }

    get filteredPlants(): SolarplantModel[] {
        return this.plants.filter((plant) =>
            plant.name.toLowerCase().includes(this.search.toLowerCase())
        );
    }

    loadPlants(): void {
        this.isLoading = true;
        this.solarplantService
            .getAll()
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (items) => (this.plants = items),
                error: () => (this.plants = []),
            });
    }

    openDialog(action: string, plant: Partial<SolarplantModel>): void {
        const ref = this.dialog.open(SolarplantDialogContentComponent, {
            data: {...plant, action},
        });

        ref.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }

            const payload = result.data as SolarplantModel;
            if (result.event === 'Add') {
                this.solarplantService.create(payload).subscribe(() => this.loadPlants());
            } else if (result.event === 'Update') {
                this.solarplantService.update(payload).subscribe(() => this.loadPlants());
            } else if (result.event === 'Delete') {
                this.solarplantService.delete(payload.id).subscribe(() => this.loadPlants());
            }
        });
    }
}
