import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/auth/auth.service';
import { SidebarStateService } from './sidebar-state.service';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, ButtonModule, Sidebar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  private readonly auth = inject(AuthService);
  protected readonly sidebarState = inject(SidebarStateService);
  protected readonly actionsOpen = signal(false);

  protected toggleActions(): void {
    this.actionsOpen.update((v) => !v);
    this.sidebarState.closeMobile();
  }

  protected toggleMobile(): void {
    this.sidebarState.toggleMobile();
    this.actionsOpen.set(false);
  }

  protected logout(): void {
    this.auth.signOut().subscribe();
  }
}
