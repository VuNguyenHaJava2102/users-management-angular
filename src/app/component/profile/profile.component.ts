import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { User } from 'src/app/model/user';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  public user: User;
  public refreshing: boolean;
  public profileImage: File;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private notificationService: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.authenticationService.getUserFromLocalCache();
  }

  // custom functions
  public onSubmitUser(user: User): void {
    this.refreshing = true;
    let request = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
      notLocked: user.notLocked,
    };

    this.userService
      .updateUser(this.user.username, request, this.profileImage)
      .subscribe(
        (response: User) => {
          console.log('Updated user response:');
          console.log(response);

          this.showNotification(
            NotificationType.SUCCESS,
            `Update profile successfully.`
          );
          this.authenticationService.saveUserToLocalCache(response);
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.showNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
          this.refreshing = false;
        }
      );
  }

  public onLogout(): void {
    this.authenticationService.logout();
    this.router.navigateByUrl('/login');
    this.showNotification(
      NotificationType.SUCCESS,
      'You have been logged out successfully'
    );
  }

  public openInputProfileImage(): void {
    document.getElementById('inputProfileImage').click();
  }

  public inputProfileImageChange(file: File): void {
    this.profileImage = file;
    this.showThumbnail(file);
  }

  public updateProfileImage(): void {
    const formData = new FormData();
    formData.append('profileImage', this.profileImage);
    this.userService.updateProfileImage(formData, this.user.username).subscribe(
      (event: HttpEvent<any>) => {
        this.profileImage = null;
        this.showNotification(
          NotificationType.SUCCESS,
          'Update profile image successfully'
        );
      },
      (errorResponse) => {
        this.profileImage = null;
        this.showNotification(
          NotificationType.ERROR,
          errorResponse.error.message
        );
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

  private showThumbnail(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('thumbnail')['src'] = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}
