import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should save the token', () => {
    service.saveToken('TOKEN');

    expect(service.getToken()).toBe('TOKEN');
  });

  it('should be logged in when a token is saved', () => {
    service.saveToken('TOKEN');

    expect(service.isLoggedIn()).toBe(true);
  });

  it('should not be logged in without token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should remove the token on logout', () => {
    service.saveToken('TOKEN');

    service.logout();

    expect(service.getToken()).toBeNull();
  });
});
