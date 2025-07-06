package com.ddfinance.backend.controller.roles;

import com.ddfinance.backend.dto.actions.CreateUpgradeRequestDTO;
import com.ddfinance.backend.dto.actions.UpgradeRequestDTO;
import com.ddfinance.backend.dto.roles.GuestDetailsDTO;
import com.ddfinance.backend.service.roles.GuestService;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
 * REST controller for guest-specific operations.
 * Handles limited access features and upgrade requests to become a client.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@RestController
@RequestMapping("/api/guests")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class GuestController {

    private final GuestService guestService;

    /**
     * Gets the current guest's details.
     *
     * @param userDetails The authenticated guest
     * @return Guest details
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<GuestDetailsDTO> getMyDetails(@AuthenticationPrincipal UserDetails userDetails) {
        GuestDetailsDTO details = guestService.getGuestDetails(userDetails.getUsername());
        return ResponseEntity.ok(details);
    }

    /**
     * Gets public company information.
     * Accessible without authentication.
     *
     * @return Public information
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getPublicInformation() {
        Map<String, Object> info = guestService.getPublicInformation();
        return ResponseEntity.ok(info);
    }

    /**
     * Submits an upgrade request to become a client.
     *
     * @param userDetails The authenticated guest
     * @param request Upgrade request details
     * @return Submission result
     */
    @PostMapping("/me/upgrade")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<Map<String, Object>> requestUpgrade(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateUpgradeRequestDTO request) {

        Map<String, Object> result = guestService.requestUpgrade(
                userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /**
     * Gets the guest's upgrade request status.
     *
     * @param userDetails The authenticated guest
     * @return Upgrade request details
     */
    @GetMapping("/me/upgrade")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<UpgradeRequestDTO> getMyUpgradeRequest(
            @AuthenticationPrincipal UserDetails userDetails) {

        UpgradeRequestDTO upgradeRequest = guestService.getUpgradeRequest(userDetails.getUsername());
        return ResponseEntity.ok(upgradeRequest);
    }

    /**
     * Cancels the guest's upgrade request.
     *
     * @param userDetails The authenticated guest
     * @return Cancellation confirmation
     */
    @DeleteMapping("/me/upgrade")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<Map<String, String>> cancelUpgradeRequest(
            @AuthenticationPrincipal UserDetails userDetails) {

        guestService.cancelUpgradeRequest(userDetails.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Upgrade request cancelled successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Updates guest profile information.
     *
     * @param userDetails The authenticated guest
     * @param profileData Profile update data
     * @return Updated guest details
     */
    @PutMapping("/me/profile")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<GuestDetailsDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> profileData) {

        GuestDetailsDTO updated = guestService.updateProfile(
                userDetails.getUsername(), profileData);
        return ResponseEntity.ok(updated);
    }

    /**
     * Gets frequently asked questions.
     * Accessible without authentication.
     *
     * @return List of FAQs
     */
    @GetMapping("/faq")
    public ResponseEntity<List<Map<String, String>>> getFAQ() {
        List<Map<String, String>> faqs = guestService.getFAQ();
        return ResponseEntity.ok(faqs);
    }

    /**
     * Gets available investment options information.
     * Accessible without authentication.
     *
     * @return Investment options
     */
    @GetMapping("/investment-options")
    public ResponseEntity<List<Map<String, Object>>> getInvestmentOptions() {
        List<Map<String, Object>> options = guestService.getInvestmentOptions();
        return ResponseEntity.ok(options);
    }

    /**
     * Calculates projected investment returns.
     * Accessible without authentication.
     *
     * @param amount Initial investment amount
     * @param years Investment period in years
     * @return Projected returns
     */
    @GetMapping("/calculate-returns")
    public ResponseEntity<Map<String, Object>> calculateProjectedReturns(
            @RequestParam @Min(1000) @Max(10000000) Double amount,
            @RequestParam @Min(1) @Max(50) Integer years) {

        Map<String, Object> projections = guestService.calculateProjectedReturns(amount, years);
        return ResponseEntity.ok(projections);
    }

    /**
     * Gets educational resources.
     * Accessible without authentication.
     *
     * @return Educational content
     */
    @GetMapping("/resources")
    public ResponseEntity<List<Map<String, Object>>> getEducationalResources() {
        List<Map<String, Object>> resources = guestService.getEducationalResources();
        return ResponseEntity.ok(resources);
    }

    /**
     * Contacts sales team.
     *
     * @param contactRequest Contact information
     * @return Contact confirmation
     */
    @PostMapping("/contact")
    public ResponseEntity<Map<String, String>> contactSales(
            @RequestBody Map<String, String> contactRequest) {

        // Validate required fields
        if (!contactRequest.containsKey("name") || !contactRequest.containsKey("email") ||
                !contactRequest.containsKey("message")) {
            throw new ValidationException("Name, email, and message are required");
        }

        guestService.submitContactRequest(contactRequest);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Thank you for your interest. Our team will contact you soon.");
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
     * Exception handler for validation errors.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidation(ValidationException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());

        if (e.hasFieldErrors()) {
            error.put("details", e.getFieldErrorSummary());
        }

        return ResponseEntity.badRequest().body(error);
    }
}