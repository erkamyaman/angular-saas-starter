import { Injectable, NgZone, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

type Severity = 'success' | 'info' | 'warn' | 'error';

export interface ToastOptions {
  params?: Record<string, unknown>;
  detail?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly zone = inject(NgZone);

  success(key: string, opts?: ToastOptions): void {
    this.show('success', key, opts, 3000);
  }

  info(key: string, opts?: ToastOptions): void {
    this.show('info', key, opts, 3000);
  }

  warn(key: string, opts?: ToastOptions): void {
    this.show('warn', key, opts, 5000);
  }

  error(key: string, opts?: ToastOptions): void {
    this.show('error', key, opts, 6000);
  }

  private show(severity: Severity, key: string, opts: ToastOptions | undefined, life: number): void {
    const summary = this.translate.instant(key, opts?.params);
    this.zone.run(() => {
      this.messages.add({ severity, summary, detail: opts?.detail, life });
    });
  }
}
