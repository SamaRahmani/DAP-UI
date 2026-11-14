
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  finalize
} from 'rxjs';

import {
  ManagedUser,
  UserManagementService
} from '../../core/users/user-management.service';

type UserAction = 'promote' | 'demote' | 'enable' | 'disable';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {

  private readonly userService = inject(UserManagementService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly searchSubject = new Subject<string>();

  users: ManagedUser[] = [];

  searchTerm = '';
  loading = false;
  updatingUserId: number | null = null;

  errorMessage = '';
  successMessage = '';

  pendingAction: {
    user: ManagedUser;
    type: UserAction;
  } | null = null;

  ngOnInit(): void {
    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => {
      this.loadUsers(search);
    });
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter(user => user.enabled).length;
  }

  get inactiveUsers(): number {
    return this.users.filter(user => !user.enabled).length;
  }

  get adminUsers(): number {
    return this.users.filter(user =>
      user.roles.includes('ROLE_ADMIN')
    ).length;
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  loadUsers(search = this.searchTerm): void {
    this.loading = true;
    this.errorMessage = '';

    this.cdr.markForCheck();

    this.userService.getUsers(search)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: response => {
          this.users = [...response];
          this.cdr.markForCheck();
        },
        error: error => {
          this.errorMessage = this.getErrorMessage(
            error,
            'Unable to load users.'
          );
        }
      });
  }

  isAdmin(user: ManagedUser): boolean {
    return user.roles.includes('ROLE_ADMIN');
  }

  changeRole(user: ManagedUser): void {
    this.pendingAction = {
      user,
      type: this.isAdmin(user) ? 'demote' : 'promote'
    };
  }

  toggleStatus(user: ManagedUser): void {
    this.pendingAction = {
      user,
      type: user.enabled ? 'disable' : 'enable'
    };
  }

  cancelAction(): void {
    if (this.updatingUserId !== null) {
      return;
    }

    this.pendingAction = null;
  }

  confirmAction(): void {
    if (!this.pendingAction || this.updatingUserId !== null) {
      return;
    }

    const { user, type } = this.pendingAction;

    this.updatingUserId = user.id;
    this.errorMessage = '';
    this.successMessage = '';

    const request =
      type === 'promote' || type === 'demote'
        ? this.userService.changeRole(
            user.id,
            type === 'promote' ? 'ROLE_ADMIN' : 'ROLE_USER'
          )
        : this.userService.changeStatus(
            user.id,
            type === 'enable'
          );

    request.subscribe({
      next: updatedUser => {
        this.pendingAction = null;

        this.successMessage = this.getSuccessMessage(
          updatedUser.fullName,
          type
        );

        // Reload the authoritative data from the backend.
        this.refreshAfterUpdate();
      },

      error: error => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to complete this action.'
        );

        this.pendingAction = null;
        this.updatingUserId = null;

        this.cdr.markForCheck();
      }
    });
  }

  private refreshAfterUpdate(): void {
    this.userService.getUsers(this.searchTerm)
      .pipe(
        finalize(() => {
          this.updatingUserId = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: response => {
          this.users = [...response];
          this.cdr.markForCheck();
        },
        error: error => {
          this.errorMessage = this.getErrorMessage(
            error,
            'The change was saved, but the user list could not be refreshed. Please use Refresh Users.'
          );
        }
      });
  }

  private getSuccessMessage(
    fullName: string,
    type: UserAction
  ): string {
    switch (type) {
      case 'promote':
        return `${fullName} is now an administrator.`;

      case 'demote':
        return `${fullName} is now a regular user.`;

      case 'enable':
        return `${fullName}'s account has been enabled.`;

      case 'disable':
        return `${fullName}'s account has been disabled.`;
    }
  }

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.detail
      || error?.error?.message
      || error?.error?.error
      || error?.message
      || fallback;
  }
}
