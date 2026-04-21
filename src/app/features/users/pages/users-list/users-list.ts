import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  DataTable,
  DataTableColumn,
  DataTableLazyEvent,
} from '../../../../shared/components/data-table/data-table';
import { DataTableCell } from '../../../../shared/components/data-table/data-table-cell.directive';
import { ManagedUser, UserRole, UserStatus, UserWritable } from '../../models/user.model';
import { UserListParams, UsersService } from '../../users.service';
import { UserFormDialog } from '../../components/user-form-dialog/user-form-dialog';

@Component({
  selector: 'app-users-list',
  imports: [
    DatePipe,
    ButtonModule,
    TagModule,
    DataTable,
    DataTableCell,
    UserFormDialog,
    TranslatePipe,
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList {
  private readonly users = inject(UsersService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly rows = signal<ManagedUser[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<ManagedUser | null>(null);

  protected readonly rowsPerPage = 10;
  private currentParams: UserListParams = { first: 0, pageSize: this.rowsPerPage };

  protected readonly columns = signal<DataTableColumn[]>([]);

  constructor() {
    this.users.getSchema().subscribe((schema) => this.columns.set(schema.columns));
  }

  protected tableRows(): Record<string, unknown>[] {
    return this.rows() as unknown as Record<string, unknown>[];
  }

  protected onLazyLoad(e: DataTableLazyEvent): void {
    this.currentParams = {
      first: e.first,
      pageSize: e.rows,
      sortField: e.sortField,
      sortOrder: e.sortOrder,
    };
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.users.list(this.currentParams).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(user: ManagedUser): void {
    this.editing.set(user);
    this.dialogOpen.set(true);
  }

  protected onSubmit(data: UserWritable): void {
    const editing = this.editing();
    this.saving.set(true);
    const request$ = editing
      ? this.users.update(editing.id, data)
      : this.users.create(data);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogOpen.set(false);
        this.toast.success(editing ? 'userUpdated' : 'userCreated');
        this.fetch();
      },
      error: () => this.saving.set(false),
    });
  }

  protected confirmRemove(user: ManagedUser): void {
    this.confirm.danger({
      header: 'deleteUser',
      message: 'deleteUserConfirm',
      params: { name: `${user.firstName} ${user.lastName}` },
      accept: () => this.remove(user),
    });
  }

  private remove(user: ManagedUser): void {
    this.users.remove(user.id).subscribe({
      next: () => {
        this.toast.success('userDeleted');
        this.fetch();
      },
    });
  }

  protected severityFor(status: UserStatus): 'success' | 'info' | 'warn' | 'danger' {
    if (status === 'active') return 'success';
    if (status === 'invited') return 'info';
    if (status === 'disabled') return 'danger';
    return 'warn';
  }

  protected roleKey(role: UserRole): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  protected statusKey(status: UserStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
