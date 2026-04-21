import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  input,
  output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { EmptyState } from '../empty-state/empty-state';
import { DataTableCell } from './data-table-cell.directive';

export interface DataTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
}

export interface DataTableLazyEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: 1 | -1;
}

@Component({
  selector: 'app-data-table',
  imports: [TableModule, NgTemplateOutlet, EmptyState, TranslatePipe],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  readonly rows = input<Record<string, unknown>[]>([]);
  readonly columns = input.required<readonly DataTableColumn[]>();
  readonly loading = input(false, { transform: booleanAttribute });
  readonly dataKey = input<string>('id');
  readonly emptyIcon = input<string>('pi pi-inbox');
  readonly emptyTitle = input<string>('No data yet');
  readonly emptyDescription = input<string>('');

  readonly lazy = input(false, { transform: booleanAttribute });
  readonly paginator = input(false, { transform: booleanAttribute });
  readonly total = input<number>(0);
  readonly rowsPerPage = input<number>(10);
  readonly rowsPerPageOptions = input<number[]>([10, 25, 50]);

  readonly lazyLoad = output<DataTableLazyEvent>();

  protected readonly actionsTemplate = contentChild<TemplateRef<{ $implicit: Record<string, unknown> }>>('actions');
  private readonly cellDirectives = contentChildren(DataTableCell);

  private readonly cellMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const d of this.cellDirectives()) {
      map.set(d.appCell(), d.template);
    }
    return map;
  });

  protected readonly totalColSpan = computed(
    () => this.columns().length + (this.actionsTemplate() ? 1 : 0),
  );

  protected cellTemplateFor(field: string): TemplateRef<unknown> | undefined {
    return this.cellMap().get(field);
  }

  protected onLazy(e: TableLazyLoadEvent): void {
    const order = e.sortOrder === 1 || e.sortOrder === -1 ? e.sortOrder : undefined;
    this.lazyLoad.emit({
      first: e.first ?? 0,
      rows: e.rows ?? this.rowsPerPage(),
      sortField: typeof e.sortField === 'string' ? e.sortField : undefined,
      sortOrder: order,
    });
  }
}
