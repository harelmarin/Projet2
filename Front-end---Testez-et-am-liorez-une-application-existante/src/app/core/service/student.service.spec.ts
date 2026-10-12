import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { Student } from '../models/Student';
import { StudentRequest } from '../models/StudentRequest';

describe('StudentService', () => {
  let service: StudentService;
  let httpTestingController: HttpTestingController;
  const student: Student = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@mail.com' };
  const request: StudentRequest = { firstName: 'John', lastName: 'Doe', email: 'john.doe@mail.com' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(StudentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get all students', () => {
    let result: Student[] = [];
    service.getAll().subscribe(students => result = students);

    const req = httpTestingController.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush([student]);

    expect(result).toEqual([student]);
  });

  it('should get a student by id', () => {
    let result: Student | undefined;
    service.getById(1).subscribe(response => result = response);

    const req = httpTestingController.expectOne('/api/students/1');
    expect(req.request.method).toBe('GET');
    req.flush(student);

    expect(result).toEqual(student);
  });

  it('should create a student', () => {
    let result: Student | undefined;
    service.create(request).subscribe(response => result = response);

    const req = httpTestingController.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(student);

    expect(result).toEqual(student);
  });

  it('should update a student', () => {
    service.update(1, request).subscribe();

    const req = httpTestingController.expectOne('/api/students/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(null);
  });

  it('should delete a student', () => {
    service.delete(1).subscribe();

    const req = httpTestingController.expectOne('/api/students/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
