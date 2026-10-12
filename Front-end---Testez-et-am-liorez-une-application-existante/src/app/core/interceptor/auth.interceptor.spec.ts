import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../service/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add the Authorization header when a token exists', () => {
    authService.saveToken('TOKEN');

    httpClient.get('/api/students').subscribe();

    const req = httpTestingController.expectOne('/api/students');
    expect(req.request.headers.get('Authorization')).toBe('Bearer TOKEN');
  });

  it('should not add the Authorization header without token', () => {
    httpClient.get('/api/students').subscribe();

    const req = httpTestingController.expectOne('/api/students');
    expect(req.request.headers.has('Authorization')).toBe(false);
  });

  it('should logout and go to the login page on a 401', () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    authService.saveToken('TOKEN');

    httpClient.get('/api/students').subscribe({ error: () => undefined });
    httpTestingController.expectOne('/api/students').flush('', { status: 401, statusText: 'Unauthorized' });

    expect(authService.getToken()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not redirect on a 401 from the login request', () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    httpClient.post('/api/login', {}).subscribe({ error: () => undefined });
    httpTestingController.expectOne('/api/login').flush('', { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
