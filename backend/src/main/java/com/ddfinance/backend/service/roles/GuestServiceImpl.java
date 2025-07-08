package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.dto.actions.CreateUpgradeRequestDTO;
import com.ddfinance.backend.dto.actions.UpgradeRequestDTO;
import com.ddfinance.backend.dto.roles.GuestDetailsDTO;
import com.ddfinance.backend.repository.*;
import com.ddfinance.backend.service.notification.NotificationService;
import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.UpgradeRequestStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementation for guest-specific operations.
 * Handles limited access features and upgrade request management.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Service
@Transactional
public class GuestServiceImpl implements GuestService {

    private final UserAccountRepository userAccountRepository;
    private final GuestRepository guestRepository;
    private final GuestUpgradeRequestRepository upgradeRequestRepository;
    private final FAQRepository faqRepository;
    private final ContactRequestRepository contactRequestRepository;
    private final NotificationService notificationService;

    @Autowired
    public GuestServiceImpl(UserAccountRepository userAccountRepository,
                            GuestRepository guestRepository,
                            GuestUpgradeRequestRepository upgradeRequestRepository,
                            @Qualifier("FAQRepository") FAQRepository faqRepository,
                            ContactRequestRepository contactRequestRepository,
                            NotificationService notificationService) {
        this.userAccountRepository = userAccountRepository;
        this.guestRepository = guestRepository;
        this.upgradeRequestRepository = upgradeRequestRepository;
        this.faqRepository = faqRepository;
        this.contactRequestRepository = contactRequestRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public GuestDetailsDTO getGuestDetails(String email) {
        Guest guest = findGuestByEmail(email);

        GuestDetailsDTO dto = new GuestDetailsDTO();
        dto.setGuestId(guest.getId());
        dto.setEmail(guest.getUserAccount().getEmail());
        dto.setFirstName(guest.getUserAccount().getFirstName());
        dto.setLastName(guest.getUserAccount().getLastName());
        dto.setPhoneNumber(guest.getUserAccount().getPhoneNumber());
        dto.setRegistrationDate(guest.getUserAccount().getCreatedDate());

        // Check for upgrade request status
        Optional<GuestUpgradeRequest> latestRequest = upgradeRequestRepository
                .findByUserAccountOrderByRequestDateDesc(guest.getUserAccount())
                .stream()
                .findFirst();

        if (latestRequest.isPresent()) {
            dto.setHasUpgradeRequest(true);
            dto.setUpgradeRequestStatus(latestRequest.get().getStatus().name());
        }

        return dto;
    }

    @Override
    public Map<String, Object> getPublicInformation() {
        Map<String, Object> info = new HashMap<>();

        info.put("companyName", "Due Diligence Finance");
        info.put("companyDescription", "Professional investment management services with a focus on personalized portfolios and US stock market investments.");
        info.put("services", Arrays.asList(
                "Personalized Investment Portfolios",
                "Market Analysis and Research",
                "Tax-Efficient Investing",
                "Risk Management Strategies",
                "Retirement Planning"
        ));
        info.put("investmentOptions", Arrays.asList(
                "US Stocks (NYSE, NASDAQ)",
                "ETFs",
                "Mutual Funds",
                "Bonds",
                "Diversified Portfolios"
        ));
        info.put("minimumInvestment", "$10,000");
        info.put("contactInfo", Map.of(
                "email", "info@duediligencefinance.com",
                "phone", "+1 (555) 123-4567",
                "address", "123 Financial District, New York, NY 10006"
        ));
        info.put("officeHours", "Monday-Friday 9:00 AM - 5:00 PM EST");

        return info;
    }

    @Override
    public Map<String, Object> requestUpgrade(String email, CreateUpgradeRequestDTO request) {
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Verify user is a guest
        if (userAccount.getRole() != com.ddfinance.core.domain.enums.Role.GUEST) {
            throw new ValidationException("Only guests can request upgrades");
        }

        // Check for existing pending request
        boolean hasPendingRequest = upgradeRequestRepository
                .existsByUserAccountAndStatus(userAccount, UpgradeRequestStatus.PENDING);

        if (hasPendingRequest) {
            throw new ValidationException("You already have a pending upgrade request");
        }

        // Create new upgrade request
        GuestUpgradeRequest upgradeRequest = new GuestUpgradeRequest();
        upgradeRequest.setUserAccount(userAccount);
        upgradeRequest.setStatus(UpgradeRequestStatus.PENDING);
        upgradeRequest.setRequestDate(LocalDateTime.now());

        // Store additional KYC information - GuestUpgradeRequest uses Map<String, String>
        Map<String, String> additionalInfo = new HashMap<>();
        additionalInfo.put("phoneNumber", request.getPhoneNumber());
        additionalInfo.put("address", request.getAddress());
        additionalInfo.put("occupation", request.getOccupation());
        additionalInfo.put("annualIncome", request.getAnnualIncome().toString());
        additionalInfo.put("investmentGoals", request.getInvestmentGoals());
        additionalInfo.put("riskTolerance", request.getRiskTolerance());
        additionalInfo.put("expectedInvestmentAmount", request.getExpectedInvestmentAmount().toString());
        additionalInfo.put("sourceOfFunds", request.getSourceOfFunds());
        additionalInfo.put("agreeToIdentityVerification", request.getAgreeToIdentityVerification().toString());
        additionalInfo.put("acceptTermsAndConditions", request.getAcceptTermsAndConditions().toString());
        upgradeRequest.setAdditionalInfo(additionalInfo);

        // Build details string for the request
        String details = String.format(
                "Investment Goals: %s\nRisk Tolerance: %s\nExpected Investment: $%,.2f\nAnnual Income: $%,.2f",
                request.getInvestmentGoals(),
                request.getRiskTolerance(),
                request.getExpectedInvestmentAmount(),
                request.getAnnualIncome()
        );
        upgradeRequest.setDetails(details);

        GuestUpgradeRequest saved = upgradeRequestRepository.save(upgradeRequest);

        // Notify admins
        notificationService.notifyAdminsOfUpgradeRequest(saved);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Upgrade request submitted successfully");
        result.put("requestId", saved.getId());
        result.put("status", saved.getStatus().name());
        result.put("estimatedProcessingTime", "2-3 business days");

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public UpgradeRequestDTO getUpgradeRequest(String email) {
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<GuestUpgradeRequest> requests = upgradeRequestRepository
                .findByUserAccountOrderByRequestDateDesc(userAccount);

        if (requests.isEmpty()) {
            throw new EntityNotFoundException("No upgrade request found");
        }

        return convertToUpgradeRequestDTO(requests.get(0));
    }

    @Override
    public void cancelUpgradeRequest(String email) {
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        GuestUpgradeRequest pendingRequest = upgradeRequestRepository
                .findByUserAccountAndStatus(userAccount, UpgradeRequestStatus.PENDING)
                .orElseThrow(() -> new EntityNotFoundException("No pending upgrade request found"));

        // Delete the pending request instead of setting to CANCELLED
        upgradeRequestRepository.delete(pendingRequest);
    }

    @Override
    public GuestDetailsDTO updateProfile(String email, Map<String, String> profileData) {
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Update phone number if provided
        if (profileData.containsKey("phoneNumber")) {
            userAccount.setPhoneNumber(profileData.get("phoneNumber"));
        }

        // Update address if provided
        if (profileData.containsKey("address")) {
            userAccount.setAddress(profileData.get("address"));
        }

        userAccount.setLastModifiedDate(LocalDateTime.now());
        userAccountRepository.save(userAccount);

        return getGuestDetails(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, String>> getFAQ() {
        return faqRepository.findAllActiveOrderByDisplayOrder();
    }

    @Override
    public List<Map<String, Object>> getInvestmentOptions() {
        List<Map<String, Object>> options = new ArrayList<>();

        options.add(Map.of(
                "name", "Conservative Portfolio",
                "description", "Low-risk investments focused on capital preservation",
                "expectedReturn", "4-6% annually",
                "riskLevel", "LOW",
                "minimumInvestment", 10000.0
        ));

        options.add(Map.of(
                "name", "Balanced Portfolio",
                "description", "Mix of stocks and bonds for moderate growth",
                "expectedReturn", "6-8% annually",
                "riskLevel", "MODERATE",
                "minimumInvestment", 10000.0
        ));

        options.add(Map.of(
                "name", "Growth Portfolio",
                "description", "Higher-risk investments targeting capital appreciation",
                "expectedReturn", "8-12% annually",
                "riskLevel", "HIGH",
                "minimumInvestment", 25000.0
        ));

        options.add(Map.of(
                "name", "Custom Portfolio",
                "description", "Personalized investment strategy based on your goals",
                "expectedReturn", "Varies",
                "riskLevel", "CUSTOM",
                "minimumInvestment", 50000.0
        ));

        return options;
    }

    @Override
    public Map<String, Object> calculateProjectedReturns(Double amount, Integer years) {
        if (amount == null || amount <= 0) {
            throw new ValidationException("Investment amount must be positive");
        }
        if (years == null || years <= 0 || years > 30) {
            throw new ValidationException("Investment period must be between 1 and 30 years");
        }

        Map<String, Object> projections = new HashMap<>();
        projections.put("initialInvestment", amount);
        projections.put("investmentPeriod", years);

        // Calculate for different return rates
        double[] rates = {0.04, 0.06, 0.08, 0.10, 0.12};
        String[] scenarios = {"Conservative (4%)", "Moderate (6%)", "Balanced (8%)", "Growth (10%)", "Aggressive (12%)"};

        List<Map<String, Object>> results = new ArrayList<>();
        for (int i = 0; i < rates.length; i++) {
            double futureValue = amount * Math.pow(1 + rates[i], years);
            double totalReturn = futureValue - amount;
            double returnPercentage = (totalReturn / amount) * 100;

            Map<String, Object> scenario = new HashMap<>();
            scenario.put("scenario", scenarios[i]);
            scenario.put("rate", rates[i] * 100);
            scenario.put("futureValue", Math.round(futureValue * 100.0) / 100.0);
            scenario.put("totalReturn", Math.round(totalReturn * 100.0) / 100.0);
            scenario.put("returnPercentage", Math.round(returnPercentage * 100.0) / 100.0);
            results.add(scenario);
        }

        projections.put("projections", results);
        projections.put("disclaimer", "These are projections based on historical market performance. Actual returns may vary.");

        return projections;
    }

    @Override
    public List<Map<String, Object>> getEducationalResources() {
        List<Map<String, Object>> resources = new ArrayList<>();

        resources.add(Map.of(
                "title", "Introduction to Stock Market Investing",
                "description", "Learn the fundamentals of stock market investing",
                "category", "BASICS",
                "url", "/resources/stock-market-basics"
        ));

        resources.add(Map.of(
                "title", "Understanding Risk and Return",
                "description", "How to balance risk and potential returns",
                "category", "RISK_MANAGEMENT",
                "url", "/resources/risk-return"
        ));

        resources.add(Map.of(
                "title", "Diversification Strategies",
                "description", "Building a balanced investment portfolio",
                "category", "PORTFOLIO_MANAGEMENT",
                "url", "/resources/diversification"
        ));

        resources.add(Map.of(
                "title", "Tax-Efficient Investing",
                "description", "Strategies to minimize tax impact on investments",
                "category", "TAX_PLANNING",
                "url", "/resources/tax-efficiency"
        ));

        resources.add(Map.of(
                "title", "Retirement Planning Guide",
                "description", "Plan for a secure financial future",
                "category", "RETIREMENT",
                "url", "/resources/retirement-planning"
        ));

        return resources;
    }

    @Override
    public void submitContactRequest(Map<String, String> request) {
        // Validate request
        String name = request.get("name");
        String email = request.get("email");
        String message = request.get("message");
        String phone = request.get("phone");

        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Name is required");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new ValidationException("Email is required");
        }
        if (message == null || message.trim().isEmpty()) {
            throw new ValidationException("Message is required");
        }

        // Create contact request
        ContactRequest contactRequest = new ContactRequest();
        contactRequest.setName(name);
        contactRequest.setEmail(email);
        contactRequest.setPhone(phone);
        contactRequest.setMessage(message);
        contactRequest.setSource("GUEST_PORTAL");
        contactRequest.setSubmittedAt(LocalDateTime.now());
        contactRequest.setStatus("NEW");

        ContactRequest saved = contactRequestRepository.save(contactRequest);

        // Notify sales team
        notificationService.notifySalesTeamOfContact(saved);
    }

    @Override
    public Map<String, Object> checkUpgradeEligibility(String email) {
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Map<String, Object> eligibility = new HashMap<>();

        // Check if already has a pending request
        boolean hasPendingRequest = upgradeRequestRepository
                .existsByUserAccountAndStatus(userAccount, UpgradeRequestStatus.PENDING);

        if (hasPendingRequest) {
            eligibility.put("eligible", false);
            eligibility.put("reason", "You already have a pending upgrade request");
        } else if (userAccount.getRole() != com.ddfinance.core.domain.enums.Role.GUEST) {
            eligibility.put("eligible", false);
            eligibility.put("reason", "Only guest accounts can request upgrades");
        } else {
            eligibility.put("eligible", true);
            eligibility.put("reason", null);
        }

        return eligibility;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getActivitySummary(String email) {
        Guest guest = findGuestByEmail(email);
        UserAccount userAccount = guest.getUserAccount();

        Map<String, Object> summary = new HashMap<>();

        // Basic info
        summary.put("welcomeMessage", "Welcome, " + userAccount.getFirstName() + "!");
        summary.put("accountType", "Guest Account");
        summary.put("registrationDate", userAccount.getCreatedDate());

        // Days since registration
        long daysSinceRegistration = ChronoUnit.DAYS.between(
                userAccount.getCreatedDate().toLocalDate(),
                LocalDateTime.now().toLocalDate()
        );
        summary.put("daysSinceRegistration", daysSinceRegistration);

        // Upgrade request status
        List<GuestUpgradeRequest> requests = upgradeRequestRepository
                .findByUserAccountOrderByRequestDateDesc(userAccount);

        if (!requests.isEmpty()) {
            GuestUpgradeRequest latestRequest = requests.get(0);
            summary.put("upgradeRequestStatus", latestRequest.getStatus().name());
            summary.put("upgradeRequestDate", latestRequest.getRequestDate());
        } else {
            summary.put("upgradeRequestStatus", "NO_REQUEST");
        }

        // Contact request count
        long contactRequestCount = contactRequestRepository.countByStatus("NEW");
        summary.put("contactRequestsSent", contactRequestCount);

        // Available actions
        summary.put("availableActions", Arrays.asList(
                "View public company information",
                "Browse educational resources",
                "Submit upgrade request",
                "Contact support",
                "View FAQs"
        ));

        // Upgrade benefits
        summary.put("clientBenefits", Arrays.asList(
                "Access to personalized investment portfolios",
                "Real-time market data and analysis",
                "Direct communication with investment advisors",
                "Tax optimization strategies",
                "Quarterly performance reports"
        ));

        // Recent activity
        List<Map<String, Object>> recentActivity = new ArrayList<>();

        // Add registration as an activity
        recentActivity.add(Map.of(
                "type", "REGISTRATION",
                "date", userAccount.getCreatedDate(),
                "description", "Account created"
        ));

        // Add upgrade requests as activities
        for (GuestUpgradeRequest req : requests) {
            recentActivity.add(Map.of(
                    "type", "UPGRADE_REQUEST",
                    "date", req.getRequestDate(),
                    "description", "Upgrade request " + req.getStatus().name().toLowerCase()
            ));
        }

        // Sort by date descending and limit to 5
        recentActivity.sort((a, b) -> ((LocalDateTime) b.get("date")).compareTo((LocalDateTime) a.get("date")));
        summary.put("recentActivity", recentActivity.stream().limit(5).collect(Collectors.toList()));

        // Next steps
        List<String> nextSteps = new ArrayList<>();
        if (requests.isEmpty()) {
            nextSteps.add("Submit an upgrade request to become a client");
        } else if (requests.get(0).getStatus() == UpgradeRequestStatus.PENDING) {
            nextSteps.add("Your upgrade request is being reviewed");
        } else if (requests.get(0).getStatus() == UpgradeRequestStatus.REJECTED) {
            nextSteps.add("Review the feedback on your upgrade request and reapply");
        }
        nextSteps.add("Explore our educational resources");
        nextSteps.add("Learn about our investment strategies");
        summary.put("nextSteps", nextSteps);

        // Quick stats
        Map<String, Object> quickStats = new HashMap<>();
        quickStats.put("profileComplete", isProfileComplete(userAccount));
        quickStats.put("hasPhoneNumber", userAccount.getPhoneNumber() != null);
        quickStats.put("hasSubmittedUpgradeRequest", !requests.isEmpty());
        quickStats.put("accountAge", daysSinceRegistration + " days");
        summary.put("quickStats", quickStats);

        // Upgrade request history
        List<Map<String, String>> requestHistory = requests.stream()
                .map(req -> Map.of(
                        "id", req.getId().toString(),
                        "date", req.getRequestDate().toString(),
                        "status", req.getStatus().name(),
                        "processedDate", req.getProcessedDate() != null ? req.getProcessedDate().toString() : "N/A"
                ))
                .collect(Collectors.toList());

        summary.put("upgradeRequestHistory", requestHistory);
        summary.put("totalUpgradeRequests", requests.size());

        // Last activity
        LocalDateTime lastActivity = userAccount.getLastLoginAt() != null
                ? userAccount.getLastLoginAt()
                : userAccount.getCreatedDate();
        summary.put("lastActivity", lastActivity);

        return summary;
    }

    // Helper methods

    private Guest findGuestByEmail(String email) {
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User account not found"));

        return guestRepository.findByUserAccount(userAccount)
                .orElseThrow(() -> new EntityNotFoundException("Guest profile not found"));
    }

    private UpgradeRequestDTO convertToUpgradeRequestDTO(GuestUpgradeRequest request) {
        UpgradeRequestDTO dto = new UpgradeRequestDTO();
        dto.setRequestId(request.getId());
        dto.setGuestId(request.getUserAccount().getId());
        dto.setRequestDate(request.getRequestDate());
        dto.setStatus(request.getStatus());

        // Extract information from additionalInfo map
        Map<String, String> additionalInfo = request.getAdditionalInfo();
        if (additionalInfo != null) {
            dto.setPhoneNumber(additionalInfo.get("phoneNumber"));
            dto.setAddress(additionalInfo.get("address"));
            dto.setOccupation(additionalInfo.get("occupation"));

            // Parse numeric values
            String annualIncomeStr = additionalInfo.get("annualIncome");
            if (annualIncomeStr != null) {
                try {
                    dto.setAnnualIncome(Double.parseDouble(annualIncomeStr));
                } catch (NumberFormatException e) {
                    dto.setAnnualIncome(0.0);
                }
            }

            dto.setInvestmentGoals(additionalInfo.get("investmentGoals"));
            dto.setRiskTolerance(additionalInfo.get("riskTolerance"));

            String expectedInvestmentStr = additionalInfo.get("expectedInvestmentAmount");
            if (expectedInvestmentStr != null) {
                try {
                    dto.setExpectedInvestmentAmount(Double.parseDouble(expectedInvestmentStr));
                } catch (NumberFormatException e) {
                    dto.setExpectedInvestmentAmount(0.0);
                }
            }

            dto.setSourceOfFunds(additionalInfo.get("sourceOfFunds"));
        }

        dto.setReviewedDate(request.getProcessedDate());
        dto.setReviewedBy(request.getProcessedBy());
        dto.setRejectionReason(request.getRejectionReason());

        return dto;
    }

    private GuestDetailsDTO convertToGuestDetailsDTO(Guest guest) {
        GuestDetailsDTO dto = new GuestDetailsDTO();
        dto.setGuestId(guest.getId());
        dto.setEmail(guest.getUserAccount().getEmail());
        dto.setFirstName(guest.getUserAccount().getFirstName());
        dto.setLastName(guest.getUserAccount().getLastName());
        dto.setPhoneNumber(guest.getUserAccount().getPhoneNumber());
        dto.setRegistrationDate(guest.getUserAccount().getCreatedDate());
        dto.setLastLogin(guest.getUserAccount().getLastLoginAt());

        // Calculate days until expiry (assuming 90 days trial period)
        long daysSinceRegistration = ChronoUnit.DAYS.between(
                guest.getUserAccount().getCreatedDate(),
                LocalDateTime.now()
        );
        dto.setDaysUntilExpiry(Math.max(0, 90 - (int) daysSinceRegistration));

        // Check profile completeness
        dto.setProfileComplete(isProfileComplete(guest.getUserAccount()));

        // Get upgrade request status
        Optional<GuestUpgradeRequest> latestRequest = upgradeRequestRepository
                .findByUserAccountOrderByRequestDateDesc(guest.getUserAccount())
                .stream()
                .findFirst();

        if (latestRequest.isPresent()) {
            dto.setHasUpgradeRequest(true);
            dto.setUpgradeRequestStatus(latestRequest.get().getStatus().name());
            dto.setUpgradeRequestDate(latestRequest.get().getRequestDate());
        } else {
            dto.setHasUpgradeRequest(false);
        }

        return dto;
    }

    private boolean isProfileComplete(UserAccount userAccount) {
        return userAccount.getEmail() != null &&
                userAccount.getFirstName() != null &&
                userAccount.getLastName() != null &&
                userAccount.getPhoneNumber() != null;
    }
}