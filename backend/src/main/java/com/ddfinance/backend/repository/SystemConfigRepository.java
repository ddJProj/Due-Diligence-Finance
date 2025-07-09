// SystemConfigRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for SystemConfig entity operations.
 * Provides methods for managing system configuration settings.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {

    /**
     * Finds a system configuration by its unique key.
     *
     * @param configKey the configuration key
     * @return Optional containing the config if found
     */
    Optional<SystemConfig> findByConfigKey(String configKey);

    /**
     * Finds all configurations in a specific category.
     *
     * @param category the configuration category
     * @return list of configurations in the category
     */
    List<SystemConfig> findByCategory(String category);

    /**
     * Finds all active configurations.
     *
     * @return list of active configurations
     */
    List<SystemConfig> findByIsActiveTrue();

    /**
     * Finds all active configurations in a specific category.
     *
     * @param category the configuration category
     * @return list of active configurations in the category
     */
    List<SystemConfig> findByCategoryAndIsActiveTrue(String category);

    /**
     * Checks if a configuration key exists.
     *
     * @param configKey the configuration key
     * @return true if the key exists
     */
    boolean existsByConfigKey(String configKey);

    /**
     * Finds all encrypted configurations.
     *
     * @return list of encrypted configurations
     */
    List<SystemConfig> findByIsEncryptedTrue();

    /**
     * Finds configurations by data type.
     *
     * @param dataType the data type (STRING, INTEGER, etc.)
     * @return list of configurations with the specified data type
     */
    List<SystemConfig> findByDataType(String dataType);

    /**
     * Searches for configurations by key pattern.
     *
     * @param keyPattern the pattern to search for in config keys
     * @return list of matching configurations
     */
    @Query("SELECT sc FROM SystemConfig sc WHERE sc.configKey LIKE %:keyPattern%")
    List<SystemConfig> searchByKeyPattern(@Param("keyPattern") String keyPattern);

    /**
     * Finds system critical configurations.
     *
     * @return list of system critical configurations
     */
    @Query("SELECT sc FROM SystemConfig sc WHERE sc.category IN ('SYSTEM', 'SECURITY') " +
            "OR LOWER(sc.configKey) LIKE '%database%' " +
            "OR LOWER(sc.configKey) LIKE '%secret%' " +
            "OR LOWER(sc.configKey) LIKE '%password%' " +
            "OR LOWER(sc.configKey) LIKE '%key%'")
    List<SystemConfig> findSystemCriticalConfigs();

    /**
     * Gets configuration value by key.
     *
     * @param configKey the configuration key
     * @return the configuration value or null if not found
     */
    @Query("SELECT sc.configValue FROM SystemConfig sc WHERE sc.configKey = :configKey AND sc.isActive = true")
    String getConfigValue(@Param("configKey") String configKey);

    /**
     * Updates configuration value by key.
     *
     * @param configKey the configuration key
     * @param configValue the new value
     * @return number of updated records
     */
    @Query("UPDATE SystemConfig sc SET sc.configValue = :configValue, sc.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE sc.configKey = :configKey")
    int updateConfigValue(@Param("configKey") String configKey, @Param("configValue") String configValue);
}
