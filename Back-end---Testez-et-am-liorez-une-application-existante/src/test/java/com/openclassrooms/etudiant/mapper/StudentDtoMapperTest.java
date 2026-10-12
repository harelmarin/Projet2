package com.openclassrooms.etudiant.mapper;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class StudentDtoMapperTest {
    private static final Long ID = 1L;
    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final String EMAIL = "john.doe@mail.com";

    private final StudentDtoMapper studentDtoMapper = new StudentDtoMapperImpl();

    @Test
    public void test_to_entity() {
        // GIVEN
        StudentRequestDTO request = new StudentRequestDTO();
        request.setFirstName(FIRST_NAME);
        request.setLastName(LAST_NAME);
        request.setEmail(EMAIL);

        // WHEN
        Student student = studentDtoMapper.toEntity(request);

        // THEN
        assertThat(student).isEqualTo(new Student(null, FIRST_NAME, LAST_NAME, EMAIL));
    }

    @Test
    public void test_to_dto() {
        // GIVEN
        Student student = new Student(ID, FIRST_NAME, LAST_NAME, EMAIL);

        // WHEN
        StudentResponseDTO dto = studentDtoMapper.toDto(student);

        // THEN
        assertThat(dto).isEqualTo(new StudentResponseDTO(ID, FIRST_NAME, LAST_NAME, EMAIL));
    }

    @Test
    public void test_to_dto_list() {
        // GIVEN
        List<Student> students = List.of(
                new Student(ID, FIRST_NAME, LAST_NAME, EMAIL),
                new Student(2L, "Jane", "Smith", "jane.smith@mail.com"));

        // WHEN
        List<StudentResponseDTO> dtos = studentDtoMapper.toDtoList(students);

        // THEN
        assertThat(dtos).containsExactly(
                new StudentResponseDTO(ID, FIRST_NAME, LAST_NAME, EMAIL),
                new StudentResponseDTO(2L, "Jane", "Smith", "jane.smith@mail.com"));
    }

    @Test
    public void test_update_entity() {
        // GIVEN
        Student student = new Student(ID, FIRST_NAME, LAST_NAME, EMAIL);
        StudentRequestDTO request = new StudentRequestDTO();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setEmail("jane.smith@mail.com");

        // WHEN
        studentDtoMapper.updateEntity(request, student);

        // THEN
        assertThat(student).isEqualTo(new Student(ID, "Jane", "Smith", "jane.smith@mail.com"));
    }
}
