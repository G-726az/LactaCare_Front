import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DialogOptions, DialogResult } from '../../../../core/services/dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit, OnDestroy {
  show = false;
  options: DialogOptions = {
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showCancel: false
  };
  
  inputValue = '';
  private subscription!: Subscription;
  private callback: ((result: DialogResult) => void) | null = null;

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    this.subscription = this.dialogService.dialog$.subscribe(
      ({ options, callback }) => {
        this.options = { ...this.options, ...options };
        this.callback = callback;
        this.inputValue = options.inputValue || '';
        this.show = true;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  confirm(): void {
    if (this.callback) {
      this.callback({
        confirmed: true,
        value: this.inputValue || undefined
      });
    }
    this.close();
  }

  cancel(): void {
    if (this.callback) {
      this.callback({
        confirmed: false
      });
    }
    this.close();
  }

  close(): void {
    this.show = false;
    this.callback = null;
    this.inputValue = '';
  }

  getDialogClass(): string {
    return `dialog-${this.options.type}`;
  }

  getIconClass(): string {
    const icons: {[key: string]: string} = {
      'success': 'fa-check-circle',
      'error': 'fa-times-circle',
      'warning': 'fa-exclamation-triangle',
      'info': 'fa-info-circle',
      'question': 'fa-question-circle',
      'input': 'fa-keyboard'
    };
    
    return this.options.icon || icons[this.options.type || 'info'] || 'fa-info-circle';
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.confirm();
    } else if (event.key === 'Escape') {
      this.cancel();
    }
  }
}