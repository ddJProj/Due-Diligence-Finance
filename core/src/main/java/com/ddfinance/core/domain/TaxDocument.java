package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing tax documents generated for clients.
 * Includes forms like 1099-DIV, 1099-B, and annual statements.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "tax_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class TaxDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType; // 1099-DIV, 1099-B, ANNUAL_STATEMENT

    @Column(nullable = false)
    private Integer year;

    @Column(name = "generated_date", nullable = false)
    private LocalDateTime generatedDate;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "is_final", nullable = false)
    private boolean finalVersion = false;

    @Column(name = "sent_to_client", nullable = false)
    private boolean sentToClient = false;

    @Column(name = "sent_date")
    private LocalDateTime sentDate;

    @Column(length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (generatedDate == null) {
            generatedDate = LocalDateTime.now();
        }
    }

    // TODO: Add method to generate document content based on client transactions
    // public byte[] generateDocumentContent() {
    //     // Implementation depends on reporting framework
    // }
}
