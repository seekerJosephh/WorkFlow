import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import notify from 'devextreme/ui/notify';
import { AuthService } from '../../services';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  formData: any = { username: '', password: '', rememberMe: false };
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async onSubmit(e: Event) {
    e.preventDefault();
    this.loading = true;

    const { username, password, rememberMe } = this.formData;

    try {
      // for validate with AD
      // const result = await this.authService.login(username, password, rememberMe).toPromise();
      const result = true;
      this.loading = false;
      if (result) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigate([returnUrl]);
      } else {
        notify('Invalid username or password', 'error', 2000);
      }
    } catch (error: any) {
      this.loading = false;
      notify(error?.error?.message || 'Login failed. Please try again.', 'error', 2000);
    }
  }

  onCreateAccountClick() {
    this.router.navigate(['/create-account']);
  }
}
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    DxFormModule,
    DxLoadIndicatorModule
  ],
  declarations: [ LoginFormComponent ],
  exports: [ LoginFormComponent ]
})
export class LoginFormModule { }
