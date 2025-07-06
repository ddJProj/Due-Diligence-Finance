// FAQRepository.java
package com.ddfinance.backend.repository;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Repository interface for FAQ operations.
 * TODO: Replace with actual entity-based repository when FAQ entity is created
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface FAQRepository {

    List<Map<String, String>> findAllActiveOrderByDisplayOrder();
}
