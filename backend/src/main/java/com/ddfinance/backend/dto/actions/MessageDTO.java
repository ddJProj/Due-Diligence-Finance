package com.ddfinance.backend.dto.actions;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for client-employee messaging.
 * Used for communication between clients and their assigned employees.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO {

    @NotBlank(message = "Subject is required")
    @Size(max = 200, message = "Subject must not exceed 200 characters")
    private String subject;

    @NotBlank(message = "Message content is required")
    @Size(min = 10, max = 5000, message = "Message must be between 10 and 5000 characters")
    private String content;

    // For replies
    private Long replyToMessageId;

    // Recipient (used by employees to specify client)
    private Long recipientId;

    // Message priority
    private String priority; // LOW, NORMAL, HIGH, URGENT
}
