package com.ddfinance.backend.dto;

import com.ddfinance.backend.dto.accounts.UserRegistrationRequest;
import com.ddfinance.backend.dto.accounts.UserResponse;
import com.ddfinance.backend.dto.investment.InvestmentResponse;
import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.Investment;
import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Utility class for mapping between entities and DTOs.
 * Provides centralized conversion logic for the application.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Component
@Slf4j
public class DTOMapper {

    @Value("${app.mapper.normalize-emails:true}")
    private boolean normalizeEmails;

    @Value("${app.mapper.decimal-scale:2}")
    private int decimalScale;

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    /**
     * Maps UserAccount entity to UserResponse DTO.
     *
     * @param userAccount the user account entity
     * @return UserResponse DTO
     */
    public UserResponse toUserResponse(UserAccount userAccount) {
        if (userAccount == null) {
            log.debug("Attempted to map null UserAccount to UserResponse");
            return null;
        }

        return UserResponse.builder()
                .id(userAccount.getId())
                .username(userAccount.getEmail()) // Using email as username
                .email(processEmail(userAccount.getEmail()))
                .role(userAccount.getRole() != null ? userAccount.getRole().name() : null)
                .active(userAccount.isActive())
                .createdAt(userAccount.getCreatedDate())
                .lastLogin(userAccount.getLastLoginAt())
                .build();
    }

    /**
     * Maps UserRegistrationRequest DTO to UserAccount entity.
     *
     * @param request the registration request
     * @return UserAccount entity
     */
    public UserAccount toUserAccount(UserRegistrationRequest request) {
        if (request == null) {
            log.debug("Attempted to map null UserRegistrationRequest to UserAccount");
            return null;
        }

        UserAccount userAccount = new UserAccount();
        userAccount.setEmail(processEmail(request.getEmail()));
        userAccount.setPassword(request.getPassword()); // Note: Password should be encoded before saving
        userAccount.setFirstName(""); // Will need to be set from registration form
        userAccount.setLastName("");  // Will need to be set from registration form
        userAccount.setRole(Role.valueOf(request.getRole()));
        userAccount.setActive(true);

        log.debug("Mapped UserRegistrationRequest to UserAccount for email: {}", request.getEmail());
        return userAccount;
    }

