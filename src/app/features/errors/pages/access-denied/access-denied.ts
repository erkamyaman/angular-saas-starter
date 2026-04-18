import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-access-denied',
  imports: [RouterLink, ButtonModule],
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss',
})
export class AccessDenied {
  private readonly route = inject(ActivatedRoute);
  protected readonly permission = this.route.snapshot.queryParamMap.get('permission');
}
