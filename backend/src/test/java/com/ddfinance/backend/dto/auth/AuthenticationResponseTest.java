package com.ddfinance.backend.dto.auth;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for AuthenticationResponse DTO.
 */
class AuthenticationResponseTest {

    @Test
    void testBuilderPattern() {
        // Given
        Set<String> permissions = Set.of("VIEW_ACCOUNT", "EDIT_MY_DETAILS", "UPDATE_MY_PASSWORD");

        // When
        AuthenticationResponse response = AuthenticationResponse.builder()
                .token("test-jwt-token")
                .id(123L)
                .email("john.doe@example.com")
                .firstName("John")
                .lastName("Doe")
                .role("CLIENT")
                .permissions(permissions)
                .build();

        // Then
        assertEquals("test-jwt-token", response.getToken());
        assertEquals(123L, response.getId());
        assertEquals("john.doe@example.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals("CLIENT", response.getRole());
        assertEquals(3, response.getPermissions().size());
        assertTrue(response.getPermissions().contains("VIEW_ACCOUNT"));
    }

    @Test
    void testNoArgsConstructor() {
        // Given
        AuthenticationResponse response = new AuthenticationResponse();

        // Then
        assertNull(response.getToken());
        assertNull(response.getId());
        assertNull(response.getEmail());
        assertNull(response.getFirstName());
        assertNull(response.getLastName());
        assertNull(response.getRole());
        assertNull(response.getPermissions());
    }

    @Test
    void testAllArgsConstructor() {
        // Given
        Set<String> permissions = Set.of("VIEW_ACCOUNT");

        // When
        AuthenticationResponse response = new AuthenticationResponse(
                "jwt-token",
                456L,
                "test@example.com",
                "Test",
                "User",
                "GUEST",
                permissions
        );

        // Then
        assertEquals("jwt-token", response.getToken());
        assertEquals(456L, response.getId());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test", response.getFirstName());
        assertEquals("User", response.getLastName());
        assertEquals("GUEST", response.getRole());
        assertEquals(permissions, response.getPermissions());
    }

    @Test
    void testGettersAndSetters() {
        // Given
        AuthenticationResponse response = new AuthenticationResponse();
        Set<String> permissions = new HashSet<>();
        permissions.add("CREATE_USER");
        permissions.add("VIEW_INVESTMENT");

        // When
        response.setToken("new-token");
        response.setId(789L);
        response.setEmail("setter@example.com");
        response.setFirstName("Setter");
        response.setLastName("Test");
        response.setRole("EMPLOYEE");
        response.setPermissions(permissions);

        // Then
        assertEquals("new-token", response.getToken());
        assertEquals(789L, response.getId());
        assertEquals("setter@example.com", response.getEmail());
        assertEquals("Setter", response.getFirstName());
        assertEquals("Test", response.getLastName());
        assertEquals("EMPLOYEE", response.getRole());
        assertEquals(2, response.getPermissions().size());
        assertTrue(response.getPermissions().contains("CREATE_USER"));
        assertTrue(response.getPermissions().contains("VIEW_INVESTMENT"));
    }

    @Test
    void testPermissionsModification() {
        // Given
        Set<String> initialPermissions = new HashSet<>();
        initialPermissions.add("VIEW_ACCOUNT");

        AuthenticationResponse response = AuthenticationResponse.builder()
                .permissions(initialPermissions)
                .build();

        // When
        response.getPermissions().add("EDIT_MY_DETAILS");

        // Then
        assertEquals(2, response.getPermissions().size());
        assertTrue(response.getPermissions().contains("VIEW_ACCOUNT"));
        assertTrue(response.getPermissions().contains("EDIT_MY_DETAILS"));
    }

    @Test
    void testEqualsAndHashCode() {
        // Given
        AuthenticationResponse response1 = AuthenticationResponse.builder()
                .token("token")
                .id(1L)
                .email("test@example.com")
                .build();

        AuthenticationResponse response2 = AuthenticationResponse.builder()
                .token("token")
                .id(1L)
                .email("test@example.com")
                .build();

        AuthenticationResponse response3 = AuthenticationResponse.builder()
                .token("different-token")
                .id(2L)
                .email("different@example.com")
                .build();

        // Then
        assertEquals(response1, response2);
        assertNotEquals(response1, response3);
        assertEquals(response1.hashCode(), response2.hashCode());
        assertNotEquals(response1.hashCode(), response3.hashCode());
    }

    @Test
    void testToString() {
        // Given
        AuthenticationResponse response = AuthenticationResponse.builder()
                .token("secret-token")
                .email("test@example.com")
                .build();

        // When
        String toString = response.toString();

        // Then
        assertTrue(toString.contains("test@example.com"));
        // Note: toString might expose sensitive data like token
        // Consider excluding token from toString in production
    }
}
