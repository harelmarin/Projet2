import { Routes } from '@angular/router';
import {RegisterComponent} from './pages/register/register.component';
import {LoginComponent} from './pages/login/login.component';
import {StudentListComponent} from './pages/student-list/student-list.component';
import {StudentDetailComponent} from './pages/student-detail/student-detail.component';
import {StudentAddComponent} from './pages/student-add/student-add.component';
import {StudentEditComponent} from './pages/student-edit/student-edit.component';
import {authGuard} from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'students',
    component: StudentListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'students/new',
    component: StudentAddComponent,
    canActivate: [authGuard]
  },
  {
    path: 'students/:id/edit',
    component: StudentEditComponent,
    canActivate: [authGuard]
  },
  {
    path: 'students/:id',
    component: StudentDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
