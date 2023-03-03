import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { PlayComponent } from './pages/play/play.component';

const routes: Routes = [
  { path: 'lobby', component : LobbyComponent },
  { path: 'lobby/:id', component : LobbyComponent },
  { path: 'play', component : PlayComponent },
  { path: 'play/:id', component : PlayComponent },
  { path: '', pathMatch: 'full', redirectTo: '/lobby' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
