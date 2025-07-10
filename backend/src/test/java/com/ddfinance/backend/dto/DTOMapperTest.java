package com.ddfinance.backend.dto;

import com.ddfinance.backend.dto.accounts.UserRegistrationRequest;
import com.ddfinance.backend.dto.accounts.UserResponse;
import com.ddfinance.backend.dto.investment.InvestmentResponse;
import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.InvestmentStatus;
import com.ddfinance.core.domain.enums.InvestmentType;
import com.ddfinance.core.domain.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for DTOMapper utility class.
 * Tests entity to DTO conversions and vice versa.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@ExtendWith(MockitoExtension.class)
class DTOMapperTest {

    private DTOMapper dtoMapper;

    @BeforeEach
    void setUp() {
        dtoMapper = new DTOMapper();
    }

    @Nested
    @DisplayName("User Mapping Tests")
    class UserMappingTests {

        @Test
        @DisplayName("Should map UserAccount to UserResponse")
        void shouldMapUserAccountToUserResponse() {
            // Given
            UserAccount userAccount = new UserAccount();
            userAccount.setId(1L);
            userAccount.setEmail("test@example.com");
            userAccount.setFirstName("Test");
            userAccount.setLastName("User");
            userAccount.setRole(Role.CLIENT);
            userAccount.setActive(true);
            userAccount.setCreatedDate(LocalDateTime.now());
            userAccount.setLastLoginAt(LocalDateTime.now());

            // When
            UserResponse response = dtoMapper.toUserResponse(userAccount);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getUsername()).isEqualTo("test@example.com"); // email used as username
            assertThat(response.getEmail()).isEqualTo("test@example.com");
            assertThat(response.getRole()).isEqualTo("CLIENT");
            assertThat(response.isActive()).isTrue();
            assertThat(response.getCreatedAt()).isNotNull();
            assertThat(response.getLastLogin()).isNotNull();
        }

        @Test
        @DisplayName("Should map UserRegistrationRequest to UserAccount")
        void shouldMapUserRegistrationRequestToUserAccount() {
            // Given
            UserRegistrationRequest request = new UserRegistrationRequest();
            request.setUsername("newuser@example.com");
            request.setEmail("new@example.com");
            request.setPassword("password123");
            request.setRole("GUEST");

            // When
            UserAccount userAccount = dtoMapper.toUserAccount(request);

            // Then
            assertThat(userAccount).isNotNull();
            assertThat(userAccount.getEmail()).isEqualTo("new@example.com");
            assertThat(userAccount.getPassword()).isEqualTo("password123");
            assertThat(userAccount.getRole()).isEqualTo(Role.GUEST);
            assertThat(userAccount.isActive()).isTrue();
        }

        @Test
        @DisplayName("Should handle null user mapping")
        void shouldHandleNullUserMapping() {
            // When
            UserResponse response = dtoMapper.toUserResponse(null);
            UserAccount account = dtoMapper.toUserAccount(null);

            // Then
            assertThat(response).isNull();
            assertThat(account).isNull();
        }

