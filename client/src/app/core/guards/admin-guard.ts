import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { SnackbarService } from '../services/snackbar.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const snackService = inject(SnackbarService);

  if (accountService.isAdmin()) {
    return true;
  } else {
    snackService.error('You are not an admin');
    router.navigateByUrl('/shop');
  }

  return false;
};
