import { Component, NgModule, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService, IUser } from '../../services';
import { ThemeService } from '../../services/theme.service';
import { ThemeSelectorModule } from '../theme-selector/theme-selector.component';
import { UserPanelModule } from '../user-panel/user-panel.component';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';

import { currentTheme, getTheme, refreshTheme } from 'devextreme/viz/themes';

import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { DxPopupModule } from 'devextreme-angular';
import { RequestEmailFormComponent } from '../request-email-form/request-email-form.component';
@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  @Output() 
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  title!: string;

  user: IUser | null = { email: '' };
  userData: any = null; 
  isProfilePopupVisible = false;



  userMenuItems = [{
    text: 'Profile',
    icon: 'user',
    onClick: () => {
      this.isProfilePopupVisible = true;
    }
  },
  {
    text: 'Logout',
    icon: 'runner',
    onClick: () => {
      this.authService.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      sessionStorage.clear();
      this.user = null;
      this.userData = null;
      this.router.navigate(['/login-form'], { replaceUrl: true });
    }
  }];
    
  constructor(private authService: AuthService, private router: Router) {
  }
  

  ngOnInit() {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        this.userData = jwtDecode(token);
        console.log('Decoded user data:', this.userData);
        this.user = { email: this.userData.email || '' };

      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    UserPanelModule,
    DxPopupModule,
    DxToolbarModule,
    ThemeSelectorModule,
    UserPanelModule,
    RequestEmailFormComponent
  ],
  declarations: [ HeaderComponent ],
  exports: [ HeaderComponent ]
})
export class HeaderModule { }
