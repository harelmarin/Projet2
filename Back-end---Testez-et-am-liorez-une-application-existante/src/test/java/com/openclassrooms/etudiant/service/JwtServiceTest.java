package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

public class JwtServiceTest {
    private static final String LOGIN = "login";
    private static final String SECRET = "0123456789012345678901234567890123456789012345678901234567890123";
    private static final long EXPIRATION_MS = 3600000;

    private JwtService jwtService;

    @BeforeEach
    public void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "expirationMs", EXPIRATION_MS);
    }

    @Test
    public void test_generate_token() {
        // GIVEN
        User user = new User();
        user.setLogin(LOGIN);

        // WHEN
        String token = jwtService.generateToken(user);

        // THEN
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    public void test_extract_username() {
        // GIVEN
        User user = new User();
        user.setLogin(LOGIN);

        // WHEN
        String token = jwtService.generateToken(user);
        String username = jwtService.extractUsername(token);

        // THEN
        assertThat(username).isEqualTo(LOGIN);
    }
}
