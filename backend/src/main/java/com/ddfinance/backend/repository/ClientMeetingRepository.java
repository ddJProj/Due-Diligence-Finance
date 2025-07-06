// ClientMeetingRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.ClientMeeting;
import com.ddfinance.core.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for ClientMeeting entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface ClientMeetingRepository extends JpaRepository<ClientMeeting, Long> {

    List<ClientMeeting> findByEmployee(Employee employee);

    List<ClientMeeting> findByClient(Client client);

    List<ClientMeeting> findByEmployeeAndMeetingDateBetween(Employee employee,
                                                            LocalDateTime start,
                                                            LocalDateTime end);

    List<ClientMeeting> findByClientAndMeetingDateBetween(Client client,
                                                          LocalDateTime start,
                                                          LocalDateTime end);

    long countByEmployeeAndMeetingDateBetween(Employee employee,
                                              LocalDateTime start,
                                              LocalDateTime end);

    List<ClientMeeting> findByFollowUpRequiredTrueAndFollowUpDateBefore(LocalDateTime date);
}
