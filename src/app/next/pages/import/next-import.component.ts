import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';

@Component({
    selector: 'app-next-import',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './next-import.component.html',
    styleUrl: './next-import.component.scss',
})
export class NextImportComponent {
    fileName = '';
    previewRows: string[][] = [];
    validationMessage = 'Selecione um arquivo CSV para validar estrutura e pré-visualizar linhas.';

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) {
            return;
        }

        this.fileName = file.name;

        const reader = new FileReader();
        reader.onload = () => {
            const text = String(reader.result ?? '');
            const rows = text
                .split(/\r?\n/)
                .filter(Boolean)
                .slice(0, 6)
                .map((row) => row.split(',').map((cell) => cell.trim()));

            this.previewRows = rows;
            this.validationMessage =
                rows.length >= 2
                    ? 'Arquivo lido com sucesso. Validação local concluída para a prévia.'
                    : 'Estrutura insuficiente para pré-visualização.';
        };
        reader.readAsText(file);
    }
}
