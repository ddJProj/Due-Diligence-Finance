// ContactRequestRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.ContactRequest;
import com.ddfinance.core.domain.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for ContactRequest entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {

    Page<ContactRequest> findByStatus(String status, Pageable pageable);

    List<ContactRequest> findByAssignedTo(Employee employee);

    List<ContactRequest> findBySubmittedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByStatus(String status);
}
