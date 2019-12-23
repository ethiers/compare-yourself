import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observer, Subject} from 'rxjs';

import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool, CognitoUserSession
} from 'amazon-cognito-identity-js';

import {User} from './user.model';

// STEP Use case 1
// Use case 1. Registering a user with the application. One needs to create a CognitoUserPool object by providing a UserPoolId and a ClientId
// and signing up by using a username, password, attribute list, and validation data.

// step 1.1 -- se-compare-yourself-webclient
const POOL_DATA = {
  UserPoolId: 'ca-central-1_****',
  ClientId: '*****'
};

// step 1.2
const userPool = new CognitoUserPool(POOL_DATA);


@Injectable()
export class AuthService {
  authIsLoading = new BehaviorSubject<boolean>(false);
  authDidFail = new BehaviorSubject<boolean>(false);
  authStatusChanged = new Subject<boolean>();
  registeredUser: CognitoUser;

  constructor(private router: Router) {
  }

  signUp(username: string, email: string, password: string): void {
    this.authIsLoading.next(true);
    const user: User = {
      'username': username,
      'email': email,
      'password': password
    };

    // step 1.3
    const attrList: CognitoUserAttribute[] = [];

    const emailAttribute = {
      Name: 'email',
      Value: user.email
    };

    // step 1.4
    attrList.push(new CognitoUserAttribute((emailAttribute)));
    userPool.signUp(user.username, user.password, attrList, null, (err, result) => {
      if (err) {
        this.authDidFail.next(true);
        this.authIsLoading.next(false);
        return;
      }

      // success
      this.authDidFail.next(false);
      this.authIsLoading.next(false);
      this.registeredUser = result.user;
    });
    return;
  }

  confirmUser(username: string, code: string) {

    this.authIsLoading.next(true);
    const userData = {
      Username: username,
      Pool: userPool  // add the userPool
    };

    // Use case 2 - Confirming a registered, unauthenticated user using a confirmation code received via SMS.
    const cognityUser = new CognitoUser(userData);
    cognityUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        this.authDidFail.next(true);
        this.authIsLoading.next(false);
        return;
      }
      this.authDidFail.next(false);
      this.authIsLoading.next(false);
      this.router.navigate(['/']);
    });
  }

  signIn(username: string, password: string): void {
    this.authIsLoading.next(true);

    // Cognito require CapitalUpperCase
    const authData = {
      Username: username,
      Password: password
    };

    // Use case 4. Authenticating a user and establishing a user session with the Amazon Cognito Identity service.
    const authDetails = new AuthenticationDetails(authData);
    const userData = {
      Username: username,
      Pool: userPool
    };

    const cognitoUser = new CognitoUser(userData);
    const that = this;

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result: CognitoUserSession) => {
        that.authStatusChanged.next(true);
        that.authDidFail.next(false);
        that.authIsLoading.next(false);
        console.log(result);
      },
      onFailure: (err) => {
        that.authDidFail.next(true);
        that.authIsLoading.next(false);
        console.log(err);
      }
    });

    this.authStatusChanged.next(true);
    return;
  }

  getAuthenticatedUser(): CognitoUser | null {
    // step #3 - get the current user
    return userPool.getCurrentUser();
  }

  logout() {

    if (this.getAuthenticatedUser()) {
      this.getAuthenticatedUser().signOut();
      this.authStatusChanged.next(false);
    }
  }

  isAuthenticated(): Observable<boolean> {

    const user = this.getAuthenticatedUser();

    const obs = new Observable((observer: Observer<boolean>) => {
      if (!user) {
        observer.next(false);
      } else {
        user.getSession((err, session) => {
          if (err) {
            observer.next(false);
          } else {
            if (session.isValid()) {
              observer.next(true);
            } else {
              observer.next(false);
            }
          }
        });
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
