package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.dto.actions.CreateUpgradeRequestDTO;
import com.ddfinance.backend.dto.actions.UpgradeRequestDTO;
import com.ddfinance.backend.dto.roles.GuestDetailsDTO;

import java.util.List;
import java.util.Map;

/**
 * Service interface for guest-specific operations.
 * Handles limited access features and upgrade request management.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface GuestService {

    /**
     * Gets guest details.
     *
     * @param email Guest's email
     * @return Guest details
     * @throws com.ddfinance.core.exception.EntityNotFoundException if guest not found
     */
    GuestDetailsDTO getGuestDetails(String email);

    /**
     * Gets public company information.
     *
     * @return Public information map
     */
    Map<String, Object> getPublicInformation();

    /**
     * Submits upgrade request to become client.
     *
     * @param email Guest's email
     * @param request Upgrade request details
     * @return Submission result with request ID
     * @throws com.ddfinance.core.exception.ValidationException if request already exists
     */
    Map<String, Object> requestUpgrade(String email, CreateUpgradeRequestDTO request);

    /**
     * Gets upgrade request for guest.
     *
     * @param email Guest's email
     * @return Upgrade request details
     * @throws com.ddfinance.core.exception.EntityNotFoundException if no request found
     */
    UpgradeRequestDTO getUpgradeRequest(String email);

    /**
     * Cancels upgrade request.
     *
     * @param email Guest's email
     * @throws com.ddfinance.core.exception.EntityNotFoundException if no request found
     * @throws com.ddfinance.core.exception.ValidationException if request already processed
     */
    void cancelUpgradeRequest(String email);

    /**
     * Updates guest profile.
     *
     * @param email Guest's email
     * @param profileData Profile update data
     * @return Updated guest details
     * @throws com.ddfinance.core.exception.EntityNotFoundException if guest not found
     */
    GuestDetailsDTO updateProfile(String email, Map<String, String> profileData);

    /**
     * Gets frequently asked questions.
     *
     * @return List of FAQs
     */
    List<Map<String, String>> getFAQ();

    /**
     * Gets investment options information.
     *
     * @return List of investment options
     */
    List<Map<String, Object>> getInvestmentOptions();

    /**
     * Calculates projected returns.
     *
     * @param amount Initial investment
     * @param years Investment period
     * @return Projection calculations
     */
    Map<String, Object> calculateProjectedReturns(Double amount, Integer years);

    /**
     * Gets educational resources.
     *
     * @return List of resources
     */
    List<Map<String, Object>> getEducationalResources();

    /**
     * Submits contact request to sales.
     *
     * @param contactRequest Contact details
     */
    void submitContactRequest(Map<String, String> contactRequest);

    /**
     * Checks if guest can submit upgrade request.
     *
     * @param email Guest's email
     * @return Eligibility status
     */
    Map<String, Object> checkUpgradeEligibility(String email);

    /**
     * Gets guest activity summary.
     *
     * @param email Guest's email
     * @return Activity summary
     */
    Map<String, Object> getActivitySummary(String email);
}
