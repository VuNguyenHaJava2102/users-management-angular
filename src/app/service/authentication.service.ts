import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from 'src/environments/environment';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public host = environment.apiUrl;
  private token: string;
  private loggedInUsername: string;
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {}

  public login(user: User): Observable<HttpResponse<User>> {
    return this.http.post<User>(`${this.host}/user/login`, user, {
      observe: 'response',
    });
  }
  // tham số thứ ba được truyền vào: { observe: 'response' } => trả lại toàn bộ response(có cả header) vì ta cần token

  public register(user: User): Observable<User> {
    return this.http.post<User>(`${this.host}/user/register`, user);
  }

  public logout(): void {
    this.token = null;
    this.loggedInUsername = null;
    localStorage.removeItem('user');
    localStorage.removeItem('users');
    localStorage.removeItem('token');
  }

  public loadToken(): void {
    this.token = localStorage.getItem('token');
  }

  public getToken(): string {
    return this.token;
  }

  public saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  public getUserFromLocalCache(): User {
    return JSON.parse(localStorage.getItem('user'));
  }

  public saveUserToLocalCache(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public isUserLoggedIn(): boolean {
    this.loadToken();
    if (this.token != null && this.token !== '') {
      let subject = this.jwtHelper.decodeToken(this.token).sub;
      if (subject != null && subject !== '') {
        if (!this.jwtHelper.isTokenExpired(this.token)) {
          this.loggedInUsername = subject;
          return true;
        }
        return false;
      }
      return false;
    } else {
      this.logout();
      return false;
    }
  }
}
