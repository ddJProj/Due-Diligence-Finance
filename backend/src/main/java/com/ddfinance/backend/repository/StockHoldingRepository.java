package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Portfolio;
import com.ddfinance.core.domain.StockHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StockHolding entity operations.
 * Provides methods for managing stock positions within portfolios.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface StockHoldingRepository extends JpaRepository<StockHolding, Long> {

    /**
     * Finds all holdings for a specific portfolio.
     *
     * @param portfolio the portfolio
     * @return list of stock holdings
     */
    List<StockHolding> findByPortfolio(Portfolio portfolio);

    /**
     * Finds a holding by ticker symbol within a portfolio.
     *
     * @param portfolio the portfolio
     * @param tickerSymbol the ticker symbol
     * @return Optional containing the holding if found
     */
    Optional<StockHolding> findByPortfolioAndTickerSymbol(Portfolio portfolio, String tickerSymbol);

    /**
     * Checks if a holding exists for a ticker in a portfolio.
     *
     * @param portfolio the portfolio
     * @param tickerSymbol the ticker symbol
     * @return true if exists
     */
    boolean existsByPortfolioAndTickerSymbol(Portfolio portfolio, String tickerSymbol);

    /**
     * Finds all holdings for a specific ticker across all portfolios.
     *
     * @param tickerSymbol the ticker symbol
     * @return list of holdings
     */
    List<StockHolding> findByTickerSymbol(String tickerSymbol);

    /**
     * Finds holdings by sector within a portfolio.
     *
     * @param portfolio the portfolio
     * @param sector the sector
     * @return list of holdings
     */
    List<StockHolding> findByPortfolioAndSector(Portfolio portfolio, String sector);

    /**
     * Finds top holdings by value in a portfolio.
     *
     * @param portfolio the portfolio
     * @param limit number of holdings to return
     * @return list of top holdings
     */
    @Query("SELECT sh FROM StockHolding sh WHERE sh.portfolio = :portfolio " +
            "ORDER BY sh.currentValue DESC")
    List<StockHolding> findTopHoldingsByValue(@Param("portfolio") Portfolio portfolio,
                                              @Param("limit") int limit);

    /**
     * Finds profitable holdings in a portfolio.
     *
     * @param portfolio the portfolio
     * @return list of profitable holdings
     */
    @Query("SELECT sh FROM StockHolding sh WHERE sh.portfolio = :portfolio " +
            "AND sh.currentValue > sh.totalCost")
    List<StockHolding> findProfitableHoldings(@Param("portfolio") Portfolio portfolio);

    /**
     * Finds holdings at loss in a portfolio.
     *
     * @param portfolio the portfolio
     * @return list of holdings at loss
     */
    @Query("SELECT sh FROM StockHolding sh WHERE sh.portfolio = :portfolio " +
            "AND sh.currentValue < sh.totalCost")
    List<StockHolding> findLossHoldings(@Param("portfolio") Portfolio portfolio);

    /**
     * Calculates total value of all holdings in a portfolio.
     *
     * @param portfolio the portfolio
     * @return total value
     */
    @Query("SELECT SUM(sh.currentValue) FROM StockHolding sh WHERE sh.portfolio = :portfolio")
    BigDecimal calculateTotalValue(@Param("portfolio") Portfolio portfolio);

    /**
     * Calculates total cost of all holdings in a portfolio.
     *
     * @param portfolio the portfolio
     * @return total cost
     */
    @Query("SELECT SUM(sh.totalCost) FROM StockHolding sh WHERE sh.portfolio = :portfolio")
    BigDecimal calculateTotalCost(@Param("portfolio") Portfolio portfolio);

    /**
     * Finds holdings that need price updates (older than specified hours).
     *
     * @param hours number of hours
     * @return list of holdings needing updates
     */
    @Query("SELECT sh FROM StockHolding sh WHERE sh.lastPriceUpdate IS NULL " +
            "OR sh.lastPriceUpdate < DATEADD(HOUR, -:hours, CURRENT_TIMESTAMP)")
    List<StockHolding> findHoldingsNeedingPriceUpdate(@Param("hours") int hours);

    /**
     * Updates holding price and value.
     *
     * @param holdingId the holding ID
     * @param currentPrice new current price
     * @param currentValue new current value
     * @return number of updated records
     */
    @Query("UPDATE StockHolding sh SET sh.currentPrice = :currentPrice, " +
            "sh.currentValue = :currentValue, sh.lastPriceUpdate = CURRENT_TIMESTAMP " +
            "WHERE sh.id = :holdingId")
    int updateHoldingPrice(@Param("holdingId") Long holdingId,
                           @Param("currentPrice") BigDecimal currentPrice,
                           @Param("currentValue") BigDecimal currentValue);

    /**
     * Finds holdings by exchange.
     *
     * @param exchange the exchange (NYSE, NASDAQ, etc.)
     * @return list of holdings
     */
    List<StockHolding> findByExchange(String exchange);

    /**
     * Counts unique tickers across all portfolios.
     *
     * @return count of unique tickers
     */
    @Query("SELECT COUNT(DISTINCT sh.tickerSymbol) FROM StockHolding sh")
    long countUniqueTickers();

    /**
     * Finds holdings with significant positions (>10% of portfolio).
     *
     * @param portfolio the portfolio
     * @return list of significant holdings
     */
    @Query("SELECT sh FROM StockHolding sh WHERE sh.portfolio = :portfolio " +
            "AND (sh.currentValue / (SELECT SUM(sh2.currentValue) FROM StockHolding sh2 " +
            "WHERE sh2.portfolio = :portfolio)) > 0.1")
    List<StockHolding> findSignificantPositions(@Param("portfolio") Portfolio portfolio);
}
