import {
    OnInit,
    AfterViewInit,
    ViewChild, Directive,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ComponentType } from '@angular/cdk/portal';

/**
 * Base genérico para CRUDs de tabela com:
 * - dataSource + paginator
 * - isLoading
 * - loadItems
 * - add/update/delete
 * - openDialog com Add/Update/Delete
 */
@Directive()
export abstract class BaseCrudComponent<T> implements OnInit, AfterViewInit {
    /** DataSource genérico da tabela */
    dataSource = new MatTableDataSource<T>([]);

    /** Controle de loading global do CRUD */
    isLoading = false;

    /** Colunas exibidas na tabela (cada componente define as suas) */
    abstract displayedColumns: string[];

    /** Paginator da tabela */
    @ViewChild(MatPaginator)
    paginator!: MatPaginator;

    /** Texto de busca (se quiser usar) */
    searchText: any;

    protected constructor(
        protected dialog: MatDialog,
        protected translate: TranslateService,
        protected toastr: ToastrService
    ) {}

    // ------------------- Ciclo de vida -------------------

    ngOnInit(): void {
        this.loadItems();
    }

    ngAfterViewInit(): void {
        if (this.paginator) {
            this.dataSource.paginator = this.paginator;
        }
    }

    // ------------------- Métodos abstratos (cada filho implementa) -------------------

    /** Service: buscar todos */
    protected abstract getAll$(): Observable<T[]>;

    /** Service: criar */
    protected abstract create$(item: T): Observable<T>;

    /** Service: atualizar */
    protected abstract update$(item: T): Observable<T>;

    /** Service: deletar por id */
    protected abstract delete$(id: number): Observable<void>;

    /** Como pegar o ID de uma entidade */
    protected abstract getId(item: T): number;

    /** Qual componente de diálogo abrir (por ex: AppUserDialogContentComponent) */
    protected abstract getDialogComponent(): ComponentType<any>;

    // ------------------- CRUD genérico -------------------

    /** Carrega todos os itens da API e alimenta a tabela */
    protected loadItems(): void {
        this.isLoading = true;

        this.getAll$()
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (items) => {
                    this.dataSource.data = items;
                },
                error: (err) => {
                    console.error('Erro ao carregar itens', err);
                    const title = this.translate.instant('Common.Error');
                    const msg = this.translate.instant('Common.Unsuccessful');
                    this.toastr.error(msg, title);
                },
            });
    }

    /** Filtro padrão da tabela */
    applyFilter(filterValue: string): void {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    /** ADD genérico */
    protected addRowData(row_obj: T): void {
        this.isLoading = true;

        this.create$(row_obj)
            //.pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: () => {
                    const title = this.translate.instant('Common.Success');
                    const msg = this.translate.instant('Common.Successfully');
                    this.toastr.success(msg, title);

                    this.loadItems();
                },
                error: (err) => {
                    console.error('Erro ao adicionar item', err);
                },
            });
    }

    /** UPDATE genérico */
    protected updateRowData(row_obj: T): boolean | any {
        const id = this.getId(row_obj);
        if (!id) {
            return false;
        }

        this.isLoading = true;

        this.update$(row_obj)
            //.pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: () => {
                    const title = this.translate.instant('Common.Success');
                    const msg = this.translate.instant('Common.Successfully');
                    this.toastr.success(msg, title);

                    this.loadItems();
                },
                error: (err) => {
                    console.error('Erro ao atualizar item', err);
                },
            });

        return true;
    }

    /** DELETE genérico */
    protected deleteRowData(row_obj: T): boolean | any {
        const id = this.getId(row_obj);
        if (!id) {
            return false;
        }

        this.isLoading = true;

        this.delete$(id)
            //.pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: () => {
                    const title = this.translate.instant('Common.Success');
                    const msg = this.translate.instant('Common.Successfully');
                    this.toastr.success(msg, title);

                    this.loadItems();
                },
                error: (err) => {
                    console.error('Erro ao excluir item', err);
                },
            });

        return true;
    }

    // ------------------- Diálogo genérico (Add / Update / Delete) -------------------

    /**
     * Abre um dialog usando o componente retornado por getDialogComponent()
     * e trata as ações básicas: Add, Update, Delete.
     *
     * Componentes filhos podem:
     *  - usar esse método diretamente
     *  - OU sobrescrever handleDialogResult para adicionar mais actions (ex: Passkey)
     */
    openDialog(action: string, obj: any): void {
        obj.action = action;

        const dialogRef = this.dialog.open(this.getDialogComponent(), {
            data: obj,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }

            this.handleDialogResult(result);
        });
    }

    /**
     * Trata o resultado do dialog. Por padrão:
     *  - Add    -> addRowData
     *  - Update -> updateRowData
     *  - Delete -> deleteRowData
     *
     * Componentes filhos podem sobrescrever esse método e chamar super.handleDialogResult(result)
     * para manter o comportamento padrão e adicionar novos "event".
     */
    protected handleDialogResult(result: any): void {
        if (result.event === 'Add') {
            this.addRowData(result.data);
        } else if (result.event === 'Update') {
            this.updateRowData(result.data);
        } else if (result.event === 'Delete') {
            this.deleteRowData(result.data);
        }
    }
}
