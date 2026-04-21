import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

export interface ConfirmOptions {
  header: string;
  message: string;
  params?: Record<string, unknown>;
  acceptKey?: string;
  rejectKey?: string;
  icon?: string;
  accept: () => void;
  reject?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly confirmation = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);

  ask(opts: ConfirmOptions): void {
    this.open(opts, {
      icon: 'pi pi-question-circle',
      acceptKey: 'confirm',
    });
  }

  danger(opts: ConfirmOptions): void {
    this.open(
      opts,
      {
        icon: 'pi pi-exclamation-triangle',
        acceptKey: 'delete',
      },
      { severity: 'danger' },
    );
  }

  private open(
    opts: ConfirmOptions,
    defaults: { icon: string; acceptKey: string },
    acceptButtonProps?: { severity: 'danger' | 'warn' | 'success' },
  ): void {
    const t = (key: string) => this.translate.instant(key, opts.params);
    this.confirmation.confirm({
      header: t(opts.header),
      message: t(opts.message),
      icon: opts.icon ?? defaults.icon,
      acceptLabel: t(opts.acceptKey ?? defaults.acceptKey),
      rejectLabel: t(opts.rejectKey ?? 'cancel'),
      acceptButtonProps,
      accept: opts.accept,
      reject: opts.reject,
    });
  }
}
