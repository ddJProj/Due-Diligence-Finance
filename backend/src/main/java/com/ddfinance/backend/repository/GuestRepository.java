// GuestRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Guest;
import com.ddfinance.core.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Guest entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {

    Optional<Guest> findByUserAccount(UserAccount userAccount);

    Optional<Guest> findByGuestId(String guestId);

    boolean existsByUserAccount(UserAccount userAccount);
}
