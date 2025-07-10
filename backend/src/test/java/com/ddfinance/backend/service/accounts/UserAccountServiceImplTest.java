package com.ddfinance.backend.service.accounts;

import com.ddfinance.backend.dto.accounts.UpdatePasswordRequest;
import com.ddfinance.backend.dto.accounts.UpdateUserDetailsRequest;
import com.ddfinance.backend.dto.accounts.UserAccountDTO;
import com.ddfinance.backend.repository.*;
import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.SecurityException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test class for UserAccountServiceImpl.
 * Tests user account management operations using TDD approach.
 */
@ExtendWith(MockitoExtension.class)
class UserAccountServiceImplTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private GuestRepository guestRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserAccountServiceImpl userAccountService;

    private UserAccount testUser;
    private Client testClient;
    private Employee testEmployee;
    private Admin testAdmin;
    private Guest testGuest;

    @BeforeEach
    void setUp() {
        userAccountService = new UserAccountServiceImpl(
                userAccountRepository,
                clientRepository,
                employeeRepository,
                adminRepository,
                guestRepository,
                passwordEncoder
        );

        // Setup test user
        testUser = new UserAccount();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setPassword("encoded_password");
        testUser.setRole(Role.CLIENT);
        testUser.setActive(true);

        // Create Permission objects instead of using Permissions enum directly
        Set<Permission> permissions = new HashSet<>();
        permissions.add(new Permission(Permissions.VIEW_ACCOUNT, "View account"));
        permissions.add(new Permission(Permissions.EDIT_MY_DETAILS, "Edit details"));
        testUser.setPermissions(permissions);

        // Setup related entities
        testClient = new Client();
        testClient.setId(1L);
        testClient.setUserAccount(testUser);
        testClient.setClientId("CL001");

        testEmployee = new Employee();
        testEmployee.setId(1L);
        testEmployee.setUserAccount(testUser);
        testEmployee.setEmployeeId("EMP001");

        testAdmin = new Admin();
        testAdmin.setId(1L);
        testAdmin.setUserAccount(testUser);
        testAdmin.setAdminId("ADM001");

        testGuest = new Guest();
        testGuest.setId(1L);
        testGuest.setUserAccount(testUser);
        testGuest.setGuestId("G001");
    }

    // Test getCurrentUser
    @Test
    void getCurrentUser_WhenUserExists_ReturnsUserDTO() {
        // Given
        when(userAccountRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        UserAccountDTO result = userAccountService.getCurrentUser("test@example.com");

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        assertEquals(Role.CLIENT, result.getRole());
        assertEquals(2, result.getPermissions().size());
        assertTrue(result.getPermissions().contains(Permissions.VIEW_ACCOUNT));
        assertTrue(result.getPermissions().contains(Permissions.EDIT_MY_DETAILS));

        verify(userAccountRepository).findByEmail("test@example.com");
    }

    @Test
    void getCurrentUser_WhenUserNotFound_ThrowsEntityNotFoundException() {
        // Given
        when(userAccountRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When & Then
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> userAccountService.getCurrentUser("nonexistent@example.com")
        );

        assertEquals("UserAccount not found with email: nonexistent@example.com", exception.getMessage());
        verify(userAccountRepository).findByEmail("nonexistent@example.com");
    }

    // Test getUserById
    @Test
    void getUserById_WhenUserExists_ReturnsUserDTO() {
        // Given
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When
        UserAccountDTO result = userAccountService.getUserById(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test@example.com", result.getEmail());
        verify(userAccountRepository).findById(1L);
    }

    @Test
    void getUserById_WhenUserNotFound_ThrowsEntityNotFoundException() {
        // Given
        when(userAccountRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> userAccountService.getUserById(999L)
        );

        assertEquals("UserAccount not found with id: 999", exception.getMessage());
        verify(userAccountRepository).findById(999L);
    }

    // Test getAllUsers
    @Test
    void getAllUsers_ReturnsListOfUserDTOs() {
        // Given
        UserAccount user2 = new UserAccount();
        user2.setId(2L);
        user2.setEmail("user2@example.com");
        user2.setFirstName("Jane");
        user2.setLastName("Smith");
        user2.setRole(Role.EMPLOYEE);

        Set<Permission> user2Permissions = new HashSet<>();
        user2Permissions.add(new Permission(Permissions.VIEW_CLIENTS, "View clients"));
        user2.setPermissions(user2Permissions);

        List<UserAccount> users = Arrays.asList(testUser, user2);
        when(userAccountRepository.findAll()).thenReturn(users);

        // When
        List<UserAccountDTO> result = userAccountService.getAllUsers();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("test@example.com", result.get(0).getEmail());
        assertEquals("user2@example.com", result.get(1).getEmail());
        verify(userAccountRepository).findAll();
    }

    @Test
    void getAllUsers_WhenNoUsers_ReturnsEmptyList() {
        // Given
        when(userAccountRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        List<UserAccountDTO> result = userAccountService.getAllUsers();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(userAccountRepository).findAll();
    }

    // Test updateUserDetails
    @Test
    void updateUserDetails_WhenValidRequest_UpdatesAndReturnsUserDTO() {
        // Given
        UpdateUserDetailsRequest request = UpdateUserDetailsRequest.builder()
                .firstName("Updated")
                .lastName("Name")
                .build();

        when(userAccountRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(testUser);

        // When
        UserAccountDTO result = userAccountService.updateUserDetails("test@example.com", request);

        // Then
        assertNotNull(result);
        assertEquals("Updated", testUser.getFirstName());
        assertEquals("Name", testUser.getLastName());
        verify(userAccountRepository).findByEmail("test@example.com");
        verify(userAccountRepository).save(testUser);
    }

    @Test
    void updateUserDetails_WhenUserNotFound_ThrowsEntityNotFoundException() {
        // Given
        UpdateUserDetailsRequest request = UpdateUserDetailsRequest.builder()
                .firstName("Updated")
                .lastName("Name")
                .build();

        when(userAccountRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(
                EntityNotFoundException.class,
                () -> userAccountService.updateUserDetails("nonexistent@example.com", request)
        );

        verify(userAccountRepository).findByEmail("nonexistent@example.com");
        verify(userAccountRepository, never()).save(any());
    }

    // Test updatePassword
    @Test
    void updatePassword_WhenValidCurrentPassword_UpdatesPassword() {
        // Given
        UpdatePasswordRequest request = UpdatePasswordRequest.builder()
                .currentPassword("oldPassword")
                .newPassword("NewPassword123!")
                .confirmPassword("NewPassword123!")
                .build();

        when(userAccountRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPassword", "encoded_password")).thenReturn(true);
        when(passwordEncoder.encode("NewPassword123!")).thenReturn("new_encoded_password");
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(testUser);

        // When
        userAccountService.updatePassword("test@example.com", request);

        // Then
        assertEquals("new_encoded_password", testUser.getPassword());
        verify(userAccountRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("oldPassword", "encoded_password");
        verify(passwordEncoder).encode("NewPassword123!");
        verify(userAccountRepository).save(testUser);
    }

    @Test
    void updatePassword_WhenIncorrectCurrentPassword_ThrowsAuthenticationException() {
        // Given
        UpdatePasswordRequest request = UpdatePasswordRequest.builder()
                .currentPassword("wrongPassword")
                .newPassword("NewPassword123!")
                .confirmPassword("NewPassword123!")
                .build();

        when(userAccountRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encoded_password")).thenReturn(false);

        // When & Then
        SecurityException.AuthenticationException exception = assertThrows(
                SecurityException.AuthenticationException.class,
                () -> userAccountService.updatePassword("test@example.com", request)
        );

        assertEquals("Current password is incorrect", exception.getMessage());
        verify(passwordEncoder).matches("wrongPassword", "encoded_password");
        verify(userAccountRepository, never()).save(any());
    }

    @Test
    void updatePassword_WhenPasswordDoesNotMeetRequirements_ThrowsValidationException() {
        // Given
        UpdatePasswordRequest request = UpdatePasswordRequest.builder()
                .currentPassword("oldPassword")
                .newPassword("weak")
                .confirmPassword("weak")
                .build();

        when(userAccountRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPassword", "encoded_password")).thenReturn(true);

        // When & Then
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> userAccountService.updatePassword("test@example.com", request)
        );

        assertEquals("Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character",
                exception.getMessage());
        verify(userAccountRepository, never()).save(any());
    }

    // Test deleteUser
    @Test
    void deleteUser_WhenUserExists_DeletesUser() {
        // Given
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(testUser));
        doNothing().when(userAccountRepository).delete(testUser);

        // When
        userAccountService.deleteUser(1L);

        // Then
        verify(userAccountRepository).findById(1L);
        verify(userAccountRepository).delete(testUser);
    }

    @Test
    void deleteUser_WhenUserNotFound_ThrowsEntityNotFoundException() {
        // Given
        when(userAccountRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(
                EntityNotFoundException.class,
                () -> userAccountService.deleteUser(999L)
        );

        verify(userAccountRepository).findById(999L);
        verify(userAccountRepository, never()).delete(any());
    }

    @Test
    void deleteUser_WhenUserHasRoleSpecificEntity_DeletesRoleEntity() {
        // Given
        testUser.setRole(Role.CLIENT);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(clientRepository.findByUserAccount(testUser)).thenReturn(Optional.of(testClient));
        doNothing().when(clientRepository).delete(testClient);
        doNothing().when(userAccountRepository).delete(testUser);

        // When
        userAccountService.deleteUser(1L);

        // Then
        verify(clientRepository).findByUserAccount(testUser);
        verify(clientRepository).delete(testClient);
        verify(userAccountRepository).delete(testUser);
    }

    // Test updateUserRole
    @Test
    void updateUserRole_WhenChangingFromClientToEmployee_UpdatesRoleAndEntities() {
        // Given
        testUser.setRole(Role.CLIENT);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(clientRepository.findByUserAccount(testUser)).thenReturn(Optional.of(testClient));
        when(employeeRepository.save(any(Employee.class))).thenReturn(testEmployee);
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(testUser);
        doNothing().when(clientRepository).delete(testClient);

        // When
        UserAccountDTO result = userAccountService.updateUserRole(1L, Role.EMPLOYEE);

        // Then
        assertNotNull(result);
        assertEquals(Role.EMPLOYEE, testUser.getRole());
        verify(clientRepository).findByUserAccount(testUser);
        verify(clientRepository).delete(testClient);
        verify(employeeRepository).save(any(Employee.class));
        verify(userAccountRepository).save(testUser);
    }

    @Test
    void updateUserRole_WhenSameRole_ThrowsValidationException() {
        // Given
        testUser.setRole(Role.CLIENT);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> userAccountService.updateUserRole(1L, Role.CLIENT)
        );

        assertEquals("User already has role: CLIENT", exception.getMessage());
        verify(userAccountRepository, never()).save(any());
    }

    // Test searchUsers
    @Test
    void searchUsers_WhenQueryMatches_ReturnsMatchingUsers() {
        // Given
        UserAccount user2 = new UserAccount();
        user2.setId(2L);
        user2.setEmail("john.smith@example.com");
        user2.setFirstName("John");
        user2.setLastName("Smith");
        user2.setRole(Role.EMPLOYEE);
        user2.setPermissions(Set.of());

        List<UserAccount> matchingUsers = Arrays.asList(testUser, user2);
        when(userAccountRepository.searchByEmailOrName("john")).thenReturn(matchingUsers);

        // When
        List<UserAccountDTO> result = userAccountService.searchUsers("john");

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(userAccountRepository).searchByEmailOrName("john");
    }

    @Test
    void searchUsers_WhenNoMatches_ReturnsEmptyList() {
        // Given
        when(userAccountRepository.searchByEmailOrName("xyz")).thenReturn(Collections.emptyList());

        // When
        List<UserAccountDTO> result = userAccountService.searchUsers("xyz");

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(userAccountRepository).searchByEmailOrName("xyz");
    }

    @Test
    void searchUsers_WhenQueryIsEmpty_ReturnsAllUsers() {
        // Given
        List<UserAccount> allUsers = Arrays.asList(testUser);
        when(userAccountRepository.findAll()).thenReturn(allUsers);

        // When
        List<UserAccountDTO> result = userAccountService.searchUsers("");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userAccountRepository).findAll();
    }

    // Test createUser
    @Test
    void createUser_WhenValidRequest_CreatesAndReturnsUser() {
        // Given
        UserAccountDTO request = UserAccountDTO.builder()
                .email("newuser@example.com")
                .firstName("New")
                .lastName("User")
                .role(Role.GUEST)
                .build();

        String password = "TempPassword123!";
        UserAccount newUser = new UserAccount();
        newUser.setEmail(request.getEmail());
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setRole(request.getRole());
        newUser.setId(2L);

        when(userAccountRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_temp_password");
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(newUser);
        when(guestRepository.save(any(Guest.class))).thenReturn(testGuest);

        // When
        UserAccountDTO result = userAccountService.createUser(request, password);

        // Then
        assertNotNull(result);
        assertEquals("newuser@example.com", result.getEmail());
        assertEquals(Role.GUEST, result.getRole());
        verify(userAccountRepository).existsByEmail("newuser@example.com");
        verify(userAccountRepository).save(any(UserAccount.class));
        verify(guestRepository).save(any(Guest.class));
    }

    @Test
    void createUser_WhenEmailAlreadyExists_ThrowsValidationException() {
        // Given
        UserAccountDTO request = UserAccountDTO.builder()
                .email("existing@example.com")
                .firstName("New")
                .lastName("User")
                .role(Role.GUEST)
                .build();

        when(userAccountRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // When & Then
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> userAccountService.createUser(request, "TempPassword123!")
        );

        assertEquals("Email already exists: existing@example.com", exception.getMessage());
        verify(userAccountRepository, never()).save(any());
    }

    // Test activateUser
    @Test
    void activateUser_WhenUserIsInactive_ActivatesUser() {
        // Given
        testUser.setActive(false);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(testUser);

        // When
        userAccountService.activateUser(1L);

        // Then
        assertTrue(testUser.isActive());
        verify(userAccountRepository).save(testUser);
    }

    @Test
    void activateUser_WhenAlreadyActive_ThrowsValidationException() {
        // Given
        testUser.setActive(true);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> userAccountService.activateUser(1L)
        );

        assertEquals("User is already active", exception.getMessage());
        verify(userAccountRepository, never()).save(any());
    }

    // Test deactivateUser
    @Test
    void deactivateUser_WhenUserIsActive_DeactivatesUser() {
        // Given
        testUser.setActive(true);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(testUser);

        // When
        userAccountService.deactivateUser(1L);

        // Then
        assertFalse(testUser.isActive());
        verify(userAccountRepository).save(testUser);
    }

    @Test
    void deactivateUser_WhenAlreadyInactive_ThrowsValidationException() {
        // Given
        testUser.setActive(false);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> userAccountService.deactivateUser(1L)
        );

        assertEquals("User is already inactive", exception.getMessage());
        verify(userAccountRepository, never()).save(any());
    }
}