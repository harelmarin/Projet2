package com.openclassrooms.etudiant.configuration.security;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CustomUserDetailServiceTest {
    private static final String LOGIN = "login";

    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private CustomUserDetailService customUserDetailService;

    @Test
    public void test_load_user_by_username() {
        // GIVEN
        User user = new User();
        user.setLogin(LOGIN);
        when(userRepository.findByLogin(LOGIN)).thenReturn(Optional.of(user));

        // WHEN
        UserDetails result = customUserDetailService.loadUserByUsername(LOGIN);

        // THEN
        assertThat(result.getUsername()).isEqualTo(LOGIN);
    }
}
