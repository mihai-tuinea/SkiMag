import { Route } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';
import { OrderDetailedComponent } from './order-detailed/order-detailed.component';
import { OrderComponent } from './order.component';

export const OrderRoutes: Route[] = [
  { path: '', component: OrderComponent, canActivate: [authGuard] },
  { path: ':id', component: OrderDetailedComponent, canActivate: [authGuard] },
];
