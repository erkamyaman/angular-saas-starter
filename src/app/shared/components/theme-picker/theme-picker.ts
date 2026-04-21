import { Component, inject, model } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { COLOR_OPTIONS, ThemeColor, ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-theme-picker',
  imports: [DialogModule, TranslatePipe],
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.scss',
})
export class ThemePicker {
  private readonly theme = inject(ThemeService);

  readonly visible = model(false);

  protected readonly options = COLOR_OPTIONS;
  protected readonly current = this.theme.current;

  protected select(code: ThemeColor): void {
    this.theme.set(code);
    this.visible.set(false);
  }
}
