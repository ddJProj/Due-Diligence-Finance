// AdminRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Admin;
import com.ddfinance.core.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Admin entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUserAccount(UserAccount userAccount);

    Optional<Admin> findByAdminId(String adminId);

    boolean existsByUserAccount(UserAccount userAccount);
}
