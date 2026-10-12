import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let router: Router;
  const students: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@mail.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@mail.com' },
  ];
  const studentService = { getAll: jest.fn(), delete: jest.fn() };
  const authService = { logout: jest.fn() };

  beforeEach(async () => {
    studentService.getAll.mockReset().mockReturnValue(of(students));
    studentService.delete.mockReset();
    authService.logout.mockReset();
    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: AuthService, useValue: authService },
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display one row per student', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(component.students).toEqual(students);
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('john.doe@mail.com');
  });

  it('should delete a student and reload the list', () => {
    studentService.delete.mockReturnValue(of(undefined));

    component.onDelete(students[0]);

    expect(studentService.delete).toHaveBeenCalledWith(1);
    expect(studentService.getAll).toHaveBeenCalledTimes(2);
  });

  it('should display an error when the list cannot be loaded', () => {
    studentService.getAll.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    component.loadStudents();

    expect(component.errorMessage).toBe('Request failed (HTTP 500).');
  });

  it('should display an error when the delete fails', () => {
    studentService.delete.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404, error: 'Student not found' })));

    component.onDelete(students[0]);

    expect(component.errorMessage).toBe('Student not found');
  });

  it('should logout and go to the login page', () => {
    component.onLogout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
