// GuestUpgradeRequestRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.GuestUpgradeRequest;
import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.UpgradeRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for GuestUpgradeRequest entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface GuestUpgradeRequestRepository extends JpaRepository<GuestUpgradeRequest, Long> {

    List<GuestUpgradeRequest> findByUserAccountOrderByRequestDateDesc(UserAccount userAccount);

    Optional<GuestUpgradeRequest> findByUserAccountAndStatus(UserAccount userAccount, UpgradeRequestStatus status);

    boolean existsByUserAccountAndStatus(UserAccount userAccount, UpgradeRequestStatus status);

    List<GuestUpgradeRequest> findByStatus(UpgradeRequestStatus status);


    /**
     * Counts the number of requests with a specific status.
     * @param status The status to count
     * @return Number of requests with the given status
     */
    long countByStatus(UpgradeRequestStatus status);

}
