import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';
import { AuthService } from '../../core/service/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  const userService = { login: jest.fn() };
  const authService = { saveToken: jest.fn() };

  beforeEach(async () => {
    userService.login.mockReset();
    authService.saveToken.mockReset();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authService },
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call the service when the form is invalid', () => {
    component.onSubmit();

    expect(userService.login).not.toHaveBeenCalled();
    expect(component.submitted).toBe(true);
  });

  it('should save the token and go to the students list on success', () => {
    userService.login.mockReturnValue(of({ token: 'TOKEN' }));
    component.loginForm.setValue({ login: 'login', password: 'password' });

    component.onSubmit();

    expect(userService.login).toHaveBeenCalledWith({ login: 'login', password: 'password' });
    expect(authService.saveToken).toHaveBeenCalledWith('TOKEN');
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
  });

  it('should display the error message when the login fails', () => {
    userService.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400, error: 'Invalid credentials' })));
    component.loginForm.setValue({ login: 'login', password: 'wrong' });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(fixture.nativeElement.querySelector('.text-danger').textContent).toContain('Invalid credentials');
  });

  it('should reset the form', () => {
    component.loginForm.setValue({ login: 'login', password: 'password' });
    component.submitted = true;

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.loginForm.value).toEqual({ login: null, password: null });
  });

  it('should display a link to the register page', () => {
    const link = fixture.nativeElement.querySelector('a[href="/register"]');

    expect(link).not.toBeNull();
  });
});
