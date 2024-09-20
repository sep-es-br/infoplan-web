import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const reqClone = req.clone({
    headers: req.headers.set(
      'Authorization',
      `Bearer ${sessionStorage.getItem('token')}`
    ),
  });

  return next(reqClone);
};
