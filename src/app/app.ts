import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './modules/product/components/header.component/header.component';
import { Subscription } from 'rxjs';
import { AuthService } from './modules/product/services/auth.service';
import { RoleService } from './modules/product/services/role.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App implements OnInit, OnDestroy {
  protected readonly title = signal('despensaR');
  isLoggedIn = false;
  isGenericUser = false;
  private authSubscription!: Subscription;
  private genericUserSubscription!: Subscription;

  constructor(private authService: AuthService, private roleService: RoleService) { }

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated().subscribe(
      (authenticated) => {
        this.isLoggedIn = authenticated;
      }
    );

    this.genericUserSubscription = this.authService.isGenericUser().subscribe(
      (isGeneric) => {
        this.isGenericUser = isGeneric;
      }
    );
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.genericUserSubscription) {
      this.genericUserSubscription.unsubscribe();
    }
  }
}