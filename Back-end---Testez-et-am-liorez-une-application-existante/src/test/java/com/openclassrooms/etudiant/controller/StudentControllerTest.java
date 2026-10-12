package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.StudentRepository;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.etudiant.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class StudentControllerTest {

    private static final String URL = "/api/students";
    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final String EMAIL = "john.doe@mail.com";
    private static final String LOGIN = "login";
    private static final String PASSWORD = "password";

    @Container
    static MySQLContainer mySQLContainer = new MySQLContainer("mysql:8.4");

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MockMvc mockMvc;

    private String authorization;

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> mySQLContainer.getJdbcUrl());
        registry.add("spring.datasource.username", () -> mySQLContainer.getUsername());
        registry.add("spring.datasource.password", () -> mySQLContainer.getPassword());
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }

    @BeforeEach
    public void beforeEach() {
        User user = new User();
        user.setFirstName(FIRST_NAME);
        user.setLastName(LAST_NAME);
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        userService.register(user);
        authorization = "Bearer " + userService.login(LOGIN, PASSWORD);
    }

    @AfterEach
    public void afterEach() {
        studentRepository.deleteAll();
        userRepository.deleteAll();
    }

    private Student saveStudent() {
        return studentRepository.save(new Student(null, FIRST_NAME, LAST_NAME, EMAIL));
    }

    private StudentRequestDTO request(String firstName, String lastName, String email) {
        StudentRequestDTO request = new StudentRequestDTO();
        request.setFirstName(firstName);
        request.setLastName(lastName);
        request.setEmail(email);
        return request;
    }

    @Test
    public void createStudent() throws Exception {
        // GIVEN
        StudentRequestDTO request = request(FIRST_NAME, LAST_NAME, EMAIL);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .content(objectMapper.writeValueAsString(request))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").isNotEmpty())
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value(EMAIL));

        // THEN
        assertThat(studentRepository.count()).isEqualTo(1);
    }

    @Test
    public void getAllStudents() throws Exception {
        // GIVEN
        saveStudent();

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.get(URL)
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].email").value(EMAIL));
    }

    @Test
    public void getStudent() throws Exception {
        // GIVEN
        Student student = saveStudent();

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.get(URL + "/" + student.getId())
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value(FIRST_NAME))
                .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value(LAST_NAME));
    }

    @Test
    public void updateStudent() throws Exception {
        // GIVEN
        Student student = saveStudent();
        StudentRequestDTO request = request("Jane", "Smith", "jane.smith@mail.com");

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.put(URL + "/" + student.getId())
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .content(objectMapper.writeValueAsString(request))
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNoContent());
        Student updated = studentRepository.findById(student.getId()).orElseThrow();

        // THEN
        assertThat(updated.getFirstName()).isEqualTo("Jane");
        assertThat(updated.getEmail()).isEqualTo("jane.smith@mail.com");
    }

    @Test
    public void deleteStudent() throws Exception {
        // GIVEN
        Student student = saveStudent();

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.delete(URL + "/" + student.getId())
                        .header(HttpHeaders.AUTHORIZATION, authorization))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNoContent());

        // THEN
        assertThat(studentRepository.count()).isZero();
    }
}
