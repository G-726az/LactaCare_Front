import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      (notification) => {
        if (notification.type === 'close') {
          this.removeNotification(notification.id);
          return;
        }
        
        this.notifications.push(notification);
        
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            this.removeNotification(notification.id);
          }, notification.duration);
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  onConfirm(notification: Notification): void {
    if (notification.onConfirm) {
      notification.onConfirm();
    }
    this.removeNotification(notification.id);
  }

  onCancel(notification: Notification): void {
    if (notification.onCancel) {
      notification.onCancel();
    }
    this.removeNotification(notification.id);
  }

  getNotificationClass(notification: Notification): string {
    return `notification-${notification.type}`;
  }
}