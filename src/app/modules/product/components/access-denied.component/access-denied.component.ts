// src/app/components/access-denied/access-denied.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss'
})

export class AccessDeniedComponent {
  constructor(private router: Router) { }

  goToProducts() {
    this.router.navigate(['/products']);
  }
}