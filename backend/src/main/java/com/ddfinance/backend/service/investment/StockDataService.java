package com.ddfinance.backend.service.investment;

import com.ddfinance.backend.dto.investment.MarketOverviewDTO;
import com.ddfinance.backend.dto.investment.StockQuoteDTO;
import com.ddfinance.backend.dto.investment.StockSearchResultDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service interface for retrieving live stock market data.
 * Integrates with external APIs to provide real-time stock prices and information.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface StockDataService {

    /**
     * Gets the current price for a stock symbol.
     *
     * @param symbol The stock ticker symbol (e.g., "AAPL", "MSFT")
     * @return Current price as BigDecimal, or null if symbol not found
     */
    BigDecimal getCurrentPrice(String symbol);

    /**
     * Gets detailed stock information including company name and other metadata.
     *
     * @param symbol The stock symbol
     * @return Map containing stock information with keys like "name", "exchange", "sector", etc.
     */
    Map<String, Object> getStockInfo(String symbol);

    /**
     * Gets historical price data for a stock within a date range.
     *
     * @param symbol The stock symbol
     * @param startDate Start date for historical data
     * @param endDate End date for historical data
     * @return List of historical data points
     */
    List<Map<String, Object>> getHistoricalData(String symbol, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Gets a batch of current prices for multiple symbols.
     *
     * @param symbols List of stock symbols
     * @return Map of symbol to current price
     */
    Map<String, BigDecimal> getBatchPrices(List<String> symbols);

    /**
     * Gets real-time quote data for a stock.
     *
     * @param symbol The stock symbol
     * @return Quote data including bid, ask, volume, etc.
     */
    StockQuoteDTO getQuote(String symbol);

    /**
     * Searches for stocks by name or symbol.
     *
     * @param query Search query
     * @return List of matching stocks
     */
    List<StockSearchResultDTO> searchStocks(String query);

    /**
     * Gets market overview data (major indices).
     *
     * @return Market overview with major index values
     */
    MarketOverviewDTO getMarketOverview();

    /**
     * Validates if a stock symbol exists.
     *
     * @param symbol The stock symbol
     * @return true if valid symbol, false otherwise
     */
    boolean isValidSymbol(String symbol);

    /**
     * Gets company fundamentals data.
     *
     * @param symbol The stock symbol
     * @return Map of fundamental data (P/E ratio, market cap, etc.)
     */
    Map<String, Object> getFundamentals(String symbol);

    /**
     * Gets dividend information for a stock.
     *
     * @param symbol The stock symbol
     * @return Dividend data including yield, payment dates, etc.
     */
    Map<String, Object> getDividendInfo(String symbol);

    /**
     * Gets intraday price data.
     *
     * @param symbol The stock symbol
     * @param interval Time interval (1min, 5min, 15min, 30min, 60min)
     * @return List of intraday price points
     */
    List<Map<String, Object>> getIntradayData(String symbol, String interval);

    /**
     * Gets news for a specific stock.
     *
     * @param symbol The stock symbol
     * @param limit Number of news items to retrieve
     * @return List of news items
     */
    List<Map<String, Object>> getStockNews(String symbol, int limit);
}
