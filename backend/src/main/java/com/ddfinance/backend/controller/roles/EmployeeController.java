package com.ddfinance.backend.controller.roles;

import com.ddfinance.backend.dto.actions.MessageDTO;
import com.ddfinance.backend.dto.investment.CreateInvestmentRequest;
import com.ddfinance.backend.dto.investment.InvestmentDTO;
import com.ddfinance.backend.dto.roles.ClientDTO;
import com.ddfinance.backend.dto.roles.EmployeeDetailsDTO;
import com.ddfinance.backend.service.roles.EmployeeService;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.exception.SecurityException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for employee-specific operations.
 * Handles client management, investment creation, and employee-client communication.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYEE')")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class EmployeeController {

    private final EmployeeService employeeService;

    /**
     * Gets the current employee's detailed information.
     *
     * @param userDetails The authenticated employee
     * @return Employee details including performance metrics
     */
    @GetMapping("/me")
    public ResponseEntity<EmployeeDetailsDTO> getMyDetails(@AuthenticationPrincipal UserDetails userDetails) {
        EmployeeDetailsDTO details = employeeService.getEmployeeDetails(userDetails.getUsername());
        return ResponseEntity.ok(details);
    }

    /**
     * Gets all clients assigned to the employee.
     *
     * @param userDetails The authenticated employee
     * @return List of assigned clients
     */
    @GetMapping("/me/clients")
    public ResponseEntity<List<ClientDTO>> getMyClients(@AuthenticationPrincipal UserDetails userDetails) {
        List<ClientDTO> clients = employeeService.getAssignedClients(userDetails.getUsername());
        return ResponseEntity.ok(clients);
    }

    /**
     * Gets a specific client by ID (must be assigned to employee).
     *
     * @param userDetails The authenticated employee
     * @param clientId Client ID
     * @return Client details
     */
    @GetMapping("/clients/{clientId}")
    public ResponseEntity<ClientDTO> getClientById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long clientId) {

        ClientDTO client = employeeService.getClientForEmployee(userDetails.getUsername(), clientId);
        return ResponseEntity.ok(client);
    }

    /**
     * Gets all investments for a specific client.
     *
     * @param userDetails The authenticated employee
     * @param clientId Client ID
     * @return List of client investments
     */
    @GetMapping("/clients/{clientId}/investments")
    public ResponseEntity<List<InvestmentDTO>> getClientInvestments(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long clientId) {

        List<InvestmentDTO> investments = employeeService.getClientInvestments(
                userDetails.getUsername(), clientId);
        return ResponseEntity.ok(investments);
    }

    /**
     * Creates a new investment for a client.
     *
     * @param userDetails The authenticated employee
     * @param request Investment creation request
     * @return Creation result
     */
    @PostMapping("/investments")
    public ResponseEntity<Map<String, Object>> createInvestment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateInvestmentRequest request) {

        Map<String, Object> result = employeeService.createInvestment(
                userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /**
     * Updates investment status.
     *
     * @param userDetails The authenticated employee
     * @param investmentId Investment ID
     * @param status New status
     * @return Updated investment
     */
    @PutMapping("/investments/{investmentId}/status")
    public ResponseEntity<InvestmentDTO> updateInvestmentStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long investmentId,
            @RequestBody String status) {

        InvestmentDTO updated = employeeService.updateInvestmentStatus(
                userDetails.getUsername(), investmentId, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * Sends a message to a client.
     *
     * @param userDetails The authenticated employee
     * @param clientId Client ID
     * @param message Message to send
     * @return Send result
     */
    @PostMapping("/clients/{clientId}/messages")
    public ResponseEntity<Map<String, Object>> sendMessageToClient(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long clientId,
            @Valid @RequestBody MessageDTO message) {

        Map<String, Object> result = employeeService.sendMessageToClient(
                userDetails.getUsername(), clientId, message);
        return ResponseEntity.ok(result);
    }

    /**
     * Gets all messages from clients.
     *
     * @param userDetails The authenticated employee
     * @return List of messages
     */
    @GetMapping("/messages")
    public ResponseEntity<List<Map<String, Object>>> getClientMessages(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<Map<String, Object>> messages = employeeService.getMessagesFromClients(
                userDetails.getUsername());
        return ResponseEntity.ok(messages);
    }

    /**
     * Gets employee performance metrics.
     *
     * @param userDetails The authenticated employee
     * @return Performance metrics
     */
    @GetMapping("/me/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics(
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> metrics = employeeService.getPerformanceMetrics(
                userDetails.getUsername());
        return ResponseEntity.ok(metrics);
    }

    /**
     * Searches clients by name or email.
     *
     * @param userDetails The authenticated employee
     * @param query Search query
     * @return Matching clients (only assigned ones)
     */
    @GetMapping("/clients/search")
    public ResponseEntity<List<ClientDTO>> searchClients(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String query) {

        List<ClientDTO> results = employeeService.searchClients(
                userDetails.getUsername(), query);
        return ResponseEntity.ok(results);
    }

    /**
     * Generates client report.
     *
     * @param userDetails The authenticated employee
     * @param clientId Client ID
     * @param format Report format (PDF, CSV)
     * @return Report file
     */
    @GetMapping("/clients/{clientId}/report")
    public ResponseEntity<byte[]> generateClientReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long clientId,
            @RequestParam String format) {

        if (!format.equalsIgnoreCase("PDF") && !format.equalsIgnoreCase("CSV")) {
            throw new ValidationException("Format must be PDF or CSV");
        }

        byte[] reportData = employeeService.generateClientReport(
                userDetails.getUsername(), clientId, format);

        HttpHeaders headers = new HttpHeaders();
        if (format.equalsIgnoreCase("PDF")) {
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    String.format("client_report_%d.pdf", clientId));
        } else {
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment",
                    String.format("client_report_%d.csv", clientId));
        }

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }

    /**
     * Gets pending investments requiring attention.
     *
     * @param userDetails The authenticated employee
     * @return List of pending investments
     */
    @GetMapping("/investments/pending")
    public ResponseEntity<List<InvestmentDTO>> getPendingInvestments(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<InvestmentDTO> pending = employeeService.getPendingInvestments(
                userDetails.getUsername());
        return ResponseEntity.ok(pending);
    }

    /**
     * Updates client notes.
     *
     * @param userDetails The authenticated employee
     * @param clientId Client ID
     * @param notes Updated notes
     * @return Update confirmation
     */
    @PutMapping("/clients/{clientId}/notes")
    public ResponseEntity<Map<String, String>> updateClientNotes(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long clientId,
            @RequestBody Map<String, String> body) {

        String notes = body.get("notes");
        employeeService.updateClientNotes(userDetails.getUsername(), clientId, notes);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Client notes updated successfully");
        return ResponseEntity.ok(response);
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
