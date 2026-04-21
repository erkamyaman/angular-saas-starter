import { Component, computed, effect, inject, input, model, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FieldError } from '../../../../shared/components/field-error/field-error';
import { ManagedUser, UserRole, UserStatus, UserWritable } from '../../models/user.model';

@Component({
  selector: 'app-user-form-dialog',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    FieldError,
    TranslatePipe,
  ],
  templateUrl: './user-form-dialog.html',
  styleUrl: './user-form-dialog.scss',
})
export class UserFormDialog {
  private readonly fb = inject(FormBuilder);

  readonly open = model.required<boolean>();
  readonly user = input<ManagedUser | null>(null);
  readonly saving = input(false);

  readonly submitForm = output<UserWritable>();

  protected readonly isEdit = computed(() => this.user() !== null);

  protected readonly roleOptions: { label: string; value: UserRole }[] = [
    { label: 'role_admin', value: 'admin' },
    { label: 'role_member', value: 'member' },
    { label: 'role_viewer', value: 'viewer' },
  ];

  protected readonly statusOptions: { label: string; value: UserStatus }[] = [
    { label: 'status_active', value: 'active' },
    { label: 'status_invited', value: 'invited' },
    { label: 'status_disabled', value: 'disabled' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.email]],
    role: this.fb.nonNullable.control<UserRole>('member', Validators.required),
    status: this.fb.nonNullable.control<UserStatus>('invited', Validators.required),
  });

  constructor() {
    effect(() => {
      if (this.open()) this.syncForm();
    });
  }

  private syncForm(): void {
    const u = this.user();
    if (u) {
      this.form.reset({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        status: u.status,
      });
    } else {
      this.form.reset({
        firstName: '',
        lastName: '',
        email: '',
        role: 'member',
        status: 'invited',
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitForm.emit(this.form.getRawValue());
  }

  protected onCancel(): void {
    this.open.set(false);
  }
}
