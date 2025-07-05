package com.ddfinance.core.config;


import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Configuration class for JPA repositories and entity scanning
 * Ensures proper component scanning for repository interfaces and domain entities
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-01
 */
@Configuration
@EnableJpaRepositories(basePackages = {
        "com.ddfinance.core.repository",
        "com.ddfinance.backend.repository"
})
@EntityScan(basePackages = {
        "com.ddfinance.core.domain"
})
public class RepositoryConfig {

    /**
     * Configuration class for repository scanning
     * No additional beans needed - annotations handle the configuration
     */
}
