import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { merge, startWith } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';
import { LanguagePicker } from '../../shared/components/language-picker/language-picker';
import { ThemePicker } from '../../shared/components/theme-picker/theme-picker';
import { SidebarStateService } from './sidebar-state.service';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, ButtonModule, MenuModule, Sidebar, LanguagePicker, ThemePicker],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly lang = inject(LanguageService);
  protected readonly sidebarState = inject(SidebarStateService);
  protected readonly actionsOpen = signal(false);
  protected readonly languageDialogOpen = signal(false);
  protected readonly themeDialogOpen = signal(false);
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }

  private readonly translationTick = toSignal(
    merge(this.translate.onLangChange, this.translate.onTranslationChange).pipe(startWith(null)),
    { initialValue: null },
  );

  protected readonly userMenuItems = computed<MenuItem[]>(() => {
    this.translationTick();
    this.lang.current();
    const t = (key: string) => this.translate.instant(key);
    return [
      { label: t('profile'), icon: 'pi pi-user', command: () => this.router.navigateByUrl('/settings/profile') },
      { label: t('settings'), icon: 'pi pi-cog', command: () => this.router.navigateByUrl('/settings') },
      { label: t('language'), icon: 'pi pi-globe', command: () => this.languageDialogOpen.set(true) },
      { label: t('theme'), icon: 'pi pi-palette', command: () => this.themeDialogOpen.set(true) },
      { separator: true },
      { label: t('sign_out'), icon: 'pi pi-sign-out', command: () => this.logout() },
    ];
  });

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
