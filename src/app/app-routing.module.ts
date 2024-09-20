import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './features/login/login.component';
import { AuthRedirectComponent } from './features/auth-redirect/auth-redirect.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    title: 'Painel de Indicadores',
    path: 'pages',
    loadChildren: () => import('./pages/pages.module')
      .then(m => m.PagesModule),
    canActivateChild: [authGuard],
  },
  {
    title: 'Autorizando...',
    path: 'token',
    component: AuthRedirectComponent,
  },
  {
    title: 'Painel de Indicadores',
    path: 'login',
    component: LoginComponent,
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
