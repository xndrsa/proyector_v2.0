import { Routes } from '@angular/router';
import { BibleComponent } from './pages/bible/bible.component';
import { SongsComponent } from './pages/songs/songs.component';

export const routes: Routes = [
  { path: 'bible', component: BibleComponent },
  { path: 'songs', component: SongsComponent },
  { path: '', redirectTo: 'bible', pathMatch: 'full' }, // Redirección predeterminada
  { path: '**', redirectTo: 'bible' }, // Redirección para rutas no existentes
];
