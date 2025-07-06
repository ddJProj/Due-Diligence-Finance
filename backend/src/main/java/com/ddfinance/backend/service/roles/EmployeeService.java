package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.dto.actions.MessageDTO;
import com.ddfinance.backend.dto.investment.CreateInvestmentRequest;
import com.ddfinance.backend.dto.investment.InvestmentDTO;
import com.ddfinance.backend.dto.roles.ClientDTO;
import com.ddfinance.backend.dto.roles.EmployeeDetailsDTO;

import java.util.List;
import java.util.Map;

/**
 * Service interface for employee-specific operations.
 * Handles client management, investment operations, and employee metrics.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface EmployeeService {

    /**
     * Gets employee details.
     *
     * @param email Employee's email
     * @return Employee details
     * @throws com.ddfinance.core.exception.EntityNotFoundException if employee not found
     */
    EmployeeDetailsDTO getEmployeeDetails(String email);

    /**
     * Gets all clients assigned to employee.
     *
     * @param email Employee's email
     * @return List of assigned clients
     * @throws com.ddfinance.core.exception.EntityNotFoundException if employee not found
     */
    List<ClientDTO> getAssignedClients(String email);

    /**
     * Gets specific client for employee.
     *
     * @param email Employee's email
     * @param clientId Client ID
     * @return Client details
     * @throws com.ddfinance.core.exception.EntityNotFoundException if not found
     * @throws com.ddfinance.core.exception.SecurityException.ForbiddenException if not assigned
     */
    ClientDTO getClientForEmployee(String email, Long clientId);

    /**
     * Gets investments for a client.
     *
     * @param email Employee's email
     * @param clientId Client ID
     * @return List of investments
     * @throws com.ddfinance.core.exception.SecurityException.ForbiddenException if not assigned
     */
    List<InvestmentDTO> getClientInvestments(String email, Long clientId);

    /**
     * Creates new investment for client.
     *
     * @param email Employee's email
     * @param request Investment creation request
     * @return Creation result with investment ID
     * @throws com.ddfinance.core.exception.ValidationException if invalid request
     * @throws com.ddfinance.core.exception.SecurityException.ForbiddenException if not assigned
     */
    Map<String, Object> createInvestment(String email, CreateInvestmentRequest request);

    /**
     * Updates investment status.
     *
     * @param email Employee's email
     * @param investmentId Investment ID
     * @param status New status
     * @return Updated investment
     * @throws com.ddfinance.core.exception.EntityNotFoundException if not found
     * @throws com.ddfinance.core.exception.ValidationException if invalid status
     */
    InvestmentDTO updateInvestmentStatus(String email, Long investmentId, String status);

    /**
     * Sends message to client.
     *
     * @param email Employee's email
     * @param clientId Client ID
     * @param message Message to send
     * @return Send result
     * @throws com.ddfinance.core.exception.SecurityException.ForbiddenException if not assigned
     */
    Map<String, Object> sendMessageToClient(String email, Long clientId, MessageDTO message);

    /**
     * Gets messages from clients.
     *
     * @param email Employee's email
     * @return List of messages
     */
    List<Map<String, Object>> getMessagesFromClients(String email);

    /**
     * Gets employee performance metrics.
     *
     * @param email Employee's email
     * @return Performance metrics map
     */
    Map<String, Object> getPerformanceMetrics(String email);

    /**
     * Searches assigned clients.
     *
     * @param email Employee's email
     * @param query Search query
     * @return Matching clients
     */
    List<ClientDTO> searchClients(String email, String query);

    /**
     * Generates client report.
     *
     * @param email Employee's email
     * @param clientId Client ID
     * @param format Report format
     * @return Report data
     * @throws com.ddfinance.core.exception.SecurityException.ForbiddenException if not assigned
     */
    byte[] generateClientReport(String email, Long clientId, String format);

    /**
     * Gets pending investments.
     *
     * @param email Employee's email
     * @return List of pending investments
     */
    List<InvestmentDTO> getPendingInvestments(String email);

    /**
     * Updates client notes.
     *
     * @param email Employee's email
     * @param clientId Client ID
     * @param notes Updated notes
     * @throws com.ddfinance.core.exception.SecurityException.ForbiddenException if not assigned
     */
    void updateClientNotes(String email, Long clientId, String notes);

    /**
     * Gets employee calendar/schedule.
     *
     * @param email Employee's email
     * @return Calendar events
     */
    List<Map<String, Object>> getEmployeeSchedule(String email);

    /**
     * Records client meeting.
     *
     * @param email Employee's email
     * @param clientId Client ID
     * @param meetingDetails Meeting details
     * @return Meeting record ID
     */
    Long recordClientMeeting(String email, Long clientId, Map<String, Object> meetingDetails);
}
