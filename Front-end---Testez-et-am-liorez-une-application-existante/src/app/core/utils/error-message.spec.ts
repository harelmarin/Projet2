import { HttpErrorResponse } from '@angular/common/http';
import { getErrorMessage } from './error-message';

describe('getErrorMessage', () => {
  it('should return a message when the server is unreachable', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(getErrorMessage(error)).toBe('Server unreachable, please try again later.');
  });

  it('should return the error body when it is a string', () => {
    const error = new HttpErrorResponse({ status: 400, error: 'Invalid credentials' });

    expect(getErrorMessage(error)).toBe('Invalid credentials');
  });

  it('should return the message of the error body', () => {
    const error = new HttpErrorResponse({ status: 400, error: { message: 'Email already used' } });

    expect(getErrorMessage(error)).toBe('Email already used');
  });

  it('should return a default message with the status', () => {
    const error = new HttpErrorResponse({ status: 500 });

    expect(getErrorMessage(error)).toBe('Request failed (HTTP 500).');
  });
});
