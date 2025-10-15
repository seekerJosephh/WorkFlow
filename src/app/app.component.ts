import { Component, HostBinding } from '@angular/core';
import { AuthService, ScreenService, AppInfoService } from './shared/services';
import { ThemeService } from './shared/services/theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes)
      .filter((cl) => this.screen.sizes[cl])
      .join(' ');
  }

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private screen: ScreenService,
    public appInfo: AppInfoService,
    private router: Router
  ) {}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit() {
    this.themeService.applyTheme();
    // Optionally, check authentication status and redirect to login if not authenticated
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login-form']);
    }
  }
}