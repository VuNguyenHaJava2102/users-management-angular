import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { Role } from 'src/app/enum/role.enum';
import { User } from 'src/app/model/user';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent {
  private subscriptions: Subscription[] = [];

  public loggedUser: User;
  public users: User[];
  public refreshing = false;
  public detailUser: User;
  public editUser = new User();
  public profileImage: File;
  public usernameDelete: string;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUsers(true);
    this.getLoggedUser();
  }

  // custom functions
  public getUsers(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.users = response;
          this.userService.addUsersToLocalCache(response);
          this.refreshing = false;
          if (showNotification) {
            this.showNotification(
              NotificationType.SUCCESS,
              `${response.length} user(s) loaded successfully.`
            );
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.refreshing = false;
          this.showNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
        }
      )
    );
  }

  public openUserDetailsModal(user: User): void {
    this.detailUser = user;
    document.getElementById('openUserDetailsModalBtn').click();
  }

  // - add user
  public openImageInputAdd(): void {
    document.getElementById('imageInputAdd').click();
  }

  public imageInputChangeAdd(profileImage: File): void {
    this.showProfileThumbnail(profileImage, 'profileThumbnail');
    this.profileImage = profileImage;
  }

  public triggerSubmitAddUserFormBtn(): void {
    document.getElementById('saveNewUserBtn').click();
  }

  public onAddNewUser(userForm: NgForm): void {
    let request = { ...userForm.value };

    this.subscriptions.push(
      this.userService.addUser(request, this.profileImage).subscribe(
        (response: User) => {
          console.log(response);
          this.showNotification(
            NotificationType.SUCCESS,
            'Save new user successfully.'
          );
          document.getElementById('closeAddUserModalBtn').click();
          this.getUsers(false);
          this.profileImage = null;
          userForm.reset();
        },
        (errorResponse: HttpErrorResponse) => {
          this.showNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
        }
      )
    );
  }

  // - edit user
  public openEditUserModal(editUser: User): void {
    this.editUser = editUser;
    document.getElementById('openEditUserModalBtn').click();
  }

  public openImageInputEdit(): void {
    document.getElementById('imageInputEdit').click();
  }

  public imageInputChangeEdit(profileImage: File): void {
    this.showProfileThumbnail(profileImage, 'profileThumbnailEdit');
    this.profileImage = profileImage;
  }

  public triggerSubmitEditUserFormBtn(): void {
    document.getElementById('submitEditUserBtn').click();
  }

  public onEditUser(): void {
    let request = {
      firstName: this.editUser.firstName,
      lastName: this.editUser.lastName,
      username: this.editUser.username,
      email: this.editUser.email,
      role: this.editUser.role,
      active: this.editUser.active,
      notLocked: this.editUser.notLocked,
    };

    this.subscriptions.push(
      this.userService
        .updateUser(this.editUser.username, request, this.profileImage)
        .subscribe(
          (response: User) => {
            console.log('Updated user response:');
            console.log(response);

            this.showNotification(
              NotificationType.SUCCESS,
              `Edit user successfully: ${this.editUser.username}`
            );
            document.getElementById('closeEditUserModalBtn').click();
            this.getUsers(false);
            this.profileImage = null;
          },
          (errorResponse: HttpErrorResponse) => {
            this.showNotification(
              NotificationType.ERROR,
              errorResponse.error.message
            );
          }
        )
    );
  }

  // - delete user
  public openDeleteConfirmModal(username: string): void {
    document.getElementById('openDeleteConfirmModal').click();
    this.usernameDelete = username;
  }

  public deleteUser(): void {
    this.userService.deleteUser(this.usernameDelete).subscribe(
      (response) => {
        this.showNotification(
          NotificationType.SUCCESS,
          `Delete user: ${this.usernameDelete} successfully`
        );
        this.usernameDelete = null;
        this.getUsers(false);
        document.getElementById('closeDeleteConfirmModal').click();
      },
      (errorResponse) => {
        this.showNotification(
          NotificationType.ERROR,
          errorResponse.error.message
        );
        this.usernameDelete = null;
      }
    );
  }

  // helper functions
  private showNotification(type: NotificationType, message: string) {
    if (message) {
      this.notificationService.notify(type, message);
    } else {
      this.notificationService.notify(
        type,
        'An error occurred, please try again'
      );
    }
  }

  private showProfileThumbnail(file: File, thumbnail: string): void {
    let reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById(thumbnail)['src'] = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private getLoggedUser(): void {
    if (this.authenticationService.isUserLoggedIn) {
      this.loggedUser = this.authenticationService.getUserFromLocalCache();
      return;
    }
    this.router.navigateByUrl('/login');
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  // getter
  public get isSuperAdmin(): boolean {
    return this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isAdmin(): boolean {
    return (
      this.getUserRole() === Role.ADMIN ||
      this.getUserRole() === Role.SUPER_ADMIN
    );
  }

  public get isAdminOrManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.MANAGER;
  }
}
