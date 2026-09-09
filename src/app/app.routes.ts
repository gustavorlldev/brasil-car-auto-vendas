import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Brasil Cars',
  },
  {
    path: 'comprar',
    loadComponent: () => import('./pages/vehicles/vehicles.component').then((m) => m.VehiclesComponent),
    title: 'Estoque | Brasil Cars',
  },
  {
    path: 'veiculo/:slug',
    loadComponent: () =>
      import('./pages/vehicle-detail/vehicle-detail.component').then((m) => m.VehicleDetailComponent),
    title: 'Veículo | Brasil Cars',
  },
  {
    path: 'favoritos',
    loadComponent: () => import('./pages/favorites/favorites.component').then((m) => m.FavoritesComponent),
    title: 'Favoritos | Brasil Cars',
  },
  {
    path: 'comparar',
    loadComponent: () => import('./pages/compare/compare.component').then((m) => m.CompareComponent),
    title: 'Comparar | Brasil Cars',
  },
  {
    path: 'sobre',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'Sobre | Brasil Cars',
  },
  {
    path: 'contato',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contato | Brasil Cars',
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq.component').then((m) => m.FaqComponent),
    title: 'Perguntas frequentes | Brasil Cars',
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then((m) => m.AdminComponent),
    title: 'Painel | Brasil Cars',
  },
  { path: '**', redirectTo: '' },
];
