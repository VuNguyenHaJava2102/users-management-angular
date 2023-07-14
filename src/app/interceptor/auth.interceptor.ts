import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../service/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(
    httpRequest: HttpRequest<any>,
    httpHandler: HttpHandler
  ): Observable<HttpEvent<any>> {
    const loginHost = `${this.authenticationService.host}/user/login`;
    const registerHost = `${this.authenticationService.host}/user/register`;
    if (
      httpRequest.url.includes(loginHost) ||
      httpRequest.url.includes(registerHost)
    ) {
      return httpHandler.handle(httpRequest);
    }

    this.authenticationService.loadToken();
    const token = this.authenticationService.getToken();
    const cloneRequest = httpRequest.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return httpHandler.handle(cloneRequest);
  }
}
