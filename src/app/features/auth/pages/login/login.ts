import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ButtonModule, CardModule, InputTextModule, PasswordModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected readonly email = signal('');
  protected readonly password = signal('');

  protected onSubmit(): void {
    // TODO: auth not wired yet — connect to auth service once it lands.
  }
}
