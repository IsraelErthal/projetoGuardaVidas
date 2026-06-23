package com.example.demo.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class JwtFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private FilterChain filterChain;

    private JwtFilter jwtFilter;

    @BeforeEach
    void setup() {

        MockitoAnnotations.openMocks(this);

        jwtFilter = new JwtFilter(jwtUtil);

        SecurityContextHolder.clearContext();
    }

    // =========================================================
    // TESTES UNITÁRIOS
    // =========================================================

    @Test
    @DisplayName("Deve autenticar usuário com token válido")
    void autenticarUsuarioComTokenValido()
            throws ServletException, IOException {

        MockHttpServletRequest request = new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        request.addHeader(
                "Authorization",
                "Bearer token_valido"
        );

        when(jwtUtil.validateToken("token_valido"))
                .thenReturn(true);

        when(jwtUtil.extractUsername("token_valido"))
                .thenReturn("israel");

        when(jwtUtil.extractRole("token_valido"))
                .thenReturn("ADMIN");

        doNothing().when(filterChain)
                .doFilter(request, response);

        jwtFilter.doFilterInternal(request, response, filterChain);

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        assertNotNull(auth);

        assertEquals("israel", auth.getName());

        assertEquals(
                "ROLE_ADMIN",
                auth.getAuthorities().iterator().next().getAuthority()
        );

        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Não deve autenticar token inválido")
    void naoAutenticarTokenInvalido()
            throws ServletException, IOException {

        MockHttpServletRequest request = new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        request.addHeader(
                "Authorization",
                "Bearer token_invalido"
        );

        when(jwtUtil.validateToken("token_invalido"))
                .thenReturn(false);

        jwtFilter.doFilterInternal(request, response, filterChain);

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        assertNull(auth);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Deve ignorar requisição sem Authorization")
    void ignorarSemAuthorization()
            throws ServletException, IOException {

        MockHttpServletRequest request = new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        jwtFilter.doFilterInternal(request, response, filterChain);

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        assertNull(auth);

        verify(filterChain).doFilter(request, response);
    }

    // =========================================================
    // TESTES DE INTEGRAÇÃO
    // =========================================================

    @Test
    @DisplayName("Integração completa com token ADMIN")
    void integracaoTokenAdmin()
            throws ServletException, IOException {

        MockHttpServletRequest request = new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        request.addHeader(
                "Authorization",
                "Bearer jwt_admin"
        );

        when(jwtUtil.validateToken("jwt_admin"))
                .thenReturn(true);

        when(jwtUtil.extractUsername("jwt_admin"))
                .thenReturn("admin");

        when(jwtUtil.extractRole("jwt_admin"))
                .thenReturn("ADMIN");

        jwtFilter.doFilterInternal(request, response, filterChain);

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        assertNotNull(auth);

        assertEquals("admin", auth.getName());

        assertEquals(
                "ROLE_ADMIN",
                auth.getAuthorities().iterator().next().getAuthority()
        );
    }

    @Test
    @DisplayName("Integração completa com token BOMBEIRO")
    void integracaoTokenBombeiro()
            throws ServletException, IOException {

        MockHttpServletRequest request = new MockHttpServletRequest();

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        request.addHeader(
                "Authorization",
                "Bearer jwt_bombeiro"
        );

        when(jwtUtil.validateToken("jwt_bombeiro"))
                .thenReturn(true);

        when(jwtUtil.extractUsername("jwt_bombeiro"))
                .thenReturn("bombeiro");

        when(jwtUtil.extractRole("jwt_bombeiro"))
                .thenReturn("BOMBEIRO");

        jwtFilter.doFilterInternal(request, response, filterChain);

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        assertNotNull(auth);

        assertEquals("bombeiro", auth.getName());

        assertEquals(
                "ROLE_BOMBEIRO",
                auth.getAuthorities().iterator().next().getAuthority()
        );
    }
}