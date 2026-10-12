import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../service/auth.service';

describe('authGuard', () => {
  let authService: AuthService;

  const executeGuard = () => TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    authService = TestBed.inject(AuthService);
  });

  it('should allow access when logged in', () => {
    authService.saveToken('TOKEN');

    expect(executeGuard()).toBe(true);
  });

  it('should redirect to /login when not logged in', () => {
    const result = executeGuard() as UrlTree;

    expect(result.toString()).toBe('/login');
  });
});
