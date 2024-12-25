import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BibleComponent } from './pages/bible/bible.component';
import { SongsComponent } from './pages/songs/songs.component';
import { WindowProjectorComponent } from './pages/window-projector/window-projector.component';

export const routes: Routes = [
  { path: 'bible', component: BibleComponent },
  { path: 'songs', component: SongsComponent },
  { path: 'presentation', component: WindowProjectorComponent },
  { path: '', redirectTo: 'bible', pathMatch: 'full' }, // Redirección predeterminada
  { path: '**', redirectTo: 'bible' }, // Redirección para rutas no existentes
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}