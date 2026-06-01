import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SignInComponent } from './components/sign-in/sign-in.component';
import { GridComponent } from './components/grid/grid.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { HomeComponent } from './components/home/home.component';
import { NewGameComponent } from './components/new-game/new-game.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

const routes: Routes = [

  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'registro',
    component: SignInComponent
  },
  {
    path: 'grid',
    component: GridComponent
  },
  {
    path: 'nueva-partida',
    component: NewGameComponent
  },
  {
    path: 'perfil',
    component: ProfileComponent
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent
  },
  {
    path: 'login', // Nueva ruta para el componente de inicio de sesión
    component: LogInComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollOffset: [0, 70]
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
