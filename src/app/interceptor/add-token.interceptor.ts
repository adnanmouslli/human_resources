import { HttpInterceptorFn } from '@angular/common/http';

export const addTokenInterceptor: HttpInterceptorFn = (req, next) => {

  // debugger;
  // Get the token from local storage
  const token = localStorage.getItem('AccessToken');
    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedRequest);
    }
    
    return next(req);

};
