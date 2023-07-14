import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { Role } from 'src/app/enum/role.enum';
import { User } from 'src/app/model/user';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent {
  public loggedUser: User;
  public refreshing = false;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.getLoggedUser();
  }

  // custom functions
  public onResetPassword(form: NgForm): void {
    this.refreshing = true;
    const email = form.value['reset-password-email'];
    this.userService.resetPassword(email).subscribe(
      (response) => {
        console.log(response);
        this.notificationService.notify(
          NotificationType.SUCCESS,
          response.message
        );
        this.refreshing = false;
      },
      (errorResponse) => {
        this.showNotification(
          NotificationType.ERROR,
          errorResponse.error.message
        );
        this.refreshing = false;
      }
    );
  }

  // helper functions
  private getLoggedUser(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
  }

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

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  // getter
  public get isAdmin(): boolean {
    return (
      this.getUserRole() === Role.ADMIN ||
      this.getUserRole() === Role.SUPER_ADMIN
    );
  }

  public get isManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.MANAGER;
  }
}
