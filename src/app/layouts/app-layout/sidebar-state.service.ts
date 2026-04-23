import { Injectable, computed, effect, signal } from '@angular/core';
import { MOBILE_QUERY } from '../../shared/constants';

const SIDEBAR_LOCKED_KEY = 'app:sidebar-locked';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  readonly locked = signal(this.loadLocked());
  readonly hovered = signal(false);
  readonly isMobile = signal(this.matchesMobile());
  readonly mobileOpen = signal(false);
  readonly isNarrow = computed(() => !this.isMobile() && !this.locked() && !this.hovered());

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(SIDEBAR_LOCKED_KEY, String(this.locked()));
      } catch {
        // localStorage unavailable \u2014 ignore
      }
    });

    if (typeof window !== 'undefined') {
      const mq = window.matchMedia(MOBILE_QUERY);
      mq.addEventListener('change', (e) => {
        this.isMobile.set(e.matches);
        if (!e.matches) this.mobileOpen.set(false);
      });
    }
  }

  toggleLock(): void {
    this.locked.update((v) => !v);
  }

  setHovered(hovered: boolean): void {
    this.hovered.set(hovered);
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  private loadLocked(): boolean {
    try {
      const v = localStorage.getItem(SIDEBAR_LOCKED_KEY);
      return v === null ? true : v === 'true';
    } catch {
      return true;
    }
  }

  private matchesMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  }
}
