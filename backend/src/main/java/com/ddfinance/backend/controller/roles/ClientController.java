package com.ddfinance.backend.controller.roles;

import com.ddfinance.backend.dto.actions.MessageDTO;
import com.ddfinance.backend.dto.investment.InvestmentDTO;
import com.ddfinance.backend.dto.investment.PortfolioSummaryDTO;
import com.ddfinance.backend.dto.roles.ClientDetailsDTO;
import com.ddfinance.backend.service.roles.ClientService;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.exception.SecurityException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for client-specific operations.
 * Handles portfolio management, investment viewing, and client-employee communication.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENT')")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class ClientController {

    private final ClientService clientService;

    /**
     * Gets the current client's detailed information.
     *
     * @param userDetails The authenticated client
     * @return Client details including assigned employee
     */
    @GetMapping("/me")
    public ResponseEntity<ClientDetailsDTO> getMyDetails(@AuthenticationPrincipal UserDetails userDetails) {
        ClientDetailsDTO details = clientService.getClientDetails(userDetails.getUsername());
        return ResponseEntity.ok(details);
    }

    /**
     * Gets the client's portfolio summary.
     *
     * @param userDetails The authenticated client
     * @return Portfolio summary with performance metrics
     */
    @GetMapping("/me/portfolio")
    public ResponseEntity<PortfolioSummaryDTO> getMyPortfolio(@AuthenticationPrincipal UserDetails userDetails) {
        PortfolioSummaryDTO portfolio = clientService.getPortfolioSummary(userDetails.getUsername());
        return ResponseEntity.ok(portfolio);
    }

    /**
     * Gets all investments for the client.
     *
     * @param userDetails The authenticated client
     * @return List of client's investments
     */
    @GetMapping("/me/investments")
    public ResponseEntity<List<InvestmentDTO>> getMyInvestments(@AuthenticationPrincipal UserDetails userDetails) {
        List<InvestmentDTO> investments = clientService.getClientInvestments(userDetails.getUsername());
        return ResponseEntity.ok(investments);
    }

    /**
     * Gets a specific investment by ID.
     *
     * @param userDetails The authenticated client
     * @param investmentId Investment ID
     * @return Investment details
     */
    @GetMapping("/me/investments/{investmentId}")
    public ResponseEntity<InvestmentDTO> getInvestmentById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long investmentId) {

        InvestmentDTO investment = clientService.getInvestmentForClient(
                userDetails.getUsername(), investmentId);
        return ResponseEntity.ok(investment);
    }

    /**
     * Gets investment transaction history.
     *
     * @param userDetails The authenticated client
     * @param investmentId Investment ID
     * @return Transaction history
     */
    @GetMapping("/me/investments/{investmentId}/history")
    public ResponseEntity<List<Map<String, Object>>> getInvestmentHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long investmentId) {

        List<Map<String, Object>> history = clientService.getInvestmentHistory(
                userDetails.getUsername(), investmentId);
        return ResponseEntity.ok(history);
    }

    /**
     * Sends a message to the assigned employee.
     *
     * @param userDetails The authenticated client
     * @param message Message to send
     * @return Send confirmation
     */
    @PostMapping("/me/messages")
    public ResponseEntity<Map<String, Object>> messageEmployee(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MessageDTO message) {

        Map<String, Object> result = clientService.sendMessageToEmployee(
                userDetails.getUsername(), message);
        return ResponseEntity.ok(result);
    }

    /**
     * Gets all messages for the client.
     *
     * @param userDetails The authenticated client
     * @return List of messages
     */
    @GetMapping("/me/messages")
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<Map<String, Object>> messages = clientService.getClientMessages(userDetails.getUsername());
        return ResponseEntity.ok(messages);
    }

    /**
     * Marks a message as read.
     *
     * @param userDetails The authenticated client
     * @param messageId Message ID
     * @return Confirmation
     */
    @PutMapping("/me/messages/{messageId}/read")
    public ResponseEntity<Map<String, String>> markMessageAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long messageId) {

        clientService.markMessageAsRead(userDetails.getUsername(), messageId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Message marked as read");
        return ResponseEntity.ok(response);
    }

    /**
     * Gets performance report for specified period.
     *
     * @param userDetails The authenticated client
     * @param period Report period (DAILY, WEEKLY, MONTHLY, YEARLY)
     * @return Performance metrics
     */
    @GetMapping("/me/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String period) {

        if (!isValidPeriod(period)) {
            throw new ValidationException("Invalid period. Must be DAILY, WEEKLY, MONTHLY, or YEARLY");
        }

        Map<String, Object> performance = clientService.getPerformanceReport(
                userDetails.getUsername(), period);
        return ResponseEntity.ok(performance);
    }

    /**
     * Updates client's investment preferences.
     *
     * @param userDetails The authenticated client
     * @param preferences Investment preferences
     * @return Update confirmation
     */
    @PutMapping("/me/preferences")
    public ResponseEntity<Map<String, Object>> updateInvestmentPreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> preferences) {

        Map<String, Object> result = clientService.updateInvestmentPreferences(
                userDetails.getUsername(), preferences);
        return ResponseEntity.ok(result);
    }

    /**
     * Downloads investment statements.
     *
     * @param userDetails The authenticated client
     * @param format Statement format (PDF, CSV)
     * @param period Statement period
     * @return Statement file
     */
    @GetMapping("/me/statements")
    public ResponseEntity<byte[]> downloadStatement(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String format,
            @RequestParam String period) {

        // TODO: Implement statement generation
        throw new UnsupportedOperationException("Statement download not yet implemented");
    }

    /**
     * Validates report period.
     */
    private boolean isValidPeriod(String period) {
        return period != null &&
                (period.equals("DAILY") || period.equals("WEEKLY") ||
                        period.equals("MONTHLY") || period.equals("YEARLY"));
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
     * Exception handler for forbidden access.
     */
    @ExceptionHandler(SecurityException.ForbiddenException.class)
    public ResponseEntity<Map<String, String>> handleForbidden(SecurityException.ForbiddenException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
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
