import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';
import { getErrorMessage } from '../../core/utils/error-message';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './student-list.component.html',
  standalone: true
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  students: Student[] = [];
  errorMessage: string = '';

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students: Student[]) => this.students = students,
        error: (error: HttpErrorResponse) => this.errorMessage = getErrorMessage(error)
      });
  }

  onDelete(student: Student): void {
    this.errorMessage = '';
    this.studentService.delete(student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadStudents(),
        error: (error: HttpErrorResponse) => this.errorMessage = getErrorMessage(error)
      });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
