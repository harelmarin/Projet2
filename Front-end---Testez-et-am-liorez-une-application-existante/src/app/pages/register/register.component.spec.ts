import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../../core/service/user.service';
import { UserMockService } from '../../core/service/user-mock.service';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: UserMockService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a link to the login page', () => {
    const link = fixture.nativeElement.querySelector('a[href="/login"]');

    expect(link).not.toBeNull();
  });
});

describe('RegisterComponent actions', () => {
  let component: RegisterComponent;
  let router: Router;
  const userService = { register: jest.fn() };
  const user = { firstName: 'John', lastName: 'Doe', login: 'login', password: 'password' };

  beforeEach(async () => {
    userService.register.mockReset();
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService },
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not call the service when the form is invalid', () => {
    component.onSubmit();

    expect(userService.register).not.toHaveBeenCalled();
  });

  it('should register the user', () => {
    userService.register.mockReturnValue(of({}));
    component.registerForm.setValue(user);

    component.onSubmit();

    expect(userService.register).toHaveBeenCalledWith(user);
    expect(window.alert).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should reset the form', () => {
    component.registerForm.setValue(user);
    component.submitted = true;

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.registerForm.value.login).toBeNull();
  });
});
