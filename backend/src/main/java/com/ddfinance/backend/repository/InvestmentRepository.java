// InvestmentRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.Investment;
import com.ddfinance.core.domain.enums.InvestmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/**
 * Repository interface for Investment entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    List<Investment> findByClient(Client client);

    List<Investment> findByClientOrderByCreatedDateDesc(Client client);

    List<Investment> findByClientAndStatus(Client client, InvestmentStatus status);

    List<Investment> findByStatus(InvestmentStatus status);

    long countByClientInAndStatus(Set<Client> clients, InvestmentStatus status);

    List<Investment> findByClientInAndStatusIn(Set<Client> clients, Set<InvestmentStatus> statuses);

    // FIXED: Changed purchasePrice to purchasePricePerShare
    @Query("SELECT SUM(i.shares * i.purchasePricePerShare) FROM Investment i WHERE i.client IN :clients AND i.status = :status")
    BigDecimal calculateTotalValueForClients(@Param("clients") Set<Client> clients, @Param("status") InvestmentStatus status);

    // FIXED: Changed purchasePrice to purchasePricePerShare
    @Query("SELECT SUM(i.shares * i.purchasePricePerShare) FROM Investment i WHERE i.client IN :clients")
    BigDecimal calculateTotalValueForClients(@Param("clients") Set<Client> clients);

    // FIXED: For total system value calculation
    @Query("SELECT SUM(i.shares * i.purchasePricePerShare) FROM Investment i WHERE i.status = 'ACTIVE'")
    Double calculateTotalSystemValue();
}
