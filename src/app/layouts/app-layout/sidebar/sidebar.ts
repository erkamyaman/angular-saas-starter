import { Component, DestroyRef, afterNextRender, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { SidebarStateService } from '../sidebar-state.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = inject(SidebarStateService);

  protected readonly expandedGroups = signal(new Set<string>());
  protected readonly ready = signal(false);

  protected readonly sections: NavSection[] = [
    {
      label: 'main',
      items: [
        { label: 'dashboard', icon: 'pi pi-home', route: '/dashboard' },
        { label: 'reports', icon: 'pi pi-chart-bar', route: '/reports' },
      ],
    },
    {
      label: 'management',
      items: [
        {
          label: 'projects',
          icon: 'pi pi-folder',
          children: [
            { label: 'all_projects', icon: 'pi pi-list', route: '/projects' },
            { label: 'archived', icon: 'pi pi-inbox', route: '/projects/archived' },
          ],
        },
        {
          label: 'users',
          icon: 'pi pi-users',
          children: [
            { label: 'all_users', icon: 'pi pi-list', route: '/users' },
          ],
        },
      ],
    },
    {
      label: 'admin',
      items: [
        {
          label: 'settings',
          icon: 'pi pi-cog',
          children: [
            { label: 'profile', icon: 'pi pi-user', route: '/settings/profile' },
            { label: 'team', icon: 'pi pi-users', route: '/settings/team' },
            { label: 'billing', icon: 'pi pi-credit-card', route: '/settings/billing' },
          ],
        },
      ],
    },
  ];

  constructor() {
    this.state.setHovered(false);
    this.state.closeMobile();
    afterNextRender(() => this.ready.set(true));
    this.syncExpandedFromUrl(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        this.syncExpandedFromUrl(e.urlAfterRedirects);
        this.state.closeMobile();
        this.state.setHovered(false);
      });

    effect(() => {
      if (this.state.isNarrow()) {
        this.expandedGroups.set(new Set());
      }
    });
  }

  protected isGroupOpen(item: NavItem): boolean {
    return this.expandedGroups().has(item.label);
  }

  protected toggleGroup(item: NavItem): void {
    if (this.state.isNarrow()) return;
    this.expandedGroups.update((set) => {
      const next = new Set(set);
      if (next.has(item.label)) {
        next.delete(item.label);
      } else {
        next.add(item.label);
      }
      return next;
    });
  }

  private syncExpandedFromUrl(url: string): void {
    const path = url.split(/[?#]/)[0];
    const open = new Set(this.expandedGroups());
    for (const section of this.sections) {
      for (const item of section.items) {
        if (item.children?.some((c) => c.route && this.matchesRoute(path, c.route))) {
          open.add(item.label);
        }
      }
    }
    this.expandedGroups.set(open);
  }

  private matchesRoute(path: string, route: string): boolean {
    return path === route || path.startsWith(route + '/');
  }
}
