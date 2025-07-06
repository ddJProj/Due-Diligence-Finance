// ClientRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.Employee;
import com.ddfinance.core.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Client entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByUserAccount(UserAccount userAccount);

    Optional<Client> findByClientId(String clientId);

    List<Client> findByAssignedEmployee(Employee employee);

    boolean existsByUserAccount(UserAccount userAccount);
}
