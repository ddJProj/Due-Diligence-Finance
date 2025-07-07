package com.ddfinance.backend.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Main application configuration for component scanning and JPA setup.
 * Ensures all components across modules are properly scanned and registered.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Configuration
@ComponentScan(basePackages = {
        "com.ddfinance.core",  // Add this to scan ALL of core module
        "com.ddfinance.backend"  // Scan ALL of backend module
})
@EnableJpaRepositories(basePackages = {
        "com.ddfinance.core.repository",
        "com.ddfinance.backend.repository"
})
@EntityScan(basePackages = {
        "com.ddfinance.core.domain"
})
public class ApplicationConfiguration {

    /**
     * This configuration ensures:
     * 1. All services in both core and backend modules are scanned
     * 2. All repositories in both modules are enabled
     * 3. All JPA entities in the core domain package are scanned
     */
}
