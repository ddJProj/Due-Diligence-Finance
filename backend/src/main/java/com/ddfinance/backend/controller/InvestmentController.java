package com.ddfinance.backend.controller;

import com.ddfinance.backend.dto.investment.*;
import com.ddfinance.backend.service.investment.InvestmentService;
import com.ddfinance.backend.service.investment.StockDataService;
import com.ddfinance.core.domain.enums.InvestmentStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for investment operations.
 * Handles investment management and stock market data access.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@RestController
@RequestMapping("/api/investments")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class InvestmentController {

    private final InvestmentService investmentService;
    private final StockDataService stockDataService;

    /**
     * Gets investment by ID.
     *
     * @param investmentId Investment ID
     * @return Investment details
     */
    @GetMapping("/{investmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CLIENT')")
    public ResponseEntity<InvestmentDTO> getInvestmentById(@PathVariable Long investmentId) {
        InvestmentDTO investment = investmentService.getInvestmentById(investmentId);
        return ResponseEntity.ok(investment);
    }

    /**
     * Updates investment details.
     *
     * @param investmentId Investment ID
     * @param request Update request
     * @return Updated investment
     */
    @PutMapping("/{investmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<InvestmentDTO> updateInvestment(
            @PathVariable Long investmentId,
            @Valid @RequestBody UpdateInvestmentRequest request) {

        InvestmentDTO updated = investmentService.updateInvestment(investmentId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Gets investments by status.
     *
     * @param status Investment status filter
     * @return List of investments
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<InvestmentDTO>> getInvestmentsByStatus(
            @RequestParam(required = false) InvestmentStatus status) {

        List<InvestmentDTO> investments = status != null
                ? investmentService.getInvestmentsByStatus(status)
                : investmentService.getAllInvestments();

        return ResponseEntity.ok(investments);
    }

    /**
     * Gets investment performance metrics.
     *
     * @param investmentId Investment ID
     * @return Performance metrics
     */
    @GetMapping("/{investmentId}/performance")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CLIENT')")
    public ResponseEntity<InvestmentPerformanceDTO> getInvestmentPerformance(
            @PathVariable Long investmentId) {

        InvestmentPerformanceDTO performance = investmentService.getInvestmentPerformance(investmentId);
        return ResponseEntity.ok(performance);
    }

    /**
     * Gets real-time stock quote.
     *
     * @param symbol Stock symbol
     * @return Stock quote
     */
    @GetMapping("/quotes/{symbol}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CLIENT')")
    public ResponseEntity<StockQuoteDTO> getStockQuote(
            @PathVariable @Pattern(regexp = "^[A-Z]{1,5}$") String symbol) {

        StockQuoteDTO quote = stockDataService.getStockQuote(symbol);
        return ResponseEntity.ok(quote);
    }

    /**
     * Gets multiple stock quotes.
     *
     * @param symbols List of stock symbols
     * @return List of stock quotes
     */
    @PostMapping("/quotes/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CLIENT')")
    public ResponseEntity<List<StockQuoteDTO>> getMultipleQuotes(
            @RequestBody @NotEmpty List<String> symbols) {

        if (symbols.size() > 20) {
            throw new ValidationException("Maximum 20 symbols allowed per request");
        }

        List<StockQuoteDTO> quotes = stockDataService.getMultipleQuotes(symbols);
        return ResponseEntity.ok(quotes);
    }

    /**
     * Searches for stocks.
     *
     * @param query Search query
     * @return Search results
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CLIENT')")
    public ResponseEntity<List<StockSearchResultDTO>> searchStocks(@RequestParam String query) {
        if (query.length() < 2) {
            throw new ValidationException("Search query must be at least 2 characters");
        }

        List<StockSearchResultDTO> results = stockDataService.searchStocks(query);
        return ResponseEntity.ok(results);
    }

    /**
     * Gets market overview.
     * Public endpoint.
     *
     * @return Market indices overview
     */
    @GetMapping("/market-overview")
    public ResponseEntity<List<MarketOverviewDTO>> getMarketOverview() {
        List<MarketOverviewDTO> overview = stockDataService.getMarketOverview();
        return ResponseEntity.ok(overview);
    }

    /**
     * Gets investment transaction history.
     *
     * @param investmentId Investment ID
     * @return Transaction history
     */
    @GetMapping("/{investmentId}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CLIENT')")
    public ResponseEntity<List<Map<String, Object>>> getInvestmentHistory(
            @PathVariable Long investmentId) {

        List<Map<String, Object>> history = investmentService.getInvestmentHistory(investmentId);
        return ResponseEntity.ok(history);
    }

    /**
     * Gets investment analytics for admins.
     *
     * @return System-wide investment analytics
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getInvestmentAnalytics() {
        Map<String, Object> analytics = investmentService.getInvestmentAnalytics();
        return ResponseEntity.ok(analytics);
    }

    /**
     * Validates stock symbol.
     *
     * @param symbol Stock symbol to validate
     * @return Validation result
     */
    @GetMapping("/validate/{symbol}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Map<String, Object>> validateSymbol(
            @PathVariable @Pattern(regexp = "^[A-Z]{1,5}$") String symbol) {

        Map<String, Object> validation = stockDataService.validateSymbol(symbol);
        return ResponseEntity.ok(validation);
    }

    /**
     * Gets dividend history for a stock.
     *
     * @param symbol Stock symbol
     * @return Dividend history
     */
    @GetMapping("/dividends/{symbol}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CLIENT')")
    public ResponseEntity<List<Map<String, Object>>> getDividendHistory(
            @PathVariable @Pattern(regexp = "^[A-Z]{1,5}$") String symbol) {

        List<Map<String, Object>> dividends = stockDataService.getDividendHistory(symbol);
        return ResponseEntity.ok(dividends);
    }

    /**
     * Refreshes all investment prices.
     *
     * @return Refresh result
     */
    @PostMapping("/refresh-prices")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Map<String, String>> refreshPrices() {
        Map<String, String> result = investmentService.refreshAllPrices();
        return ResponseEntity.ok(result);
    }

    /**
     * Gets sector performance summary.
     *
     * @return Sector performance data
     */
    @GetMapping("/sectors")
    public ResponseEntity<Map<String, Object>> getSectorPerformance() {
        Map<String, Object> sectors = stockDataService.getSectorPerformance();
        return ResponseEntity.ok(sectors);
    }

    /**
     * Exception handler for entity not found.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Exception handler for validation errors.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidation(ValidationException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
