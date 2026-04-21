import { EnvironmentInjector, ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from './services/toast.service';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly injector = inject(EnvironmentInjector);

  handleError(error: unknown): void {
    console.error('[AppErrorHandler]', error);
    const detail =
      error instanceof Error ? error.message
        : typeof error === 'string' ? error
          : (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string')
            ? (error as { message: string }).message
            : undefined;
    const toast = this.injector.get(ToastService);
    toast.error('unexpected_error', { detail });
  }
}
