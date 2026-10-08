package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.mapper.StudentDtoMapper;
import com.openclassrooms.etudiant.repository.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;


@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentDtoMapper studentDtoMapper;

    public StudentResponseDTO create(StudentRequestDTO studentRequestDTO) {
        if (studentRepository.existsByEmail(studentRequestDTO.getEmail())) {
            throw new IllegalArgumentException("Email already used by another student");
        }
        Student student = studentDtoMapper.toEntity(studentRequestDTO);
        Student savedStudent = studentRepository.save(student);
        return studentDtoMapper.toDto(savedStudent);
    }

    public StudentResponseDTO get(Long id) {
        Student student = findStudent(id);
        return studentDtoMapper.toDto(student);
    }

    public List<StudentResponseDTO> getAll() {
        return studentDtoMapper.toDtoList(studentRepository.findAll());
    }

    public void update(Long id, StudentRequestDTO studentRequestDTO) {
        Student student = findStudent(id);
        if (studentRepository.existsByEmailAndIdNot(studentRequestDTO.getEmail(), id)) {
            throw new IllegalArgumentException("Email already used by another student");
        }
        studentDtoMapper.updateEntity(studentRequestDTO, student);
        studentRepository.save(student);
    }

    public void delete(Long id) {
        Student student = findStudent(id);
        studentRepository.delete(student);
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id " + id));
    }
}
