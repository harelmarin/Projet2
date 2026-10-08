import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/Student';
import { StudentRequest } from '../models/StudentRequest';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly url = '/api/students';

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(this.url);
  }

  getById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`${this.url}/${id}`);
  }

  create(student: StudentRequest): Observable<Student> {
    return this.httpClient.post<Student>(this.url, student);
  }

  update(id: number, student: StudentRequest): Observable<void> {
    return this.httpClient.put<void>(`${this.url}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.url}/${id}`);
  }
}
