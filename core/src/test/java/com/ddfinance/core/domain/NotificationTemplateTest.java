package com.ddfinance.core.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for NotificationTemplate entity.
 * Tests template management, variable substitution, and validation.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
class NotificationTemplateTest {

    private NotificationTemplate template;

    @BeforeEach
    void setUp() {
        template = new NotificationTemplate();
    }

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("Should create NotificationTemplate with default constructor")
        void shouldCreateWithDefaultConstructor() {
            // When
            NotificationTemplate nt = new NotificationTemplate();

            // Then
            assertThat(nt).isNotNull();
            assertThat(nt.getId()).isNull();
            assertThat(nt.getTemplateName()).isNull();
            assertThat(nt.isActive()).isTrue();
        }

        @Test
        @DisplayName("Should create NotificationTemplate with basic constructor")
        void shouldCreateWithBasicConstructor() {
            // Given
            String name = "WELCOME_EMAIL";
            String type = "EMAIL";
            String subject = "Welcome to Due Diligence Finance";
            String content = "Dear {{clientName}}, Welcome to our platform!";

            // When
            NotificationTemplate nt = new NotificationTemplate(name, type, subject, content);

            // Then
            assertThat(nt.getTemplateName()).isEqualTo(name);
            assertThat(nt.getTemplateType()).isEqualTo(type);
            assertThat(nt.getSubject()).isEqualTo(subject);
            assertThat(nt.getContent()).isEqualTo(content);
            assertThat(nt.isActive()).isTrue();
        }

