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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Implementation of UserAccountService.
 * Handles user account management operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserAccountServiceImpl implements UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final AdminRepository adminRepository;
    private final GuestRepository guestRepository;
    private final PasswordEncoder passwordEncoder;

    // Password validation pattern - at least 8 chars, contains uppercase, lowercase, number, special char
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$"
    );

    @Override
    @Transactional(readOnly = true)
    public UserAccountDTO getCurrentUser(String email) {
        log.debug("Getting current user by email: {}", email);
        UserAccount user = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("UserAccount", email));
        return convertToDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserAccountDTO getUserById(Long id) {
        log.debug("Getting user by ID: {}", id);
        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("UserAccount", id));
        return convertToDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserAccountDTO> getAllUsers() {
        log.debug("Getting all users");
        return userAccountRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserAccountDTO updateUserDetails(String email, UpdateUserDetailsRequest request) {
        log.debug("Updating user details for: {}", email);

        UserAccount user = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("UserAccount", email));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        UserAccount updatedUser = userAccountRepository.save(user);
        log.info("Updated user details for: {}", email);

        return convertToDTO(updatedUser);
    }

    @Override
    public void updatePassword(String email, UpdatePasswordRequest request) {
        log.debug("Updating password for user: {}", email);

        UserAccount user = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("UserAccount", email));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new SecurityException.AuthenticationException("Current password is incorrect");
        }

        // Validate new password
        if (!isValidPassword(request.getNewPassword())) {
            throw new ValidationException("Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userAccountRepository.save(user);

        log.info("Password updated for user: {}", email);
    }

    @Override
    public void deleteUser(Long id) {
        log.debug("Deleting user with ID: {}", id);

        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("UserAccount", id));

        // Delete role-specific entity first
        deleteRoleSpecificEntity(user);

        // Delete user account
        userAccountRepository.delete(user);
        log.info("Deleted user with ID: {}", id);
    }

    @Override
    public UserAccountDTO updateUserRole(Long id, Role newRole) {
        log.debug("Updating user role for ID: {} to {}", id, newRole);

        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("UserAccount", id));

        if (user.getRole() == newRole) {
            throw new ValidationException("User already has role: " + newRole);
        }

        // Delete old role-specific entity
        deleteRoleSpecificEntity(user);

        // Update role
        user.setRole(newRole);

        // Create new role-specific entity
        createRoleSpecificEntity(user);

        UserAccount updatedUser = userAccountRepository.save(user);
        log.info("Updated user role for ID: {} to {}", id, newRole);

        return convertToDTO(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserAccountDTO> searchUsers(String query) {
        log.debug("Searching users with query: {}", query);

        if (query == null || query.trim().isEmpty()) {
            return getAllUsers();
        }

        return userAccountRepository.searchByEmailOrName(query).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserAccountDTO createUser(UserAccountDTO userDTO, String temporaryPassword) {
        log.debug("Creating new user with email: {}", userDTO.getEmail());

        // Check if email already exists
        if (userAccountRepository.existsByEmail(userDTO.getEmail())) {
            throw new ValidationException("Email already exists: " + userDTO.getEmail());
        }

        // Create new user account
        UserAccount newUser = new UserAccount();
        newUser.setEmail(userDTO.getEmail());
        newUser.setFirstName(userDTO.getFirstName());
        newUser.setLastName(userDTO.getLastName());
        newUser.setPassword(passwordEncoder.encode(temporaryPassword));
        newUser.setRole(userDTO.getRole() != null ? userDTO.getRole() : Role.GUEST);
        newUser.setActive(true);

        UserAccount savedUser = userAccountRepository.save(newUser);

        // Create role-specific entity
        createRoleSpecificEntity(savedUser);

        log.info("Created new user with email: {}", userDTO.getEmail());

        return convertToDTO(savedUser);
    }

    @Override
    public void activateUser(Long id) {
        log.debug("Activating user with ID: {}", id);

        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("UserAccount", id));

        if (user.isActive()) {
            throw new ValidationException("User is already active");
        }

        user.setActive(true);
        userAccountRepository.save(user);

        log.info("Activated user with ID: {}", id);
    }

    @Override
    public void deactivateUser(Long id) {
        log.debug("Deactivating user with ID: {}", id);

        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("UserAccount", id));

        if (!user.isActive()) {
            throw new ValidationException("User is already inactive");
        }

        user.setActive(false);
        userAccountRepository.save(user);

        log.info("Deactivated user with ID: {}", id);
    }

    /**
     * Converts UserAccount entity to DTO.
     *
     * @param user The user account entity
     * @return User account DTO
     */
    private UserAccountDTO convertToDTO(UserAccount user) {
        // Extract Permissions enum values from Permission objects
        Set<Permissions> permissionTypes = new HashSet<>();
        if (user.getPermissions() != null) {
            user.getPermissions().forEach(permission ->
                permissionTypes.add(permission.getPermissionType())
            );
        }

        return UserAccountDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .permissions(permissionTypes)
                .build();
    }

    /**
     * Validates password strength.
     *
     * @param password The password to validate
     * @return true if valid, false otherwise
     */
    private boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }

    /**
     * Deletes role-specific entity for a user.
     *
     * @param user The user account
     */
    private void deleteRoleSpecificEntity(UserAccount user) {
        switch (user.getRole()) {
            case CLIENT:
                clientRepository.findByUserAccount(user)
                        .ifPresent(clientRepository::delete);
                break;
            case EMPLOYEE:
                employeeRepository.findByUserAccount(user)
                        .ifPresent(employeeRepository::delete);
                break;
            case ADMIN:
                adminRepository.findByUserAccount(user)
                        .ifPresent(adminRepository::delete);
                break;
            case GUEST:
                guestRepository.findByUserAccount(user)
                        .ifPresent(guestRepository::delete);
                break;
        }
    }

    /**
     * Creates role-specific entity for a user.
     *
     * @param user The user account
     */
    private void createRoleSpecificEntity(UserAccount user) {
        switch (user.getRole()) {
            case CLIENT:
                Client client = new Client();
                client.setUserAccount(user);
                client.setClientId("CL" + generateUniqueId());
                clientRepository.save(client);
                break;
            case EMPLOYEE:
                Employee employee = new Employee();
                employee.setUserAccount(user);
                employee.setEmployeeId("EMP" + generateUniqueId());
                employeeRepository.save(employee);
                break;
            case ADMIN:
                Admin admin = new Admin();
                admin.setUserAccount(user);
                admin.setAdminId("ADM" + generateUniqueId());
                adminRepository.save(admin);
                break;
            case GUEST:
                Guest guest = new Guest();
                guest.setUserAccount(user);
                guest.setGuestId("G" + generateUniqueId());
                guestRepository.save(guest);
                break;
        }
    }

    /**
     * Generates a unique ID for role-specific entities.
     *
     * @return Unique ID string
     */
    private String generateUniqueId() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}