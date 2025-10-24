import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { catchError, map, Observable, of } from 'rxjs';

export interface IUser {
  email: string;
  avatarUrl?: string
}


@Injectable()
// export class AuthService {
//   private _user: IUser | null = defaultUser;
//   get loggedIn(): boolean {
//     return !!this._user;
//   }

//   private _lastAuthenticatedPath: string = defaultPath;
//   set lastAuthenticatedPath(value: string) {
//     this._lastAuthenticatedPath = value;
//   }

//   constructor(private router: Router) { }

//   async logIn(email: string, password: string) {

//     try {
//       // Send request
//       console.log(email, password);
//       this._user = { ...defaultUser, email };
//       this.router.navigate([this._lastAuthenticatedPath]);

//       return {
//         isOk: true,
//         data: this._user
//       };
//     }
//     catch {
//       return {
//         isOk: false,
//         message: "Authentication failed"
//       };
//     }
//   }

//   async getUser() {
//     try {
//       // Send request

//       return {
//         isOk: true,
//         data: this._user
//       };
//     }
//     catch {
//       return {
//         isOk: false,
//         data: null
//       };
//     }
//   }

//   async createAccount(email: string, password: string) {
//     try {
//       // Send request
//       console.log(email, password);

//       this.router.navigate(['/create-account']);
//       return {
//         isOk: true
//       };
//     }
//     catch {
//       return {
//         isOk: false,
//         message: "Failed to create account"
//       };
//     }
//   }

//   async changePassword(email: string, recoveryCode: string) {
//     try {
//       // Send request
//       console.log(email, recoveryCode);

//       return {
//         isOk: true
//       };
//     }
//     catch {
//       return {
//         isOk: false,
//         message: "Failed to change password"
//       }
//     };
//   }

//   async resetPassword(email: string) {
//     try {
//       // Send request
//       console.log(email);

//       return {
//         isOk: true
//       };
//     }
//     catch {
//       return {
//         isOk: false,
//         message: "Failed to reset password"
//       };
//     }
//   }

//   async logOut() {
//     this._user = null;
//     this.router.navigate(['/login-form']);
//   }
// }

export class AuthService {
  loggedIn = false;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<boolean> {
    const loginUrl = 'http://172.16.199.157:3000/api/login'; 
    return this.http.post<{ success: boolean, message?: string, data?: { token: string, role: string } }>(loginUrl, { username, password }).pipe(
      map((response) => {
        if (response.success && response.data?.token) {
          this.loggedIn = true;
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('userRole', response.data.role);
          sessionStorage.setItem('authToken', response.data.token);
          return true;
        }
        return false;
      }),
      catchError((error) => {
        this.loggedIn = false;
        return of(false);
      })
    );
  }
  
  logout(): void {
    this.loggedIn = false;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return this.loggedIn || !!localStorage.getItem('authToken') || !!sessionStorage.getItem('authToken');
  }

  async createAccount(username: string, password: string): Promise<{ isOk: boolean, message?: string }> {
    const createAccountUrl = 'http://172.16.199.157:3000/api/create-account';
    try {
      const response = await this.http
        .post<{ success: boolean, message?: string, data?: { username: string } }>(createAccountUrl, { username, password })
        .toPromise();
      return { isOk: response?.success?? false, message: response?.message };
    } catch (error: any) {
      return { isOk: false, message: error?.error?.message || 'Failed to create account' };
    }
  }

  async resetPassword(username: string): Promise<{ isOk: boolean, message?: string, recoveryCode?: string }> {
    const resetPasswordUrl = 'http://172.16.199.157:3000/api/reset-password';
    try {
      const response = await this.http
        .post<{ success: boolean, message?: string, data?: { recoveryCode: string } }>(resetPasswordUrl, { username })
        .toPromise();
      return { isOk: response?.success?? false, message: response?.message, recoveryCode: response?.data?.recoveryCode };
    } catch (error: any) {
      return { isOk: false, message: error?.error?.message || 'Failed to reset password' };
    }
  }

  async changePassword(password: string, recoveryCode: string): Promise<{ isOk: boolean, message?: string }> {
    const changePasswordUrl = 'http://172.16.199.157:3000/api/change-password';
    try {
      const response = await this.http
        .post<{ success: boolean, message?: string, data?: { username: string } }>(changePasswordUrl, { password, recoveryCode })
        .toPromise();
      return { isOk: response?.success??false, message: response?.message };
    } catch (error: any) {
      return { isOk: false, message: error?.error?.message || 'Failed to change password' };
    }
  }

  async getUser(): Promise<{ data: any }> {
    const getUserUrl = 'http://172.16.199.157:3000/api/user'; 
    try {
      const response = await this.http.get<{ success: boolean, data: any }>(getUserUrl).toPromise();
      if (response?.success) {
        return { data: response.data };
      }
      throw new Error('User not found');
    } catch (error) {
      throw error;
    }
  }
}
@Injectable()
// export class AuthGuardService implements CanActivate {
//   constructor(private router: Router, private authService: AuthService) { }

//   canActivate(route: ActivatedRouteSnapshot): boolean {
//     const isLoggedIn = this.authService.loggedIn;
//     const isAuthForm = [
//       'login-form',
//       'reset-password',
//       'create-account',
//       'change-password/:recoveryCode'
//     ].includes(route.routeConfig?.path || defaultPath);

//     if (isLoggedIn && isAuthForm) {
//       this.authService.lastAuthenticatedPath = defaultPath;
//       this.router.navigate([defaultPath]);
//       return false;
//     }

//     if (!isLoggedIn && !isAuthForm) {
//       this.router.navigate(['/login-form']);
//     }

//     if (isLoggedIn) {
//       this.authService.lastAuthenticatedPath = route.routeConfig?.path || defaultPath;
//     }

//     return isLoggedIn || isAuthForm;
//   }
// }
// export class AuthGuardService implements CanActivate {
//   constructor(private authService: AuthService, private router: Router) {}

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
//     if (this.authService.loggedIn) {
//       return true; // Allow access if authenticated
//     } else {
//       // Redirect to login page and store the attempted URL for redirecting after login
//       this.router.navigate(['/login-form'], { queryParams: { returnUrl: state.url } });
//       return false;
//     }
//   }
// }

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // const token = localStorage.getItem ('authToken');

    // if (token) {
    //   try {
        
    //     const decoded: any = jwtDecode(token);
    //     const currentTIme = Math.floor(Date.now() / 1000);

    //     if (decoded.exp && decoded.exp < currentTIme) {
    //       console.log('Token expired, clearing localStorage');
    //       localStorage.removeItem('authToken');
    //       localStorage.removeItem('userRole');        
    //       this.router.navigate(['/login-form'], { queryParams: { returnUrl: state.url } });
    //       return false;
    //     }

    //     if (!decoded['Employee Code'] || !decoded['Email']) {
    //       console.log('Invalid token, clearing localStorage');
    //       localStorage.removeItem('authToken');
    //       localStorage.removeItem('userRole');
    //       this.router.navigate(['/login-form'], { queryParams: { returnUrl: state.url } });
    //       return false;
    //     }

    //     // if valid token
    //     return true; 

    //   } catch (error) {
    //     console.log('Error decoding token: ', error);
    //     localStorage.removeItem('authToken');
    //     localStorage.removeItem('userRole');
    //     this.router.navigate(['/login-form'], { queryParams: { returnUrl: state.url } });
    //     return false;
    //   } 
    // } else {
    //   console.log('No authToken found, redirecting to login');
    //   this.router.navigate(['/login-form'], { queryParams: { returnUrl: state.url } });
    //   return false;
    // }








    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login-form'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}