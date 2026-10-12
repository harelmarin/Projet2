package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.mapper.StudentDtoMapper;
import com.openclassrooms.etudiant.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class StudentServiceTest {
    private static final Long ID = 1L;
    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final String EMAIL = "john.doe@mail.com";

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private StudentDtoMapper studentDtoMapper;
    @InjectMocks
    private StudentService studentService;

    @Test
    public void test_create_student() {
        // GIVEN
        StudentRequestDTO request = new StudentRequestDTO();
        request.setFirstName(FIRST_NAME);
        request.setLastName(LAST_NAME);
        request.setEmail(EMAIL);
        Student student = new Student(null, FIRST_NAME, LAST_NAME, EMAIL);
        Student savedStudent = new Student(ID, FIRST_NAME, LAST_NAME, EMAIL);
        StudentResponseDTO expected = new StudentResponseDTO(ID, FIRST_NAME, LAST_NAME, EMAIL);
        when(studentRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(studentDtoMapper.toEntity(request)).thenReturn(student);
        when(studentRepository.save(student)).thenReturn(savedStudent);
        when(studentDtoMapper.toDto(savedStudent)).thenReturn(expected);

        // WHEN
        StudentResponseDTO result = studentService.create(request);

        // THEN
        assertThat(result).isEqualTo(expected);
        verify(studentRepository).save(student);
    }

    @Test
    public void test_get_student() {
        // GIVEN
        Student student = new Student(ID, FIRST_NAME, LAST_NAME, EMAIL);
        StudentResponseDTO expected = new StudentResponseDTO(ID, FIRST_NAME, LAST_NAME, EMAIL);
        when(studentRepository.findById(ID)).thenReturn(Optional.of(student));
        when(studentDtoMapper.toDto(student)).thenReturn(expected);

        // WHEN
        StudentResponseDTO result = studentService.get(ID);

        // THEN
        assertThat(result).isEqualTo(expected);
    }

    @Test
    public void test_get_all_students() {
        // GIVEN
        List<Student> students = List.of(
                new Student(ID, FIRST_NAME, LAST_NAME, EMAIL),
                new Student(2L, "Jane", "Smith", "jane.smith@mail.com"));
        List<StudentResponseDTO> expected = List.of(
                new StudentResponseDTO(ID, FIRST_NAME, LAST_NAME, EMAIL),
                new StudentResponseDTO(2L, "Jane", "Smith", "jane.smith@mail.com"));
        when(studentRepository.findAll()).thenReturn(students);
        when(studentDtoMapper.toDtoList(students)).thenReturn(expected);

        // WHEN
        List<StudentResponseDTO> result = studentService.getAll();

        // THEN
        assertThat(result).isEqualTo(expected);
    }

    @Test
    public void test_update_student() {
        // GIVEN
        StudentRequestDTO request = new StudentRequestDTO();
        request.setFirstName(FIRST_NAME);
        request.setLastName(LAST_NAME);
        request.setEmail("new.mail@mail.com");
        Student student = new Student(ID, FIRST_NAME, LAST_NAME, EMAIL);
        when(studentRepository.findById(ID)).thenReturn(Optional.of(student));
        when(studentRepository.existsByEmailAndIdNot("new.mail@mail.com", ID)).thenReturn(false);

        // WHEN
        studentService.update(ID, request);

        // THEN
        verify(studentDtoMapper).updateEntity(request, student);
        verify(studentRepository).save(student);
    }

    @Test
    public void test_delete_student() {
        // GIVEN
        Student student = new Student(ID, FIRST_NAME, LAST_NAME, EMAIL);
        when(studentRepository.findById(ID)).thenReturn(Optional.of(student));

        // WHEN
        studentService.delete(ID);

        // THEN
        verify(studentRepository).delete(student);
    }
}
