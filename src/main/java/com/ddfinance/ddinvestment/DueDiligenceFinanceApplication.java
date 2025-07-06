package com.ddfinance.ddinvestment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Main application class for Due Diligence Finance application.
 * Configures component scanning across all modules.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@SpringBootApplication
@ComponentScan(basePackages = {
        "com.ddfinance.core",
        "com.ddfinance.backend"
})
@EnableJpaRepositories(basePackages = {
        "com.ddfinance.core.repository",
        "com.ddfinance.backend.repository"
})
@EntityScan(basePackages = {
        "com.ddfinance.core.domain"
})
public class DueDiligenceFinanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DueDiligenceFinanceApplication.class, args);
    }
}
