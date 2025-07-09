package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for NotificationTemplate entity operations.
 * Provides methods for managing notification templates.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {

    /**
     * Finds a template by its unique name.
     *
     * @param templateName the template name
     * @return Optional containing the template if found
     */
    Optional<NotificationTemplate> findByTemplateName(String templateName);

    /**
     * Finds all templates by type.
     *
     * @param templateType the template type (EMAIL, SMS, PUSH)
     * @return list of templates
     */
    List<NotificationTemplate> findByTemplateType(String templateType);

    /**
     * Finds all active templates.
     *
     * @return list of active templates
     */
    List<NotificationTemplate> findByIsActiveTrue();

    /**
     * Finds all active templates by type.
     *
     * @param templateType the template type
     * @return list of active templates
     */
    List<NotificationTemplate> findByTemplateTypeAndIsActiveTrue(String templateType);

    /**
     * Finds templates by category.
     *
     * @param category the category (ACCOUNT, INVESTMENT, etc.)
     * @return list of templates
     */
    List<NotificationTemplate> findByCategory(String category);

    /**
     * Finds active templates by category.
     *
     * @param category the category
     * @return list of active templates
     */
    List<NotificationTemplate> findByCategoryAndIsActiveTrue(String category);

    /**
     * Checks if a template exists with the given name.
     *
     * @param templateName the template name
     * @return true if exists
     */
    boolean existsByTemplateName(String templateName);

    /**
     * Searches templates by content or subject.
     *
     * @param searchTerm the search term
     * @return list of matching templates
     */
    @Query("SELECT nt FROM NotificationTemplate nt WHERE " +
            "LOWER(nt.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(nt.subject) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<NotificationTemplate> searchByContentOrSubject(@Param("searchTerm") String searchTerm);

    /**
     * Finds templates that use a specific variable.
     *
     * @param variable the variable name
     * @return list of templates using the variable
     */
    @Query("SELECT nt FROM NotificationTemplate nt WHERE " +
            "nt.content LIKE CONCAT('%{{', :variable, '}}%') OR " +
            "nt.subject LIKE CONCAT('%{{', :variable, '}}%')")
    List<NotificationTemplate> findTemplatesUsingVariable(@Param("variable") String variable);

    /**
     * Finds templates by type and category.
     *
     * @param templateType the template type
     * @param category the category
     * @return list of templates
     */
    List<NotificationTemplate> findByTemplateTypeAndCategory(String templateType, String category);

    /**
     * Counts active templates by type.
     *
     * @param templateType the template type
     * @return count of active templates
     */
    long countByTemplateTypeAndIsActiveTrue(String templateType);

    /**
     * Updates template active status.
     *
     * @param templateId the template ID
     * @param isActive the active status
     * @return number of updated records
     */
    @Query("UPDATE NotificationTemplate nt SET nt.isActive = :isActive, " +
            "nt.updatedAt = CURRENT_TIMESTAMP WHERE nt.id = :templateId")
    int updateTemplateStatus(@Param("templateId") Long templateId,
                             @Param("isActive") boolean isActive);

    /**
     * Finds email templates with missing subjects.
     *
     * @return list of email templates without subjects
     */
    @Query("SELECT nt FROM NotificationTemplate nt WHERE " +
            "nt.templateType = 'EMAIL' AND (nt.subject IS NULL OR nt.subject = '')")
    List<NotificationTemplate> findEmailTemplatesWithoutSubject();

    /**
     * Finds templates created by a specific user.
     *
     * @param createdBy the creator username
     * @return list of templates
     */
    List<NotificationTemplate> findByCreatedBy(String createdBy);

    /**
     * Gets distinct categories.
     *
     * @return list of unique categories
     */
    @Query("SELECT DISTINCT nt.category FROM NotificationTemplate nt " +
            "WHERE nt.category IS NOT NULL ORDER BY nt.category")
    List<String> findDistinctCategories();
}