    /**
     * Maps a list of UserAccount entities to UserResponse DTOs.
     *
     * @param userAccounts list of user accounts
     * @return list of UserResponse DTOs
     */
    public List<UserResponse> toUserResponseList(List<UserAccount> userAccounts) {
        if (userAccounts == null) {
            return Collections.emptyList();
        }

        return userAccounts.stream()
                .filter(Objects::nonNull)
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Maps Investment entity to InvestmentResponse DTO.
     *
     * @param investment the investment entity
     * @return InvestmentResponse DTO
     */
    public InvestmentResponse toInvestmentResponse(Investment investment) {
        if (investment == null) {
            log.debug("Attempted to map null Investment to InvestmentResponse");
            return null;
        }

        // Calculate metrics
        InvestmentMetrics metrics = calculateInvestmentMetrics(investment);

        return InvestmentResponse.builder()
                .id(investment.getId())
                .stockSymbol(investment.getTickerSymbol())
                .stockName(investment.getName())
                .quantity(investment.getShares() != null ? investment.getShares().intValue() : 0)
                .purchasePrice(formatDecimal(investment.getPurchasePricePerShare()))
                .currentPrice(formatDecimal(investment.getCurrentPricePerShare()))
                .totalValue(formatDecimal(metrics.totalValue))
                .profitLoss(formatDecimal(metrics.profitLoss))
                .profitLossPercentage(formatDecimal(metrics.profitLossPercentage))
                .investmentType(investment.getInvestmentType())
                .status(investment.getStatus() != null ?
                        investment.getStatus().name() : null)
                .clientName(getClientFullName(investment.getClient()))
                .purchaseDate(investment.getCreatedDate())
                .lastUpdated(investment.getLastModifiedAt())
                .build();
    }

    /**
     * Maps a list of Investment entities to InvestmentResponse DTOs.
     *
     * @param investments list of investments
     * @return list of InvestmentResponse DTOs
     */
    public List<InvestmentResponse> toInvestmentResponseList(List<Investment> investments) {
        if (investments == null) {
            return Collections.emptyList();
        }

        return investments.stream()
                .filter(Objects::nonNull)
                .map(this::toInvestmentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Updates an existing UserAccount entity from a UserUpdateRequest DTO.
     *
     * @param userAccount existing user account
     * @param updateRequest update request DTO
     */
    public void updateUserAccount(UserAccount userAccount, UserUpdateRequest updateRequest) {
        if (userAccount == null || updateRequest == null) {
            log.debug("Cannot update UserAccount: null input");
            return;
        }

        boolean updated = false;

        if (updateRequest.getEmail() != null) {
            userAccount.setEmail(processEmail(updateRequest.getEmail()));
            updated = true;
        }

        if (updateRequest.getActive() != null) {
            userAccount.setActive(updateRequest.getActive());
            updated = true;
        }

        if (updated) {
            log.debug("Updated UserAccount with id: {}", userAccount.getId());
        }
    }

    // Private helper methods

    private String processEmail(String email) {
        if (email == null) {
            return null;
        }

        String processed = email.trim();
        return normalizeEmails ? processed.toLowerCase() : processed;
    }

    private BigDecimal formatDecimal(BigDecimal value) {
        if (value == null) {
            return null;
        }
        return value.setScale(decimalScale, RoundingMode.HALF_UP);
    }

    private InvestmentMetrics calculateInvestmentMetrics(Investment investment) {
        InvestmentMetrics metrics = new InvestmentMetrics();

        if (investment.getShares() == null || investment.getShares().compareTo(BigDecimal.ZERO) <= 0) {
            log.debug("Invalid shares for investment id: {}", investment.getId());
            return metrics;
        }

        BigDecimal shares = investment.getShares();

        // Calculate total value
        if (investment.getCurrentPricePerShare() != null) {
            metrics.totalValue = investment.getCurrentPricePerShare().multiply(shares);
        }

        // Calculate profit/loss
        if (investment.getCurrentPricePerShare() != null && investment.getPurchasePricePerShare() != null) {
            BigDecimal currentValue = investment.getCurrentPricePerShare().multiply(shares);
            BigDecimal purchaseValue = investment.getPurchasePricePerShare().multiply(shares);
            metrics.profitLoss = currentValue.subtract(purchaseValue);

            // Calculate percentage
            if (investment.getPurchasePricePerShare().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal priceDifference = investment.getCurrentPricePerShare()
                        .subtract(investment.getPurchasePricePerShare());
                metrics.profitLossPercentage = priceDifference
                        .divide(investment.getPurchasePricePerShare(), 4, RoundingMode.HALF_UP)
                        .multiply(ONE_HUNDRED);
            }
        }

        return metrics;
    }

    private String getClientFullName(Client client) {
        if (client == null || client.getUserAccount() == null) {
            return null;
        }

        UserAccount userAccount = client.getUserAccount();
        StringBuilder nameBuilder = new StringBuilder();

        if (userAccount.getFirstName() != null) {
            nameBuilder.append(userAccount.getFirstName());
        }

        if (userAccount.getLastName() != null) {
            if (nameBuilder.length() > 0) {
                nameBuilder.append(" ");
            }
            nameBuilder.append(userAccount.getLastName());
        }

        return nameBuilder.length() > 0 ? nameBuilder.toString() : null;
    }

    /**
     * Inner class to hold investment calculation results.
     */
    private static class InvestmentMetrics {
        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal profitLoss = BigDecimal.ZERO;
        BigDecimal profitLossPercentage = BigDecimal.ZERO;
    }

    /**
     * Inner class for user update requests.
     * Used for partial updates of user accounts.
     */
    public static class UserUpdateRequest {
        private String email;
        private Boolean active;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }
}