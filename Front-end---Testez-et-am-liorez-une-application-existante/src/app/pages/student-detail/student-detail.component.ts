import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';
import { getErrorMessage } from '../../core/utils/error-message';

@Component({
  selector: 'app-student-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './student-detail.component.html',
  standalone: true
})
export class StudentDetailComponent implements OnInit {
  private studentService = inject(StudentService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  student: Student | null = null;
  errorMessage: string = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.studentService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student: Student) => this.student = student,
        error: (error: HttpErrorResponse) => this.errorMessage = getErrorMessage(error)
      });
  }
}
