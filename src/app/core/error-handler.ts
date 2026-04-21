import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from './services/toast.service';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    console.error('[AppErrorHandler]', error);
    const detail = error instanceof Error ? error.message : undefined;
    this.toast.error('unexpectedError', { detail });
  }
}
