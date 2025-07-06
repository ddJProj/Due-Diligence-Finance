package com.ddfinance.backend.service.roles;

import java.util.List;
import java.util.Map;


/**
 * Service interface for system backup and restore operations.
 * Handles database backups, file system backups, and restoration.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface BackupService {

    /**
     * Performs a complete system backup.
     *
     * @return The path to the created backup file
     * @throws Exception if backup fails
     */
    String performBackup() throws Exception;

    /**
     * Validates a backup file for integrity and compatibility.
     *
     * @param backupPath Path to the backup file
     * @return true if backup is valid and can be restored
     */
    boolean validateBackup(String backupPath);

    /**
     * Restores system data from a backup file.
     *
     * @param backupPath Path to the backup file
     * @return true if restore was successful
     * @throws Exception if restore fails
     */
    boolean performRestore(String backupPath) throws Exception;

    /**
     * Lists available backup files.
     *
     * @return List of backup file paths
     */
    List<String> listBackups();

    /**
     * Deletes old backup files based on retention policy.
     *
     * @param retentionDays Number of days to retain backups
     * @return Number of backups deleted
     */
    int cleanupOldBackups(int retentionDays);

    /**
     * Gets backup file metadata.
     *
     * @param backupPath Path to the backup file
     * @return Map containing backup metadata (size, date, version, etc.)
     */
    Map<String, Object> getBackupMetadata(String backupPath);

    /**
     * Performs an incremental backup.
     *
     * @param lastBackupPath Path to the last full backup
     * @return Path to the incremental backup file
     * @throws Exception if backup fails
     */
    String performIncrementalBackup(String lastBackupPath) throws Exception;
}
