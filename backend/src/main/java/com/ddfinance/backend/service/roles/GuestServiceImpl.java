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
                            FAQRepository faqRepository,
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
        dto.setId(guest.getId());
        dto.setGuestId(guest.getGuestId());
        dto.setEmail(guest.getUserAccount().getEmail());
        dto.setFirstName(guest.getUserAccount().getFirstName());
        dto.setLastName(guest.getUserAccount().getLastName());
        dto.setPhoneNumber(guest.getUserAccount().getPhoneNumber());
        dto.setAccountCreatedDate(guest.getUserAccount().getCreatedDate());

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
                "Stock Market Investment Management",
                "Financial Planning and Advisory",
                "Tax-Efficient Investment Strategies",
                "Retirement Planning"
        ));

        info.put("investmentOptions", Arrays.asList(
                "Individual Stocks (NYSE, NASDAQ)",
                "Exchange-Traded Funds (ETFs)",
                "Mutual Funds",
                "Fixed Income Securities",
                "Diversified Portfolios"
        ));

        info.put("minimumInvestment", "$10,000");
        info.put("fees", Map.of(
                "managementFee", "1.0% annually",
                "performanceFee", "10% of profits above benchmark",
                "transactionFees", "Included in management fee"
        ));

        info.put("contactInfo", Map.of(
                "email", "info@duediligencefinance.com",
                "phone", "1-800-DDF-INVEST",
                "address", "123 Financial District, New York, NY 10004",
                "hours", "Monday-Friday 9:00 AM - 5:00 PM EST"
        ));

        return info;
    }

    @Override
    public Map<String, Object> requestUpgrade(String email, CreateUpgradeRequestDTO request) {
        Guest guest = findGuestByEmail(email);
        UserAccount userAccount = guest.getUserAccount();

        // Check if there's already a pending request
        if (upgradeRequestRepository.existsByUserAccountAndStatus(userAccount, UpgradeRequestStatus.PENDING)) {
            throw new ValidationException("You already have a pending upgrade request");
        }

        // Validate the request
        validateUpgradeRequest(request);

        // Create new upgrade request
        GuestUpgradeRequest upgradeRequest = new GuestUpgradeRequest();
        upgradeRequest.setUserAccount(userAccount);
        upgradeRequest.setDetails(request.getDetails());
        upgradeRequest.setStatus(UpgradeRequestStatus.PENDING);
        upgradeRequest.setRequestDate(LocalDateTime.now());

        // Store additional KYC information
        Map<String, Object> additionalInfo = new HashMap<>();
        additionalInfo.put("expectedInvestmentAmount", request.getExpectedInvestmentAmount());
        additionalInfo.put("investmentExperience", request.getInvestmentExperience());
        additionalInfo.put("employmentStatus", request.getEmploymentStatus());
        additionalInfo.put("annualIncome", request.getAnnualIncome());
        additionalInfo.put("sourceOfFunds", request.getSourceOfFunds());
        additionalInfo.put("investmentObjectives", request.getInvestmentObjectives());
        upgradeRequest.setAdditionalInfo(additionalInfo);

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

        upgradeRequestRepository.delete(pendingRequest);
    }

    @Override
    public GuestDetailsDTO updateProfile(String email, Map<String, String> profileData) {
        Guest guest = findGuestByEmail(email);
        UserAccount userAccount = guest.getUserAccount();

        // Update allowed fields
        if (profileData.containsKey("phoneNumber")) {
            userAccount.setPhoneNumber(profileData.get("phoneNumber"));
        }
        if (profileData.containsKey("address")) {
            userAccount.setAddress(profileData.get("address"));
        }

        userAccountRepository.save(userAccount);

        return getGuestDetails(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, String>> getFAQ() {
        // TODO: Replace with actual FAQ repository data
        return faqRepository.findAllActiveOrderByDisplayOrder();
    }

    @Override
    public List<Map<String, Object>> getInvestmentOptions() {
        List<Map<String, Object>> options = new ArrayList<>();

        options.add(Map.of(
                "name", "Conservative Portfolio",
                "description", "Low-risk investments focusing on bonds and blue-chip stocks",
                "expectedReturn", "4-6% annually",
                "riskLevel", "Low",
                "minimumInvestment", 10000,
                "suitableFor", Arrays.asList("Risk-averse investors", "Retirees", "Capital preservation")
        ));

        options.add(Map.of(
                "name", "Balanced Portfolio",
                "description", "Mix of stocks and bonds for moderate growth",
                "expectedReturn", "6-8% annually",
                "riskLevel", "Medium",
                "minimumInvestment", 10000,
                "suitableFor", Arrays.asList("Long-term investors", "Diversification seekers")
        ));

        options.add(Map.of(
                "name", "Growth Portfolio",
                "description", "Focus on growth stocks and emerging markets",
                "expectedReturn", "8-12% annually",
                "riskLevel", "High",
                "minimumInvestment", 25000,
                "suitableFor", Arrays.asList("Young investors", "High risk tolerance", "Long investment horizon")
        ));

        options.add(Map.of(
                "name", "Custom Portfolio",
                "description", "Tailored investment strategy based on your specific needs",
                "expectedReturn", "Varies",
                "riskLevel", "Customized",
                "minimumInvestment", 50000,
                "suitableFor", Arrays.asList("Sophisticated investors", "Specific investment goals")
        ));

        return options;
    }

    @Override
    public Map<String, Object> calculateProjectedReturns(Double amount, Integer years) {
        if (amount <= 0) {
            throw new ValidationException("Investment amount must be positive");
        }
        if (years <= 0 || years > 30) {
            throw new ValidationException("Investment period must be between 1 and 30 years");
        }

        Map<String, Object> projections = new HashMap<>();
        projections.put("initialAmount", amount);
        projections.put("years", years);

        // Calculate projections for different return rates
        Map<String, Object> conservativeProjection = calculateProjection(amount, years, 0.05); // 5% annual
        Map<String, Object> moderateProjection = calculateProjection(amount, years, 0.08); // 8% annual
        Map<String, Object> aggressiveProjection = calculateProjection(amount, years, 0.12); // 12% annual

        projections.put("projections", Map.of(
                "conservative", conservativeProjection,
                "moderate", moderateProjection,
                "aggressive", aggressiveProjection
        ));

        projections.put("disclaimer", "These are estimated projections based on historical market performance. Actual returns may vary.");

        return projections;
    }

    @Override
    public List<Map<String, Object>> getEducationalResources() {
        List<Map<String, Object>> resources = new ArrayList<>();

        resources.add(Map.of(
                "category", "Getting Started",
                "title", "Introduction to Stock Market Investing",
                "description", "Learn the basics of stock market investing and how to get started",
                "type", "article",
                "readTime", "10 minutes",
                "url", "/resources/intro-to-investing"
        ));

        resources.add(Map.of(
                "category", "Getting Started",
                "title", "Understanding Risk and Return",
                "description", "Explore the relationship between investment risk and potential returns",
                "type", "video",
                "duration", "15 minutes",
                "url", "/resources/risk-and-return"
        ));

        resources.add(Map.of(
                "category", "Investment Strategies",
                "title", "Diversification: Don't Put All Your Eggs in One Basket",
                "description", "Learn why diversification is crucial for a healthy portfolio",
                "type", "article",
                "readTime", "8 minutes",
                "url", "/resources/diversification"
        ));

        resources.add(Map.of(
                "category", "Tax Planning",
                "title", "Tax-Efficient Investing Strategies",
                "description", "Maximize your after-tax returns with smart investment strategies",
                "type", "guide",
                "pages", 20,
                "url", "/resources/tax-efficient-investing"
        ));

        return resources;
    }

    @Override
    public void submitContactRequest(Map<String, String> contactRequest) {
        // Validate contact request
        validateContactRequest(contactRequest);

        ContactRequest request = new ContactRequest();
        request.setName(contactRequest.get("name"));
        request.setEmail(contactRequest.get("email"));
        request.setPhone(contactRequest.get("phone"));
        request.setMessage(contactRequest.get("message"));
        request.setSubmittedAt(LocalDateTime.now());
        request.setSource("GUEST_PORTAL");

        ContactRequest saved = contactRequestRepository.save(request);

        // Notify sales team
        notificationService.notifySalesTeamOfContact(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> checkUpgradeEligibility(String email) {
        Guest guest = findGuestByEmail(email);
        UserAccount userAccount = guest.getUserAccount();

        Map<String, Object> eligibility = new HashMap<>();

        // Check for pending requests
        boolean hasPendingRequest = upgradeRequestRepository
                .existsByUserAccountAndStatus(userAccount, UpgradeRequestStatus.PENDING);

        if (hasPendingRequest) {
            eligibility.put("eligible", false);
            eligibility.put("reason", "You already have a pending upgrade request");
        } else {
            // Check account age (minimum 24 hours)
            long hoursSinceCreation = ChronoUnit.HOURS.between(userAccount.getCreatedDate(), LocalDateTime.now());
            if (hoursSinceCreation < 24) {
                eligibility.put("eligible", false);
                eligibility.put("reason", "Account must be at least 24 hours old");
                eligibility.put("hoursRemaining", 24 - hoursSinceCreation);
            } else {
                eligibility.put("eligible", true);
                eligibility.put("reason", null);
            }
        }

        // Check for recently rejected requests
        Optional<GuestUpgradeRequest> recentRejection = upgradeRequestRepository
                .findByUserAccountOrderByRequestDateDesc(userAccount)
                .stream()
                .filter(req -> req.getStatus() == UpgradeRequestStatus.REJECTED)
                .findFirst();

        if (recentRejection.isPresent()) {
            long daysSinceRejection = ChronoUnit.DAYS.between(
                    recentRejection.get().getProcessedDate(),
                    LocalDateTime.now()
            );
            if (daysSinceRejection < 30) {
                eligibility.put("eligible", false);
                eligibility.put("reason", "Must wait 30 days after rejection before reapplying");
                eligibility.put("daysRemaining", 30 - daysSinceRejection);
            }
        }

        return eligibility;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getActivitySummary(String email) {
        Guest guest = findGuestByEmail(email);
        UserAccount userAccount = guest.getUserAccount();

        Map<String, Object> summary = new HashMap<>();
        summary.put("accountCreated", userAccount.getCreatedDate());
        summary.put("daysSinceCreation", ChronoUnit.DAYS.between(userAccount.getCreatedDate(), LocalDateTime.now()));

        // Upgrade request history
        List<GuestUpgradeRequest> requests = upgradeRequestRepository
                .findByUserAccountOrderByRequestDateDesc(userAccount);

        List<Map<String, Object>> requestHistory = requests.stream()
                .map(req -> Map.of(
                        "id", req.getId(),
                        "date", req.getRequestDate(),
                        "status", req.getStatus().name(),
                        "processedDate", (Object) (req.getProcessedDate() != null ? req.getProcessedDate() : "N/A")
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
        dto.setId(request.getId());
        dto.setUserAccountId(request.getUserAccount().getId());
        dto.setUserEmail(request.getUserAccount().getEmail());
        dto.setUserFirstName(request.getUserAccount().getFirstName());
        dto.setUserLastName(request.getUserAccount().getLastName());
        dto.setRequestDate(request.getRequestDate());
        dto.setStatus(request.getStatus());
        dto.setDetails(request.getDetails());
        dto.setProcessedDate(request.getProcessedDate());
        dto.setProcessedBy(request.getProcessedBy());
        dto.setRejectionReason(request.getRejectionReason());
        dto.setAdditionalInfo(request.getAdditionalInfo());

        return dto;
    }

    private Map<String, Object> calculateProjection(Double amount, Integer years, Double annualRate) {
        Map<String, Object> projection = new HashMap<>();

        // Calculate compound interest
        Double finalAmount = amount * Math.pow(1 + annualRate, years);
        Double totalGain = finalAmount - amount;
        Double totalReturnPercentage = (totalGain / amount) * 100;

        projection.put("finalAmount", Math.round(finalAmount * 100.0) / 100.0);
        projection.put("totalGain", Math.round(totalGain * 100.0) / 100.0);
        projection.put("totalReturnPercentage", Math.round(totalReturnPercentage * 100.0) / 100.0);
        projection.put("annualReturnRate", annualRate * 100);

        // Year by year breakdown
        List<Map<String, Object>> yearlyBreakdown = new ArrayList<>();
        for (int year = 1; year <= Math.min(years, 10); year++) { // Show max 10 years
            Double yearEndAmount = amount * Math.pow(1 + annualRate, year);
            yearlyBreakdown.add(Map.of(
                    "year", year,
                    "amount", Math.round(yearEndAmount * 100.0) / 100.0,
                    "gain", Math.round((yearEndAmount - amount) * 100.0) / 100.0
            ));
        }
        projection.put("yearlyBreakdown", yearlyBreakdown);

        return projection;
    }

    private void validateUpgradeRequest(CreateUpgradeRequestDTO request) {
        if (request.getDetails() == null || request.getDetails().trim().isEmpty()) {
            throw new ValidationException("Details are required");
        }

        if (request.getExpectedInvestmentAmount() == null || request.getExpectedInvestmentAmount() < 10000) {
            throw new ValidationException("Minimum investment amount is $10,000");
        }

        if (request.getEmploymentStatus() == null || request.getEmploymentStatus().trim().isEmpty()) {
            throw new ValidationException("Employment status is required");
        }

        if (request.getAnnualIncome() == null || request.getAnnualIncome().trim().isEmpty()) {
            throw new ValidationException("Annual income range is required");
        }
    }

    private void validateContactRequest(Map<String, String> request) {
        if (!request.containsKey("name") || request.get("name").trim().isEmpty()) {
            throw new ValidationException("Name is required");
        }

        if (!request.containsKey("email") || request.get("email").trim().isEmpty()) {
            throw new ValidationException("Email is required");
        }

        if (!request.containsKey("message") || request.get("message").trim().isEmpty()) {
            throw new ValidationException("Message is required");
        }
    }
}
