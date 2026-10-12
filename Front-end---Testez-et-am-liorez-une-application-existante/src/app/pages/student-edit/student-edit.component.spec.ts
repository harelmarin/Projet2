import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { StudentEditComponent } from './student-edit.component';
import { StudentService } from '../../core/service/student.service';

describe('StudentEditComponent', () => {
  let component: StudentEditComponent;
  let fixture: ComponentFixture<StudentEditComponent>;
  let router: Router;
  const student = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@mail.com' };
  const studentService = { getById: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    studentService.getById.mockReset().mockReturnValue(of(student));
    studentService.update.mockReset();
    await TestBed.configureTestingModule({
      imports: [StudentEditComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(StudentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the student in the form', () => {
    expect(studentService.getById).toHaveBeenCalledWith(1);
    expect(component.studentForm.value.email).toBe('john.doe@mail.com');
  });

  it('should not call the service when the form is invalid', () => {
    component.studentForm.patchValue({ firstName: '' });

    component.onSubmit();

    expect(studentService.update).not.toHaveBeenCalled();
  });

  it('should display the validation error when the form is invalid', () => {
    component.studentForm.patchValue({ firstName: '' });

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.invalid-feedback').textContent).toContain('First Name is required');
  });

  it('should update the student and go to the list', () => {
    studentService.update.mockReturnValue(of(undefined));
    component.studentForm.patchValue({ firstName: 'Jane' });

    component.onSubmit();

    expect(studentService.update).toHaveBeenCalledWith(1, { firstName: 'Jane', lastName: 'Doe', email: 'john.doe@mail.com' });
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
  });

  it('should display the error when the update fails', () => {
    studentService.update.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400, error: 'Email already used by another student' })));

    component.onSubmit();

    expect(component.errorMessage).toBe('Email already used by another student');
  });
});
