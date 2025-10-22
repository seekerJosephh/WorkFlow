import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DxDataGridModule, DxFormModule, DxFileManagerModule, DxPopupModule } from 'devextreme-angular';
import { LoginFormComponent, ResetPasswordFormComponent, CreateAccountFormComponent, ChangePasswordFormComponent } from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { CreateDocComponent } from './pages/createDoc/createDoc.component';
import { ViewPendingComponent } from './pages/viewPending/viewPending.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ApprovalComponent } from './pages/approvalDoc/approvalDoc.component';



const routes: Routes = [
  {
    path: '',
    redirectTo: 'login-form',
    pathMatch: 'full',
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordFormComponent,
  },
  {
    path: 'create-account',
    component: CreateAccountFormComponent,
  },
  {
    path: 'change-password/:recoveryCode',
    component: ChangePasswordFormComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'createDoc',
    component: CreateDocComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'viewPending',
    component: ViewPendingComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'approvalDoc',
    component: ApprovalComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: '**',
    redirectTo: 'login-form',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    DxDataGridModule,
    DxFormModule,
    DxFileManagerModule,
    DxPopupModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [],
})
export class AppRoutingModule {}