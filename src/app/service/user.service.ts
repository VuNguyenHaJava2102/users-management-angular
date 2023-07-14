import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../model/user';
import { CustomHttpResponse } from '../model/custom-http-response';

class AddUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  notLocked: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public getUsers(): Observable<User[] | HttpErrorResponse> {
    return this.http.get<User[]>(`${this.host}/user/list`);
  }

  public addUser(
    request: AddUserRequest,
    file: File
  ): Observable<User | HttpErrorResponse> {
    const formData = new FormData();
    formData.append('request', JSON.stringify(request));
    formData.append('profileImage', file);
    return this.http.post<User>(`${this.host}/user/add`, formData);
  }

  public updateUser(
    currentUsername: string,
    request: AddUserRequest,
    file: File
  ): Observable<User | HttpErrorResponse> {
    const formData = new FormData();
    formData.append('request', JSON.stringify(request));
    formData.append('profileImage', file);
    return this.http.post<User>(
      `${this.host}/user/update/${currentUsername}`,
      formData
    );
  }

  public resetPassword(email: string): Observable<any | HttpErrorResponse> {
    return this.http.get(`${this.host}/user/reset-password/${email}`);
  }

  public updateProfileImage(
    formData: FormData,
    username: string
  ): Observable<HttpEvent<User> | HttpErrorResponse> {
    return this.http.post<User>(
      `${this.host}/user/update-profile-image/${username}`,
      formData,
      { reportProgress: true, observe: 'events' }
    );
  }

  public deleteUser(
    username: string
  ): Observable<CustomHttpResponse | HttpErrorResponse> {
    return this.http.delete<CustomHttpResponse>(
      `${this.host}/user/delete/${username}`
    );
  }

  public addUsersToLocalCache(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  public getUsersFromLocalCache(): User[] {
    if (localStorage.getItem('users')) {
      return JSON.parse(localStorage.getItem('users'));
    }
    return null;
  }

  // public createUserFormData(
  //   loggedInUsername: string,
  //   user: User,
  //   profileImage: File
  // ): FormData {
  //   let formData = new FormData();
  //   formData.append('currentUsername', loggedInUsername);
  //   formData.append('firstName', user.firstName);
  //   formData.append('lastName', user.lastName);
  //   formData.append('username', user.username);
  //   formData.append('email', user.email);
  //   formData.append('role', user.role);
  //   formData.append('active', JSON.stringify(user.active));
  //   formData.append('notLocked', JSON.stringify(user.notLocked));
  //   formData.append('profileImage', profileImage);
  //   return formData;
  // }
}
