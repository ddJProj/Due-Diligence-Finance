// TransactionRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.Transaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.math.BigDecimal;
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

    /**
     * Finds all transactions for an investment ordered by date.
     *
     * @param investmentId The investment ID
     * @return List of transactions ordered by date descending
     */
    List<Transaction> findByInvestmentIdOrderByTransactionDateDesc(String investmentId);

    /**
     * Finds transactions by type.
     *
     * @param type Transaction type (BUY, SELL, DIVIDEND, etc.)
     * @return List of transactions
     */
    List<Transaction> findByType(String type);

    /**
     * Finds transactions within a date range.
     *
     * @param startDate Start date
     * @param endDate End date
     * @return List of transactions
     */
    List<Transaction> findByTransactionDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Finds transactions for a client.
     *
     * @param clientId Client ID
     * @return List of transactions
     */
    @Query("SELECT t FROM Transaction t WHERE t.investmentId IN " +
            "(SELECT i.investmentId FROM Investment i WHERE i.client.id = :clientId) " +
            "ORDER BY t.transactionDate DESC")
    List<Transaction> findByClientId(@Param("clientId") Long clientId);

    /**
     * Calculates total amount by transaction type.
     *
     * @param type Transaction type
     * @param startDate Start date
     * @param endDate End date
     * @return Total amount
     */
    @Query("SELECT SUM(t.totalAmount) FROM Transaction t " +
            "WHERE t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalByTypeAndDateRange(@Param("type") String type,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    /**
     * Counts transactions by type.
     *
     * @param type Transaction type
     * @return Count of transactions
     */
    long countByType(String type);

    /**
     * Finds recent transactions.
     *
     * @param limit Number of transactions to return
     * @return List of recent transactions
     */
    @Query("SELECT t FROM Transaction t ORDER BY t.transactionDate DESC")
    List<Transaction> findRecentTransactions(@Param("limit") int limit);


}
