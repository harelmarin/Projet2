import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { StudentAddComponent } from './student-add.component';
import { StudentService } from '../../core/service/student.service';

describe('StudentAddComponent', () => {
  let component: StudentAddComponent;
  let fixture: ComponentFixture<StudentAddComponent>;
  let router: Router;
  const studentService = { create: jest.fn() };
  const request = { firstName: 'John', lastName: 'Doe', email: 'john.doe@mail.com' };

  beforeEach(async () => {
    studentService.create.mockReset();
    await TestBed.configureTestingModule({
      imports: [StudentAddComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(StudentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call the service when the form is invalid', () => {
    component.onSubmit();

    expect(studentService.create).not.toHaveBeenCalled();
  });

  it('should create the student and go to the list', () => {
    studentService.create.mockReturnValue(of({ id: 1, ...request }));
    component.studentForm.setValue(request);

    component.onSubmit();

    expect(studentService.create).toHaveBeenCalledWith(request);
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
  });

  it('should display the error when the creation fails', () => {
    studentService.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400, error: 'Email already used by another student' })));
    component.studentForm.setValue(request);

    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Email already used by another student');
    expect(fixture.nativeElement.querySelector('.text-danger').textContent).toContain('Email already used');
  });

  it('should reset the form', () => {
    component.studentForm.setValue(request);
    component.submitted = true;

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.studentForm.value.email).toBeNull();
  });
});
