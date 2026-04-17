import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
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
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = inject(SidebarStateService);

  protected readonly expandedGroups = signal(new Set<string>());

  protected readonly sections: NavSection[] = [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
        { label: 'Reports', icon: 'pi pi-chart-bar', route: '/reports' },
      ],
    },
    {
      label: 'Management',
      items: [
        {
          label: 'Projects',
          icon: 'pi pi-folder',
          children: [
            { label: 'All Projects', icon: 'pi pi-list', route: '/projects' },
            { label: 'New Project', icon: 'pi pi-plus', route: '/projects/new' },
            { label: 'Archived', icon: 'pi pi-inbox', route: '/projects/archived' },
          ],
        },
        {
          label: 'Users',
          icon: 'pi pi-users',
          children: [
            { label: 'All Users', icon: 'pi pi-list', route: '/users' },
            { label: 'Invite', icon: 'pi pi-user-plus', route: '/users/invite' },
          ],
        },
      ],
    },
    {
      label: 'Admin',
      items: [
        {
          label: 'Settings',
          icon: 'pi pi-cog',
          children: [
            { label: 'Profile', icon: 'pi pi-user', route: '/settings/profile' },
            { label: 'Team', icon: 'pi pi-users', route: '/settings/team' },
            { label: 'Billing', icon: 'pi pi-credit-card', route: '/settings/billing' },
          ],
        },
      ],
    },
  ];

  constructor() {
    this.syncExpandedFromUrl(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => this.syncExpandedFromUrl(e.urlAfterRedirects));

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
    const open = new Set(this.expandedGroups());
    for (const section of this.sections) {
      for (const item of section.items) {
        if (item.children?.some((c) => c.route && url.startsWith(c.route))) {
          open.add(item.label);
        }
      }
    }
    this.expandedGroups.set(open);
  }
}