        @Test
        @DisplayName("Should map list of UserAccounts to UserResponses")
        void shouldMapUserAccountListToUserResponseList() {
            // Given
            List<UserAccount> users = Arrays.asList(
                    createUserAccount(1L, "user1@example.com"),
                    createUserAccount(2L, "user2@example.com"),
                    createUserAccount(3L, "user3@example.com")
            );

            // When
            List<UserResponse> responses = dtoMapper.toUserResponseList(users);

            // Then
            assertThat(responses).hasSize(3);
            assertThat(responses.get(0).getEmail()).isEqualTo("user1@example.com");
            assertThat(responses.get(1).getEmail()).isEqualTo("user2@example.com");
            assertThat(responses.get(2).getEmail()).isEqualTo("user3@example.com");
        }
    }

    @Nested
    @DisplayName("Investment Mapping Tests")
    class InvestmentMappingTests {

        @Test
        @DisplayName("Should map Investment to InvestmentResponse")
        void shouldMapInvestmentToInvestmentResponse() {
            // Given
            Investment investment = new Investment();
            investment.setId(1L);
            investment.setTickerSymbol("AAPL");
            investment.setName("Apple Inc.");
            investment.setShares(BigDecimal.valueOf(100));
            investment.setPurchasePricePerShare(BigDecimal.valueOf(150.00));
            investment.setCurrentPricePerShare(BigDecimal.valueOf(175.00));
            investment.setInvestmentType("STOCK");
            investment.setStatus(InvestmentStatus.ACTIVE);
            investment.setCreatedDate(LocalDateTime.now());

            Client client = new Client();
            UserAccount clientUser = new UserAccount();
            clientUser.setFirstName("John");
            clientUser.setLastName("Doe");
            client.setUserAccount(clientUser);
            investment.setClient(client);

            // When
            InvestmentResponse response = dtoMapper.toInvestmentResponse(investment);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getStockSymbol()).isEqualTo("AAPL");
            assertThat(response.getStockName()).isEqualTo("Apple Inc.");
            assertThat(response.getQuantity()).isEqualTo(100);
            assertThat(response.getPurchasePrice()).isEqualTo(BigDecimal.valueOf(150.00));
            assertThat(response.getCurrentPrice()).isEqualTo(BigDecimal.valueOf(175.00));
            assertThat(response.getTotalValue()).isEqualTo(BigDecimal.valueOf(17500.00));
            assertThat(response.getProfitLoss()).isEqualTo(BigDecimal.valueOf(2500.00));
            assertThat(response.getProfitLossPercentage()).isEqualTo(BigDecimal.valueOf(16.67));
            assertThat(response.getInvestmentType()).isEqualTo("STOCK");
            assertThat(response.getStatus()).isEqualTo("ACTIVE");
            assertThat(response.getClientName()).isEqualTo("John Doe");
        }

        @Test
        @DisplayName("Should handle null investment mapping")
        void shouldHandleNullInvestmentMapping() {
            // When
            InvestmentResponse response = dtoMapper.toInvestmentResponse(null);

            // Then
            assertThat(response).isNull();
        }

        @Test
        @DisplayName("Should calculate investment metrics correctly")
        void shouldCalculateInvestmentMetricsCorrectly() {
            // Given
            Investment investment = new Investment();
            investment.setShares(BigDecimal.valueOf(50));
            investment.setPurchasePricePerShare(BigDecimal.valueOf(100.00));
            investment.setCurrentPricePerShare(BigDecimal.valueOf(120.00));

            // When
            InvestmentResponse response = dtoMapper.toInvestmentResponse(investment);

            // Then
            assertThat(response.getTotalValue()).isEqualTo(BigDecimal.valueOf(6000.00));
            assertThat(response.getProfitLoss()).isEqualTo(BigDecimal.valueOf(1000.00));
            assertThat(response.getProfitLossPercentage()).isEqualTo(BigDecimal.valueOf(20.00));
        }

        @Test
        @DisplayName("Should handle zero purchase price")
        void shouldHandleZeroPurchasePrice() {
            // Given
            Investment investment = new Investment();
            investment.setShares(BigDecimal.valueOf(10));
            investment.setPurchasePricePerShare(BigDecimal.ZERO);
            investment.setCurrentPricePerShare(BigDecimal.valueOf(50.00));

            // When
            InvestmentResponse response = dtoMapper.toInvestmentResponse(investment);

            // Then
            assertThat(response.getProfitLossPercentage()).isEqualTo(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("Collection Mapping Tests")
    class CollectionMappingTests {

        @Test
        @DisplayName("Should map empty collection")
        void shouldMapEmptyCollection() {
            // Given
            List<UserAccount> emptyList = Collections.emptyList();

            // When
            List<UserResponse> responses = dtoMapper.toUserResponseList(emptyList);

            // Then
            assertThat(responses).isEmpty();
        }

        @Test
        @DisplayName("Should handle null collection")
        void shouldHandleNullCollection() {
            // When
            List<UserResponse> responses = dtoMapper.toUserResponseList(null);

            // Then
            assertThat(responses).isEmpty();
        }

        @Test
        @DisplayName("Should skip null elements in collection")
        void shouldSkipNullElementsInCollection() {
            // Given
            List<UserAccount> users = Arrays.asList(
                    createUserAccount(1L, "user1@example.com"),
                    null,
                    createUserAccount(3L, "user3@example.com")
            );

            // When
            List<UserResponse> responses = dtoMapper.toUserResponseList(users);

            // Then
            assertThat(responses).hasSize(2);
            assertThat(responses.get(0).getEmail()).isEqualTo("user1@example.com");
            assertThat(responses.get(1).getEmail()).isEqualTo("user3@example.com");
        }
    }

    @Nested
    @DisplayName("Update Mapping Tests")
    class UpdateMappingTests {

        @Test
        @DisplayName("Should update existing UserAccount from DTO")
        void shouldUpdateExistingUserAccountFromDTO() {
            // Given
            UserAccount existing = new UserAccount();
            existing.setId(1L);
            existing.setEmail("old@example.com");
            existing.setFirstName("OldFirst");
            existing.setLastName("OldLast");
            existing.setRole(Role.GUEST);

            DTOMapper.UserUpdateRequest updateRequest = new DTOMapper.UserUpdateRequest();
            updateRequest.setEmail("new@example.com");
            updateRequest.setActive(false);

            // When
            dtoMapper.updateUserAccount(existing, updateRequest);

            // Then
            assertThat(existing.getId()).isEqualTo(1L); // Should not change
            assertThat(existing.getEmail()).isEqualTo("new@example.com"); // Should update
            assertThat(existing.isActive()).isFalse(); // Should update
            assertThat(existing.getRole()).isEqualTo(Role.GUEST); // Should not change
        }

        @Test
        @DisplayName("Should ignore null values in update")
        void shouldIgnoreNullValuesInUpdate() {
            // Given
            UserAccount existing = new UserAccount();
            existing.setEmail("existing@example.com");
            existing.setActive(true);

            DTOMapper.UserUpdateRequest updateRequest = new DTOMapper.UserUpdateRequest();
            updateRequest.setEmail(null);
            updateRequest.setActive(false);

            // When
            dtoMapper.updateUserAccount(existing, updateRequest);

            // Then
            assertThat(existing.getEmail()).isEqualTo("existing@example.com"); // Should not change
            assertThat(existing.isActive()).isFalse(); // Should update
        }
    }

    @Nested
    @DisplayName("Custom Mapping Tests")
    class CustomMappingTests {

        @Test
        @DisplayName("Should apply custom field transformations")
        void shouldApplyCustomFieldTransformations() {
            // Given
            UserAccount userAccount = new UserAccount();
            userAccount.setEmail("TEST@EXAMPLE.COM");
            userAccount.setFirstName("Test");
            userAccount.setLastName("User");

            // When
            UserResponse response = dtoMapper.toUserResponse(userAccount);

            // Then
            // Assuming the mapper normalizes email to lowercase
            assertThat(response.getEmail()).isEqualTo("test@example.com");
        }

        @Test
        @DisplayName("Should format dates consistently")
        void shouldFormatDatesConsistently() {
            // Given
            LocalDateTime testDate = LocalDateTime.of(2025, 1, 15, 10, 30, 0);
            UserAccount userAccount = new UserAccount();
            userAccount.setCreatedDate(testDate);

            // When
            UserResponse response = dtoMapper.toUserResponse(userAccount);

            // Then
            assertThat(response.getCreatedAt()).isEqualTo(testDate);
        }
    }

    // Helper methods
    private UserAccount createUserAccount(Long id, String email) {
        UserAccount user = new UserAccount();
        user.setId(id);
        user.setEmail(email);
        user.setFirstName("First");
        user.setLastName("Last");
        user.setRole(Role.CLIENT);
        user.setActive(true);
        user.setCreatedDate(LocalDateTime.now());
        return user;
    }
}