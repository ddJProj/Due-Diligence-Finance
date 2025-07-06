// InvestmentRequestRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.InvestmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for InvestmentRequest entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface InvestmentRequestRepository extends JpaRepository<InvestmentRequest, Long> {

    List<InvestmentRequest> findByClient(Client client);

    List<InvestmentRequest> findByStatus(String status);

    List<InvestmentRequest> findByClientAndStatus(Client client, String status);
}