        @Test
        @DisplayName("Should create NotificationTemplate with all-args constructor")
        void shouldCreateWithAllArgsConstructor() {
            // Given
            Long id = 1L;
            String name = "INVESTMENT_CONFIRMATION";
            String type = "EMAIL";
            String subject = "Investment Confirmation - {{tickerSymbol}}";
            String content = "Your investment of {{amount}} in {{tickerSymbol}} is confirmed.";
            String description = "Sent when investment is confirmed";
            String category = "INVESTMENT";
            boolean isActive = true;
            String variables = "clientName,tickerSymbol,amount,date";
            LocalDateTime createdAt = LocalDateTime.now();
            LocalDateTime updatedAt = LocalDateTime.now();
            String createdBy = "admin";

            // When
            NotificationTemplate nt = new NotificationTemplate(id, name, type, subject,
                    content, description, category, isActive, variables, createdAt, updatedAt, createdBy);

            // Then
            assertThat(nt.getId()).isEqualTo(id);
            assertThat(nt.getTemplateName()).isEqualTo(name);
            assertThat(nt.getTemplateType()).isEqualTo(type);
            assertThat(nt.getSubject()).isEqualTo(subject);
            assertThat(nt.getContent()).isEqualTo(content);
            assertThat(nt.getDescription()).isEqualTo(description);
            assertThat(nt.getCategory()).isEqualTo(category);
            assertThat(nt.isActive()).isEqualTo(isActive);
            assertThat(nt.getVariables()).isEqualTo(variables);
            assertThat(nt.getCreatedAt()).isEqualTo(createdAt);
            assertThat(nt.getUpdatedAt()).isEqualTo(updatedAt);
            assertThat(nt.getCreatedBy()).isEqualTo(createdBy);
        }
    }

    @Nested
    @DisplayName("Property Tests")
    class PropertyTests {

        @Test
        @DisplayName("Should set and get template name")
        void shouldSetAndGetTemplateName() {
            // Given
            String name = "PASSWORD_RESET";

            // When
            template.setTemplateName(name);

            // Then
            assertThat(template.getTemplateName()).isEqualTo(name);
        }

        @Test
        @DisplayName("Should set and get template type")
        void shouldSetAndGetTemplateType() {
            // Given
            String type = "SMS";

            // When
            template.setTemplateType(type);

            // Then
            assertThat(template.getTemplateType()).isEqualTo(type);
        }

        @Test
        @DisplayName("Should set and get subject")
        void shouldSetAndGetSubject() {
            // Given
            String subject = "Your Monthly Statement - {{month}} {{year}}";

            // When
            template.setSubject(subject);

            // Then
            assertThat(template.getSubject()).isEqualTo(subject);
        }

        @Test
        @DisplayName("Should set and get content")
        void shouldSetAndGetContent() {
            // Given
            String content = "Hello {{clientName}},\n\nYour portfolio value is {{portfolioValue}}.";

            // When
            template.setContent(content);

            // Then
            assertThat(template.getContent()).isEqualTo(content);
        }

        @Test
        @DisplayName("Should set and get category")
        void shouldSetAndGetCategory() {
            // Given
            String category = "ACCOUNT";

            // When
            template.setCategory(category);

            // Then
            assertThat(template.getCategory()).isEqualTo(category);
        }

        @Test
        @DisplayName("Should set and get variables")
        void shouldSetAndGetVariables() {
            // Given
            String variables = "clientName,email,phone,accountNumber";

            // When
            template.setVariables(variables);

            // Then
            assertThat(template.getVariables()).isEqualTo(variables);
        }
    }

    @Nested
    @DisplayName("Template Processing Tests")
    class TemplateProcessingTests {

        @Test
        @DisplayName("Should extract variables from content")
        void shouldExtractVariablesFromContent() {
            // Given
            template.setContent("Hello {{firstName}} {{lastName}}, your balance is {{balance}}.");

            // When
            String[] variables = template.extractVariables();

            // Then
            assertThat(variables).containsExactly("firstName", "lastName", "balance");
        }

        @Test
        @DisplayName("Should extract variables from subject")
        void shouldExtractVariablesFromSubject() {
            // Given
            template.setSubject("Statement for {{month}} {{year}}");

            // When
            String[] subjectVars = template.extractSubjectVariables();

            // Then
            assertThat(subjectVars).containsExactly("month", "year");
        }

        @Test
        @DisplayName("Should process template with variables")
        void shouldProcessTemplateWithVariables() {
            // Given
            template.setContent("Dear {{clientName}}, your investment of {{amount}} in {{ticker}} is confirmed.");
            Map<String, String> variables = new HashMap<>();
            variables.put("clientName", "John Doe");
            variables.put("amount", "$10,000");
            variables.put("ticker", "AAPL");

            // When
            String processed = template.processTemplate(variables);

            // Then
            assertThat(processed).isEqualTo("Dear John Doe, your investment of $10,000 in AAPL is confirmed.");
        }

        @Test
        @DisplayName("Should process subject with variables")
        void shouldProcessSubjectWithVariables() {
            // Given
            template.setSubject("Investment Alert: {{ticker}} - {{action}}");
            Map<String, String> variables = new HashMap<>();
            variables.put("ticker", "MSFT");
            variables.put("action", "BUY");

            // When
            String processed = template.processSubject(variables);

            // Then
            assertThat(processed).isEqualTo("Investment Alert: MSFT - BUY");
        }

        @Test
        @DisplayName("Should handle missing variables")
        void shouldHandleMissingVariables() {
            // Given
            template.setContent("Hello {{name}}, your code is {{code}}.");
            Map<String, String> variables = new HashMap<>();
            variables.put("name", "Jane");
            // code is missing

            // When
            String processed = template.processTemplate(variables);

            // Then
            assertThat(processed).isEqualTo("Hello Jane, your code is {{code}}.");
        }

        @Test
        @DisplayName("Should validate required variables")
        void shouldValidateRequiredVariables() {
            // Given
            template.setContent("{{clientName}} - {{amount}} - {{date}}");
            template.setVariables("clientName,amount,date");
            Map<String, String> providedVars = new HashMap<>();
            providedVars.put("clientName", "John");
            providedVars.put("amount", "1000");
            // date is missing

            // When
            boolean hasAllVars = template.hasAllRequiredVariables(providedVars);

            // Then
            assertThat(hasAllVars).isFalse();
        }

        @Test
        @DisplayName("Should identify missing variables")
        void shouldIdentifyMissingVariables() {
            // Given
            template.setVariables("name,email,phone");
            Map<String, String> providedVars = new HashMap<>();
            providedVars.put("name", "John");

            // When
            String[] missing = template.getMissingVariables(providedVars);

            // Then
            assertThat(missing).containsExactly("email", "phone");
        }
    }

    @Nested
    @DisplayName("Business Logic Tests")
    class BusinessLogicTests {

        @Test
        @DisplayName("Should check if template is email type")
        void shouldCheckIfTemplateIsEmailType() {
            // Given
            template.setTemplateType("EMAIL");

            // Then
            assertThat(template.isEmailTemplate()).isTrue();
            assertThat(template.isSmsTemplate()).isFalse();
        }

        @Test
        @DisplayName("Should check if template is SMS type")
        void shouldCheckIfTemplateIsSmsType() {
            // Given
            template.setTemplateType("SMS");

            // Then
            assertThat(template.isEmailTemplate()).isFalse();
            assertThat(template.isSmsTemplate()).isTrue();
        }

        @Test
        @DisplayName("Should check if template is push notification type")
        void shouldCheckIfTemplateIsPushType() {
            // Given
            template.setTemplateType("PUSH");

            // Then
            assertThat(template.isPushTemplate()).isTrue();
        }

        @Test
        @DisplayName("Should validate email template has subject")
        void shouldValidateEmailTemplateHasSubject() {
            // Given
            template.setTemplateType("EMAIL");
            template.setContent("Email content");
            // No subject set

            // When
            boolean isValid = template.isValidEmailTemplate();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should check template category")
        void shouldCheckTemplateCategory() {
            // Given
            template.setCategory("INVESTMENT");

            // Then
            assertThat(template.isInvestmentTemplate()).isTrue();
            assertThat(template.isAccountTemplate()).isFalse();
            assertThat(template.isSecurityTemplate()).isFalse();
        }

        @Test
        @DisplayName("Should clone template")
        void shouldCloneTemplate() {
            // Given
            template.setTemplateName("ORIGINAL");
            template.setSubject("Original Subject");
            template.setContent("Original Content");
            template.setCategory("ACCOUNT");

            // When
            NotificationTemplate cloned = template.cloneTemplate("CLONED");

            // Then
            assertThat(cloned.getTemplateName()).isEqualTo("CLONED");
            assertThat(cloned.getSubject()).isEqualTo(template.getSubject());
            assertThat(cloned.getContent()).isEqualTo(template.getContent());
            assertThat(cloned.getCategory()).isEqualTo(template.getCategory());
            assertThat(cloned.getId()).isNull();
        }
    }

    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {

        @Test
        @DisplayName("Should validate template with all required fields")
        void shouldValidateTemplateWithAllRequiredFields() {
            // Given
            template.setTemplateName("VALID_TEMPLATE");
            template.setTemplateType("EMAIL");
            template.setContent("Template content");

            // When
            boolean isValid = template.isValid();

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should fail validation without template name")
        void shouldFailValidationWithoutTemplateName() {
            // Given
            template.setTemplateType("EMAIL");
            template.setContent("Content");

            // When
            boolean isValid = template.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation without template type")
        void shouldFailValidationWithoutTemplateType() {
            // Given
            template.setTemplateName("NAME");
            template.setContent("Content");

            // When
            boolean isValid = template.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation without content")
        void shouldFailValidationWithoutContent() {
            // Given
            template.setTemplateName("NAME");
            template.setTemplateType("EMAIL");

            // When
            boolean isValid = template.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should validate template type")
        void shouldValidateTemplateType() {
            // Given
            template.setTemplateType("INVALID_TYPE");

            // When
            boolean isValid = template.isValidTemplateType();

            // Then
            assertThat(isValid).isFalse();
        }
    }

    @Nested
    @DisplayName("Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("Should be equal to self")
        void shouldBeEqualToSelf() {
            // Given
            template.setId(1L);

            // Then
            assertThat(template).isEqualTo(template);
        }

        @Test
        @DisplayName("Should be equal to another template with same id")
        void shouldBeEqualToAnotherTemplateWithSameId() {
            // Given
            template.setId(1L);
            NotificationTemplate other = new NotificationTemplate();
            other.setId(1L);

            // Then
            assertThat(template).isEqualTo(other);
            assertThat(template.hashCode()).isEqualTo(other.hashCode());
        }

        @Test
        @DisplayName("Should not be equal to template with different id")
        void shouldNotBeEqualToTemplateWithDifferentId() {
            // Given
            template.setId(1L);
            NotificationTemplate other = new NotificationTemplate();
            other.setId(2L);

            // Then
            assertThat(template).isNotEqualTo(other);
        }
    }

    @Nested
    @DisplayName("toString Tests")
    class ToStringTests {

        @Test
        @DisplayName("Should generate meaningful toString")
        void shouldGenerateMeaningfulToString() {
            // Given
            template.setId(1L);
            template.setTemplateName("WELCOME_EMAIL");
            template.setTemplateType("EMAIL");
            template.setCategory("ACCOUNT");
            template.setActive(true);

            // When
            String result = template.toString();

            // Then
            assertThat(result).contains("NotificationTemplate");
            assertThat(result).contains("id=1");
            assertThat(result).contains("name=WELCOME_EMAIL");
            assertThat(result).contains("type=EMAIL");
            assertThat(result).contains("category=ACCOUNT");
            assertThat(result).contains("active=true");
        }
    }
}
