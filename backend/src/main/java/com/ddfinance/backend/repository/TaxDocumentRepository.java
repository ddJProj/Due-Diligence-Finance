// TaxDocumentRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.TaxDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for TaxDocument entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface TaxDocumentRepository extends JpaRepository<TaxDocument, Long> {

    List<TaxDocument> findByClientAndYear(Client client, Integer year);

    List<TaxDocument> findByClientOrderByYearDesc(Client client);

    List<TaxDocument> findByYearAndSentToClientFalse(Integer year);
}
