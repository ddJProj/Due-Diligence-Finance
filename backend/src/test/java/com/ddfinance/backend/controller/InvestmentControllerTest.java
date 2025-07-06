package com.ddfinance.backend.controller;

import com.ddfinance.backend.dto.investment.*;
import com.ddfinance.backend.service.investment.InvestmentService;
import com.ddfinance.backend.service.investment.StockDataService;
import com.ddfinance.core.domain.enums.InvestmentStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for InvestmentController.
 * Tests investment management endpoints for authorized users.
 */
@WebMvcTest(InvestmentController.class)
class InvestmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private InvestmentService investmentService;

    @MockitoBean
    private StockDataService stockDataService;

    private InvestmentDTO investmentDTO;
    private UpdateInvestmentRequest updateRequest;
    private InvestmentPerformanceDTO performanceDTO;
    private StockQuoteDTO stockQuoteDTO;
    private MarketOverviewDTO marketOverviewDTO;

    @BeforeEach
    void setUp() {
        // Setup test data
        investmentDTO = InvestmentDTO.builder()
                .id(1000L)
                .clientId(100L)
                .stockSymbol("AAPL")
                .stockName("Apple Inc.")
                .quantity(100)
                .purchasePrice(150.0)
                .currentPrice(175.0)
                .totalValue(17500.0)
                .profitLoss(2500.0)
                .profitLossPercentage(16.67)
                .status(InvestmentStatus.ACTIVE)
                .purchaseDate(LocalDateTime.now().minusMonths(6))
                .lastUpdated(LocalDateTime.now())
                .build();

        updateRequest = UpdateInvestmentRequest.builder()
                .notes("Quarterly review completed")
                .autoReinvestDividends(true)
                .build();

        performanceDTO = InvestmentPerformanceDTO.builder()
                .investmentId(1000L)
                .totalReturn(2500.0)
                .totalReturnPercentage(16.67)
                .annualizedReturn(33.34)
                .dividendsEarned(150.0)
                .timeWeightedReturn(15.5)
                .build();

        stockQuoteDTO = StockQuoteDTO.builder()
                .symbol("AAPL")
                .companyName("Apple Inc.")
                .currentPrice(175.0)
                .dayChange(2.50)
                .dayChangePercentage(1.45)
                .dayHigh(176.0)
                .dayLow(172.5)
                .volume(75000000L)
                .marketCap(2800000000000L)
                .peRatio(28.5)
                .build();

        marketOverviewDTO = MarketOverviewDTO.builder()
                .indexName("S&P 500")
                .currentValue(4500.0)
                .dayChange(25.0)
                .dayChangePercentage(0.56)
                .marketStatus("OPEN")
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetInvestmentById() throws Exception {
        // Given
        when(investmentService.getInvestmentById(1000L)).thenReturn(investmentDTO);

        // When & Then
        mockMvc.perform(get("/api/investments/1000")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1000))
                .andExpect(jsonPath("$.stockSymbol").value("AAPL"))
                .andExpect(jsonPath("$.totalValue").value(17500.0));

        verify(investmentService, times(1)).getInvestmentById(1000L);
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testUpdateInvestment() throws Exception {
        // Given
        InvestmentDTO updatedInvestment = InvestmentDTO.builder()
                .id(1000L)
                .notes("Quarterly review completed")
                .autoReinvestDividends(true)
                .build();
        when(investmentService.updateInvestment(eq(1000L), any(UpdateInvestmentRequest.class)))
                .thenReturn(updatedInvestment);

        // When & Then
        mockMvc.perform(put("/api/investments/1000")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value("Quarterly review completed"));

        verify(investmentService, times(1)).updateInvestment(eq(1000L), any(UpdateInvestmentRequest.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetInvestmentsByStatus() throws Exception {
        // Given
        List<InvestmentDTO> investments = Arrays.asList(investmentDTO);
        when(investmentService.getInvestmentsByStatus(InvestmentStatus.ACTIVE)).thenReturn(investments);

        // When & Then
        mockMvc.perform(get("/api/investments")
                        .param("status", "ACTIVE")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));

        verify(investmentService, times(1)).getInvestmentsByStatus(InvestmentStatus.ACTIVE);
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetInvestmentPerformance() throws Exception {
        // Given
        when(investmentService.getInvestmentPerformance(1000L)).thenReturn(performanceDTO);

        // When & Then
        mockMvc.perform(get("/api/investments/1000/performance")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReturn").value(2500.0))
                .andExpect(jsonPath("$.annualizedReturn").value(33.34));

        verify(investmentService, times(1)).getInvestmentPerformance(1000L);
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetStockQuote() throws Exception {
        // Given
        when(stockDataService.getStockQuote("AAPL")).thenReturn(stockQuoteDTO);

        // When & Then
        mockMvc.perform(get("/api/investments/quotes/AAPL")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.currentPrice").value(175.0))
                .andExpect(jsonPath("$.marketCap").value(2800000000000L));

        verify(stockDataService, times(1)).getStockQuote("AAPL");
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetMultipleStockQuotes() throws Exception {
        // Given
        List<String> symbols = Arrays.asList("AAPL", "GOOGL", "MSFT");
        List<StockQuoteDTO> quotes = Arrays.asList(stockQuoteDTO);
        when(stockDataService.getMultipleQuotes(symbols)).thenReturn(quotes);

        // When & Then
        mockMvc.perform(post("/api/investments/quotes/batch")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(symbols)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("AAPL"));

        verify(stockDataService, times(1)).getMultipleQuotes(symbols);
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testSearchStocks() throws Exception {
        // Given
        List<StockSearchResultDTO> searchResults = Arrays.asList(
                StockSearchResultDTO.builder()
                        .symbol("AAPL")
                        .name("Apple Inc.")
                        .exchange("NASDAQ")
                        .type("Common Stock")
                        .build()
        );
        when(stockDataService.searchStocks("apple")).thenReturn(searchResults);

        // When & Then
        mockMvc.perform(get("/api/investments/search")
                        .param("query", "apple")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("AAPL"))
                .andExpect(jsonPath("$[0].exchange").value("NASDAQ"));

        verify(stockDataService, times(1)).searchStocks("apple");
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetMarketOverview() throws Exception {
        // Given
        List<MarketOverviewDTO> marketData = Arrays.asList(marketOverviewDTO);
        when(stockDataService.getMarketOverview()).thenReturn(marketData);

        // When & Then
        mockMvc.perform(get("/api/investments/market-overview")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].indexName").value("S&P 500"))
                .andExpect(jsonPath("$[0].marketStatus").value("OPEN"));

        verify(stockDataService, times(1)).getMarketOverview();
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetInvestmentHistory() throws Exception {
        // Given
        List<Map<String, Object>> history = new ArrayList<>();
        Map<String, Object> transaction = new HashMap<>();
        transaction.put("date", LocalDateTime.now().toString());
        transaction.put("action", "PURCHASE");
        transaction.put("quantity", 100);
        transaction.put("price", 150.0);
        history.add(transaction);

        when(investmentService.getInvestmentHistory(1000L)).thenReturn(history);

        // When & Then
        mockMvc.perform(get("/api/investments/1000/history")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("PURCHASE"))
                .andExpect(jsonPath("$[0].quantity").value(100));

        verify(investmentService, times(1)).getInvestmentHistory(1000L);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetInvestmentAnalytics() throws Exception {
        // Given
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalInvestments", 500);
        analytics.put("totalValue", 50000000.0);
        analytics.put("averageReturn", 12.5);
        analytics.put("topPerformingStock", "NVDA");
        analytics.put("sectorDistribution", Map.of("Technology", 45.0, "Healthcare", 25.0));

        when(investmentService.getInvestmentAnalytics()).thenReturn(analytics);

        // When & Then
        mockMvc.perform(get("/api/investments/analytics")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInvestments").value(500))
                .andExpect(jsonPath("$.averageReturn").value(12.5));

        verify(investmentService, times(1)).getInvestmentAnalytics();
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testValidateStockSymbol() throws Exception {
        // Given
        Map<String, Object> validation = new HashMap<>();
        validation.put("valid", true);
        validation.put("symbol", "AAPL");
        validation.put("name", "Apple Inc.");
        validation.put("exchange", "NASDAQ");

        when(stockDataService.validateSymbol("AAPL")).thenReturn(validation);

        // When & Then
        mockMvc.perform(get("/api/investments/validate/AAPL")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.exchange").value("NASDAQ"));

        verify(stockDataService, times(1)).validateSymbol("AAPL");
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetDividendHistory() throws Exception {
        // Given
        List<Map<String, Object>> dividends = new ArrayList<>();
        Map<String, Object> dividend = new HashMap<>();
        dividend.put("exDate", "2025-03-15");
        dividend.put("amount", 0.24);
        dividend.put("paymentDate", "2025-03-22");
        dividends.add(dividend);

        when(stockDataService.getDividendHistory("AAPL")).thenReturn(dividends);

        // When & Then
        mockMvc.perform(get("/api/investments/dividends/AAPL")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].amount").value(0.24));

        verify(stockDataService, times(1)).getDividendHistory("AAPL");
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testRefreshInvestmentPrices() throws Exception {
        // Given
        Map<String, String> response = new HashMap<>();
        response.put("message", "Investment prices refreshed successfully");
        response.put("updated", "25");

        when(investmentService.refreshAllPrices()).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/investments/refresh-prices")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Investment prices refreshed successfully"))
                .andExpect(jsonPath("$.updated").value("25"));

        verify(investmentService, times(1)).refreshAllPrices();
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testGuestCannotAccessInvestments() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/investments/1000")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUnauthenticatedAccess() throws Exception {
        // When & Then - Market overview should be accessible
        mockMvc.perform(get("/api/investments/market-overview"))
                .andExpect(status().isOk());

        // Investment details should require authentication
        mockMvc.perform(get("/api/investments/1000"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testInvalidStockSymbol() throws Exception {
        // Given
        when(stockDataService.getStockQuote("INVALID"))
                .thenThrow(new EntityNotFoundException("Stock symbol not found: INVALID"));

        // When & Then
        mockMvc.perform(get("/api/investments/quotes/INVALID")
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Stock symbol not found: INVALID"));
    }
}
