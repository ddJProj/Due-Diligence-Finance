package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Portfolio entity operations.
 * Provides methods for managing investment portfolios.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    /**
     * Finds all portfolios for a specific client.
     *
     * @param client the client
     * @return list of portfolios
     */
    List<Portfolio> findByClient(Client client);

    /**
     * Finds all active portfolios for a specific client.
     *
     * @param client the client
     * @return list of active portfolios
     */
    List<Portfolio> findByClientAndIsActiveTrue(Client client);

    /**
     * Finds a portfolio by name for a specific client.
     *
     * @param portfolioName the portfolio name
     * @param client the client
     * @return Optional containing the portfolio if found
     */
    Optional<Portfolio> findByPortfolioNameAndClient(String portfolioName, Client client);

    /**
     * Checks if a portfolio exists with the given name for a client.
     *
     * @param portfolioName the portfolio name
     * @param client the client
     * @return true if exists
     */
    boolean existsByPortfolioNameAndClient(String portfolioName, Client client);

    /**
     * Finds portfolios by risk profile.
     *
     * @param riskProfile the risk profile (CONSERVATIVE, MODERATE, AGGRESSIVE)
     * @return list of portfolios
     */
    List<Portfolio> findByRiskProfile(String riskProfile);

    /**
     * Finds portfolios with total value greater than specified amount.
     *
     * @param minValue minimum portfolio value
     * @return list of portfolios
     */
    List<Portfolio> findByTotalValueGreaterThan(BigDecimal minValue);

    /**
     * Calculates total value of all active portfolios for a client.
     *
     * @param client the client
     * @return total value
     */
    @Query("SELECT SUM(p.totalValue) FROM Portfolio p WHERE p.client = :client AND p.isActive = true")
    BigDecimal calculateTotalValueForClient(@Param("client") Client client);

    /**
     * Finds portfolios that need rebalancing.
     *
     * @param frequency rebalance frequency
     * @return list of portfolios
     */
    @Query("SELECT p FROM Portfolio p WHERE p.rebalanceFrequency = :frequency " +
            "AND p.isActive = true " +
            "AND (p.lastRebalanced IS NULL OR " +
            "CASE " +
            "  WHEN :frequency = 'MONTHLY' THEN p.lastRebalanced < DATEADD(MONTH, -1, CURRENT_TIMESTAMP) " +
            "  WHEN :frequency = 'QUARTERLY' THEN p.lastRebalanced < DATEADD(MONTH, -3, CURRENT_TIMESTAMP) " +
            "  WHEN :frequency = 'ANNUALLY' THEN p.lastRebalanced < DATEADD(YEAR, -1, CURRENT_TIMESTAMP) " +
            "END)")
    List<Portfolio> findPortfoliosNeedingRebalance(@Param("frequency") String frequency);

    /**
     * Finds top performing portfolios by return percentage.
     *
     * @param limit number of portfolios to return
     * @return list of top performing portfolios
     */
    @Query("SELECT p FROM Portfolio p WHERE p.isActive = true " +
            "AND p.totalCost > 0 " +
            "ORDER BY ((p.totalValue - p.totalCost) / p.totalCost) DESC")
    List<Portfolio> findTopPerformingPortfolios(@Param("limit") int limit);

    /**
     * Counts active portfolios for a client.
     *
     * @param client the client
     * @return count of active portfolios
     */
    long countByClientAndIsActiveTrue(Client client);

    /**
     * Updates portfolio calculations.
     *
     * @param portfolioId the portfolio ID
     * @param totalValue new total value
     * @param totalCost new total cost
     * @return number of updated records
     */
    @Query("UPDATE Portfolio p SET p.totalValue = :totalValue, p.totalCost = :totalCost, " +
            "p.lastCalculated = CURRENT_TIMESTAMP WHERE p.id = :portfolioId")
    int updatePortfolioCalculations(@Param("portfolioId") Long portfolioId,
                                    @Param("totalValue") BigDecimal totalValue,
                                    @Param("totalCost") BigDecimal totalCost);
}
