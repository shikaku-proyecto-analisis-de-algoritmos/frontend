import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SignInComponent } from './components/sign-in/sign-in.component';
import { GridComponent } from './components/grid/grid.component';

const routes: Routes = [

  {
    path: '',
    component: SignInComponent
  },
  {
    path: 'grid',
    component: GridComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }