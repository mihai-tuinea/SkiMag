import { Route } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';
import { cartGuard } from '../../core/guards/cart-guard';
import { orderCompleteGuard } from '../../core/guards/order-complete-guard';
import { CheckoutSuccessComponent } from './checkout-success/checkout-success.component';
import { CheckoutComponent } from './checkout.component';

export const CheckoutRoutes: Route[] = [
  { path: '', component: CheckoutComponent, canActivate: [authGuard, cartGuard] },
  {
    path: 'success',
    component: CheckoutSuccessComponent,
    canActivate: [authGuard, orderCompleteGuard],
  },
];
