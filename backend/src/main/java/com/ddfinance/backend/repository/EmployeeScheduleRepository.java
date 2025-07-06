// EmployeeScheduleRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Employee;
import com.ddfinance.core.domain.EmployeeSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for EmployeeSchedule entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface EmployeeScheduleRepository extends JpaRepository<EmployeeSchedule, Long> {

    List<EmployeeSchedule> findByEmployee(Employee employee);

    List<EmployeeSchedule> findByEmployeeAndScheduleDateBetween(Employee employee,
                                                                LocalDateTime start,
                                                                LocalDateTime end);

    List<EmployeeSchedule> findByEmployeeAndStatus(Employee employee, String status);

    List<EmployeeSchedule> findByEmployeeAndEventType(Employee employee, String eventType);

    List<EmployeeSchedule> findByScheduleDateBeforeAndStatusNot(LocalDateTime date, String status);

    List<EmployeeSchedule> findByEmployeeAndRecurringTrue(Employee employee);
}
