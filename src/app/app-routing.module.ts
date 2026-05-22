import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SignInComponent } from './components/sign-in/sign-in.component';
import { GridComponent } from './components/grid/grid.component';
import { LogInComponent } from './components/log-in/log-in.component';

const routes: Routes = [

  {
    path: '',
    component: SignInComponent
  },
  {
    path: 'grid',
    component: GridComponent
  },
  {
    path: 'login', // Nueva ruta para el componente de inicio de sesión
    component: LogInComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }