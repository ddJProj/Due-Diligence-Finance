package com.ddfinance.backend.repository;

import com.ddfinance.core.domain.Message;
import com.ddfinance.core.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

/**
 * Extended repository interface for Message entity operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Existing methods...
    List<Message> findByRecipientOrderBySentAtDesc(UserAccount recipient);
    List<Message> findBySenderOrderBySentAtDesc(UserAccount sender);

    @Query("SELECT m FROM Message m WHERE m.recipient = ?1 OR m.sender = ?2 ORDER BY m.sentAt DESC")
    List<Message> findByRecipientOrSenderOrderBySentAtDesc(UserAccount recipient, UserAccount sender);

    long countByRecipientAndReadFalse(UserAccount recipient);

    // New method for EmployeeService
    @Query("SELECT m FROM Message m WHERE m.recipient = :recipient AND m.sender IN :senders ORDER BY m.sentAt DESC")
    List<Message> findByRecipientAndSenderInOrderBySentAtDesc(@Param("recipient") UserAccount recipient,
                                                              @Param("senders") Set<UserAccount> senders);
}
