package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.dto.actions.MessageDTO;
import com.ddfinance.backend.dto.investment.InvestmentDTO;
import com.ddfinance.backend.dto.investment.PortfolioSummaryDTO;
import com.ddfinance.backend.dto.roles.ClientDetailsDTO;

import java.util.List;
import java.util.Map;

/**
 * Service interface for client-specific operations.
 * Handles portfolio management, investments, and client-employee communication.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface ClientService {

    /**
     * Gets detailed client information.
     *
     * @param email Client's email
     * @return Client details
     * @throws com.ddfinance.core.exception.EntityNotFoundException if client not found
     */
    ClientDetailsDTO getClientDetails(String email);

    /**
     * Gets client's portfolio summary.
     *
     * @param email Client's email
     * @return Portfolio summary with metrics
     * @throws com.ddfinance.core.exception.EntityNotFoundException if client not found
     */
    PortfolioSummaryDTO getPortfolioSummary(String email);

    /**
     * Gets all investments for a client.
     *
     * @param email Client's email
     * @return List of investments
     * @throws com.ddfinance.core.exception.EntityNotFoundException if client not found
     */
    List<InvestmentDTO> getClientInvestments(String email);

    /**
     * Gets specific investment for client.
     *
     * @param email Client's email
     * @param investmentId Investment ID
     * @return Investment details
     * @throws com.ddfinance.core.exception.EntityNotFoundException if not found
     * @throws com.ddfinance.core.exception.SecurityException.ForbiddenException if not owned by client
     */
    InvestmentDTO getInvestmentForClient(String email, Long investmentId);

    /**
     * Gets investment transaction history.
     *
     * @param email Client's email
     * @param investmentId Investment ID
     * @return Transaction history
     * @throws com.ddfinance.core.exception.EntityNotFoundException if not found
     * @throws com.ddfinance.core.exception.SecurityException.ForbiddenException if not owned by client
     */
    List<Map<String, Object>> getInvestmentHistory(String email, Long investmentId);

    /**
     * Sends message to assigned employee.
     *
     * @param email Client's email
     * @param message Message to send
     * @return Send result with message ID
     * @throws com.ddfinance.core.exception.EntityNotFoundException if employee not found
     */
    Map<String, Object> sendMessageToEmployee(String email, MessageDTO message);

    /**
     * Gets all messages for client.
     *
     * @param email Client's email
     * @return List of messages
     * @throws com.ddfinance.core.exception.EntityNotFoundException if client not found
     */
    List<Map<String, Object>> getClientMessages(String email);

    /**
     * Marks message as read.
     *
     * @param email Client's email
     * @param messageId Message ID
     * @throws com.ddfinance.core.exception.EntityNotFoundException if message not found
     * @throws com.ddfinance.core.exception.SecurityException.ForbiddenException if not recipient
     */
    void markMessageAsRead(String email, Long messageId);

    /**
     * Gets performance report for period.
     *
     * @param email Client's email
     * @param period Report period (DAILY, WEEKLY, MONTHLY, YEARLY)
     * @return Performance metrics
     * @throws com.ddfinance.core.exception.EntityNotFoundException if client not found
     */
    Map<String, Object> getPerformanceReport(String email, String period);

    /**
     * Updates client's investment preferences.
     *
     * @param email Client's email
     * @param preferences Preference map
     * @return Update result
     * @throws com.ddfinance.core.exception.EntityNotFoundException if client not found
     */
    Map<String, Object> updateInvestmentPreferences(String email, Map<String, Object> preferences);

    /**
     * Creates investment request for client.
     *
     * @param email Client's email
     * @param investmentRequest Investment request details
     * @return Created investment request ID
     * @throws com.ddfinance.core.exception.ValidationException if invalid request
     */
    Long createInvestmentRequest(String email, Map<String, Object> investmentRequest);

    /**
     * Gets client's transaction history.
     *
     * @param email Client's email
     * @param limit Number of transactions to return
     * @return Transaction history
     */
    List<Map<String, Object>> getTransactionHistory(String email, Integer limit);

    /**
     * Gets tax documents for client.
     *
     * @param email Client's email
     * @param year Tax year
     * @return List of tax documents
     */
    List<Map<String, Object>> getTaxDocuments(String email, Integer year);
}
