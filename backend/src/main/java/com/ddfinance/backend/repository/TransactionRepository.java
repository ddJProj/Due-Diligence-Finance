// TransactionRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.Transaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Transaction entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByClientOrderByTransactionDateDesc(Client client, Pageable pageable);

    List<Transaction> findByClientAndTransactionDateBetween(Client client, LocalDateTime start, LocalDateTime end);

    List<Transaction> findByClientAndType(Client client, String type);
}
