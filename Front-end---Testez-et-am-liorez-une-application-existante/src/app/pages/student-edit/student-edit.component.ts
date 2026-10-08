import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';
import { StudentRequest } from '../../core/models/StudentRequest';
import { HttpErrorResponse } from '@angular/common/http';
import { getErrorMessage } from '../../core/utils/error-message';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-student-edit',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './student-edit.component.html',
  standalone: true
})
export class StudentEditComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  studentForm: FormGroup = new FormGroup({});
  studentId: number = Number(this.route.snapshot.paramMap.get('id'));
  submitted: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.studentForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      },
    );
    this.studentService.getById(this.studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((student: Student) => this.studentForm.patchValue(student));
  }

  get form() {
    return this.studentForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.studentForm.invalid) {
      return;
    }
    const student: StudentRequest = {
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      email: this.studentForm.get('email')?.value
    };
    this.studentService.update(this.studentId, student)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/students']),
        error: (error: HttpErrorResponse) => this.errorMessage = getErrorMessage(error)
      });
  }
}
