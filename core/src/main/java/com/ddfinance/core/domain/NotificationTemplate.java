package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Entity representing notification templates for emails, SMS, and push notifications.
 * Supports variable substitution and template management.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "notification_templates",
        indexes = {
                @Index(name = "idx_template_name", columnList = "template_name", unique = true),
                @Index(name = "idx_template_type", columnList = "template_type"),
                @Index(name = "idx_template_category", columnList = "category"),
                @Index(name = "idx_template_active", columnList = "is_active")
        })
@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class NotificationTemplate {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{([^}]+)\\}\\}");
    private static final Set<String> VALID_TYPES = Set.of("EMAIL", "SMS", "PUSH");
    private static final Set<String> VALID_CATEGORIES = Set.of(
            "ACCOUNT", "INVESTMENT", "SECURITY", "SYSTEM", "MARKETING", "COMPLIANCE"
    );

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_name", nullable = false, unique = true, length = 100)
    private String templateName;

    @Column(name = "template_type", nullable = false, length = 20)
    private String templateType; // EMAIL, SMS, PUSH

    @Column(length = 500)
    private String subject; // For email templates

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String description;

    @Column(length = 50)
    private String category; // ACCOUNT, INVESTMENT, SECURITY, etc.

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(length = 1000)
    private String variables; // Comma-separated list of expected variables

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    // Constructors
    public NotificationTemplate(String templateName, String templateType,
                                String subject, String content) {
        this.templateName = templateName;
        this.templateType = templateType;
        this.subject = subject;
        this.content = content;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public NotificationTemplate(Long id, String templateName, String templateType,
                                String subject, String content, String description,
                                String category, boolean isActive, String variables,
                                LocalDateTime createdAt, LocalDateTime updatedAt,
                                String createdBy) {
        this.id = id;
        this.templateName = templateName;
        this.templateType = templateType;
        this.subject = subject;
        this.content = content;
        this.description = description;
        this.category = category;
        this.isActive = isActive;
        this.variables = variables;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Extracts variable names from the template content.
     *
     * @return array of variable names found in content
     */
    public String[] extractVariables() {
        if (content == null) {
            return new String[0];
        }

        List<String> vars = new ArrayList<>();
        Matcher matcher = VARIABLE_PATTERN.matcher(content);

        while (matcher.find()) {
            String variable = matcher.group(1).trim();
            if (!vars.contains(variable)) {
                vars.add(variable);
            }
        }

        return vars.toArray(new String[0]);
    }

    /**
     * Extracts variable names from the subject.
     *
     * @return array of variable names found in subject
     */
    public String[] extractSubjectVariables() {
        if (subject == null) {
            return new String[0];
        }

        List<String> vars = new ArrayList<>();
        Matcher matcher = VARIABLE_PATTERN.matcher(subject);

        while (matcher.find()) {
            String variable = matcher.group(1).trim();
            if (!vars.contains(variable)) {
                vars.add(variable);
            }
        }

        return vars.toArray(new String[0]);
    }

    /**
     * Processes the template content by replacing variables with values.
     *
     * @param variables map of variable names to values
     * @return processed content with variables replaced
     */
    public String processTemplate(Map<String, String> variables) {
        if (content == null || variables == null) {
            return content;
        }

        String processed = content;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            processed = processed.replace(placeholder, entry.getValue());
        }

        return processed;
    }

    /**
     * Processes the subject by replacing variables with values.
     *
     * @param variables map of variable names to values
     * @return processed subject with variables replaced
     */
    public String processSubject(Map<String, String> variables) {
        if (subject == null || variables == null) {
            return subject;
        }

        String processed = subject;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            processed = processed.replace(placeholder, entry.getValue());
        }

        return processed;
    }

    /**
     * Checks if all required variables are provided.
     *
     * @param providedVariables map of provided variables
     * @return true if all required variables are present
     */
    public boolean hasAllRequiredVariables(Map<String, String> providedVariables) {
        if (variables == null || variables.isEmpty()) {
            return true;
        }

        String[] required = variables.split(",");
        for (String var : required) {
            if (!providedVariables.containsKey(var.trim())) {
                return false;
            }
        }

        return true;
    }

    /**
     * Gets list of missing variables.
     *
     * @param providedVariables map of provided variables
     * @return array of missing variable names
     */
    public String[] getMissingVariables(Map<String, String> providedVariables) {
        if (variables == null || variables.isEmpty()) {
            return new String[0];
        }

        List<String> missing = new ArrayList<>();
        String[] required = variables.split(",");

        for (String var : required) {
            String trimmed = var.trim();
            if (!providedVariables.containsKey(trimmed)) {
                missing.add(trimmed);
            }
        }

        return missing.toArray(new String[0]);
    }

    /**
     * Checks if this is an email template.
     *
     * @return true if template type is EMAIL
     */
    public boolean isEmailTemplate() {
        return "EMAIL".equalsIgnoreCase(templateType);
    }

    /**
     * Checks if this is an SMS template.
     *
     * @return true if template type is SMS
     */
    public boolean isSmsTemplate() {
        return "SMS".equalsIgnoreCase(templateType);
    }

    /**
     * Checks if this is a push notification template.
     *
     * @return true if template type is PUSH
     */
    public boolean isPushTemplate() {
        return "PUSH".equalsIgnoreCase(templateType);
    }

    /**
     * Validates if email template has required fields.
     *
     * @return true if valid email template
     */
    public boolean isValidEmailTemplate() {
        if (!isEmailTemplate()) {
            return true;
        }
        return subject != null && !subject.trim().isEmpty();
    }

    /**
     * Checks if this is an investment-related template.
     *
     * @return true if category is INVESTMENT
     */
    public boolean isInvestmentTemplate() {
        return "INVESTMENT".equalsIgnoreCase(category);
    }

    /**
     * Checks if this is an account-related template.
     *
     * @return true if category is ACCOUNT
     */
    public boolean isAccountTemplate() {
        return "ACCOUNT".equalsIgnoreCase(category);
    }

    /**
     * Checks if this is a security-related template.
     *
     * @return true if category is SECURITY
     */
    public boolean isSecurityTemplate() {
        return "SECURITY".equalsIgnoreCase(category);
    }

    /**
     * Creates a copy of this template with a new name.
     *
     * @param newName the name for the cloned template
     * @return cloned template
     */
    public NotificationTemplate cloneTemplate(String newName) {
        NotificationTemplate cloned = new NotificationTemplate();
        cloned.setTemplateName(newName);
        cloned.setTemplateType(this.templateType);
        cloned.setSubject(this.subject);
        cloned.setContent(this.content);
        cloned.setDescription(this.description);
        cloned.setCategory(this.category);
        cloned.setVariables(this.variables);
        cloned.setActive(true);
        cloned.setCreatedAt(LocalDateTime.now());
        cloned.setUpdatedAt(LocalDateTime.now());
        return cloned;
    }

    /**
     * Validates if the template has all required fields.
     *
     * @return true if valid
     */
    public boolean isValid() {
        if (templateName == null || templateName.trim().isEmpty()) {
            return false;
        }

        if (templateType == null || templateType.trim().isEmpty()) {
            return false;
        }

        if (content == null || content.trim().isEmpty()) {
            return false;
        }

        return isValidTemplateType() && isValidEmailTemplate();
    }

    /**
     * Validates if the template type is valid.
     *
     * @return true if valid type
     */
    public boolean isValidTemplateType() {
        return templateType != null && VALID_TYPES.contains(templateType.toUpperCase());
    }

    @Override
    public String toString() {
        return String.format("NotificationTemplate{id=%d, name='%s', type='%s', category='%s', active=%s}",
                id, templateName, templateType, category, isActive);
    }
}
