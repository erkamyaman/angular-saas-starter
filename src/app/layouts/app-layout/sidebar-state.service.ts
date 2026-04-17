import { Injectable, computed, effect, signal } from '@angular/core';

const SIDEBAR_LOCKED_KEY = 'app:sidebar-locked';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  readonly locked = signal(this.loadLocked());
  readonly hovered = signal(false);
  readonly isNarrow = computed(() => !this.locked() && !this.hovered());

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(SIDEBAR_LOCKED_KEY, String(this.locked()));
      } catch {
        // localStorage unavailable — ignore
      }
    });
  }

  toggleLock(): void {
    this.locked.update((v) => !v);
  }

  setHovered(hovered: boolean): void {
    this.hovered.set(hovered);
  }

  private loadLocked(): boolean {
    try {
      const v = localStorage.getItem(SIDEBAR_LOCKED_KEY);
      return v === null ? true : v === 'true';
    } catch {
      return true;
    }
  }
}
