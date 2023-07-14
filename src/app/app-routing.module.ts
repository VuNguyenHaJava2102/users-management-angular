import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { UserComponent } from './component/user/user.component';
import { SettingComponent } from './component/setting/setting.component';
import { AuthGuard } from './guard/auth.guard';
import { ProfileComponent } from './component/profile/profile.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'user/management',
    component: UserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user/settings',
    component: SettingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user/profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
