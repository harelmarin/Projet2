import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { StudentDetailComponent } from './student-detail.component';
import { StudentService } from '../../core/service/student.service';

describe('StudentDetailComponent', () => {
  let fixture: ComponentFixture<StudentDetailComponent>;
  const student = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@mail.com' };
  const studentService = { getById: jest.fn() };

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentDetailComponent);
    fixture.detectChanges();
  }

  beforeEach(() => {
    studentService.getById.mockReset();
  });

  it('should load and display the student', async () => {
    studentService.getById.mockReturnValue(of(student));

    await setup();

    expect(studentService.getById).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.textContent).toContain('john.doe@mail.com');
  });

  it('should display an error when the student cannot be loaded', async () => {
    studentService.getById.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404, error: 'Student not found' })));

    await setup();

    expect(fixture.componentInstance.errorMessage).toBe('Student not found');
    expect(fixture.nativeElement.querySelector('.text-danger').textContent).toContain('Student not found');
  });
});
