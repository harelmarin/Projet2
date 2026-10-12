import { TestBed } from '@angular/core/testing';
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
});
