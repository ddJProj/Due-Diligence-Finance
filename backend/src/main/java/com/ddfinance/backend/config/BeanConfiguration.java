package com.ddfinance.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Bean configuration for application dependencies.
 * Provides beans that are not automatically created by component scanning.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Configuration
public class BeanConfiguration {

    /**
     * Provides a PasswordEncoder bean for password hashing.
     * Uses BCrypt algorithm for secure password storage.
     *
     * @return BCryptPasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
