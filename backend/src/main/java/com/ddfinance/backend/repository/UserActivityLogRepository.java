
// UserActivityLogRepository.java
package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.UserActivityLog;
import com.ddfinance.core.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for UserActivityLog entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {

    List<UserActivityLog> findByUserAccount(UserAccount userAccount);

    List<UserActivityLog> findByActivityTimeBetween(LocalDateTime start, LocalDateTime end);

    List<UserActivityLog> findByUserAccountAndActivityTimeBetween(UserAccount userAccount,
                                                                  LocalDateTime start,
                                                                  LocalDateTime end);

    List<UserActivityLog> findByActivityType(String activityType);

    @Query("SELECT COUNT(DISTINCT u.sessionId) FROM UserActivityLog u WHERE u.activityTime > :threshold AND u.activityType IN ('LOGIN', 'VIEW', 'CREATE', 'UPDATE')")
    Long countActiveSessionsInLastMinutes(@Param("threshold") LocalDateTime threshold);

    default Long countActiveSessionsInLastMinutes(int minutes) {
        return countActiveSessionsInLastMinutes(LocalDateTime.now().minusMinutes(minutes));
    }
}
