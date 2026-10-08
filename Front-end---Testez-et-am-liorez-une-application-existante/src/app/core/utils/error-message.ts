import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Server unreachable, please try again later.';
  }
  if (typeof error.error === 'string' && error.error) {
    return error.error;
  }
  if (error.error?.message) {
    return error.error.message;
  }
  return `Request failed (HTTP ${error.status}).`;
}
