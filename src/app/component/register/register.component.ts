import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { User } from 'src/app/model/user';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  public showLoading: boolean;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // custom methods
  public onRegister(user: User): void {
    this.showLoading = true;
    console.log(user);
    this.subscriptions.push(
      this.authenticationService.register(user).subscribe(
        (response: User) => {
          console.log(response);
          this.showLoading = false;
          this.showNotification(
            NotificationType.SUCCESS,
            `Register successfully, please check your email for password.`
          );
        },
        (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse);
          this.showNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
          this.showLoading = false;
        }
      )
    );
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
}
