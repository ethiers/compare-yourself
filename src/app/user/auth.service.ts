import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observer, Subject} from 'rxjs';

import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';

import {User} from './user.model';

@Injectable()
export class AuthService {
  authIsLoading = new BehaviorSubject<boolean>(false);
  authDidFail = new BehaviorSubject<boolean>(false);
  authStatusChanged = new Subject<boolean>();

  constructor(private router: Router) {
  }

  signUp(username: string, email: string, password: string): void {
    this.authIsLoading.next(true);
    const user: User = {
      'username': username,
      'email': email,
      'password': password
    };
    const emailAttribute = {
      Name: 'email',
      Value: user.email
    };
    return;
  }

  confirmUser(username: string, code: string) {
    this.authIsLoading.next(true);
    const userData = {
      Username: username,
    };
  }

  signIn(username: string, password: string): void {
    this.authIsLoading.next(true);
    const authData = {
      Username: username,
      Password: password
    };
    this.authStatusChanged.next(true);
    return;
  }

  getAuthenticatedUser(): any {

    return;
  }

  logout() {
    this.authStatusChanged.next(false);
  }

  isAuthenticated(): Observable<boolean> {
    const user = this.getAuthenticatedUser();

    const obs = new Observable((observer: Observer<any>) => {
      if (!user) {
        observer.next(false);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
    return obs;
  }

  initAuth() {
    this.isAuthenticated().subscribe(
      (auth) => this.authStatusChanged.next(auth)
    );
  }
}
