// EmployeeRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Employee;
import com.ddfinance.core.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Employee entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUserAccount(UserAccount userAccount);

    Optional<Employee> findByEmployeeId(String employeeId);

    boolean existsByUserAccount(UserAccount userAccount);
}
