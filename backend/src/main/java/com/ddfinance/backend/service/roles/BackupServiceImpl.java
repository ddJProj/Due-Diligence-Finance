package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.repository.*;
import com.ddfinance.core.domain.*;
import com.ddfinance.core.repository.UserAccountRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * Implementation of BackupService.
 * Handles system backup and restore operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BackupServiceImpl implements BackupService {

    private final UserAccountRepository userAccountRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final AdminRepository adminRepository;
    private final GuestRepository guestRepository;
    private final InvestmentRepository investmentRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final AuditLogRepository auditLogRepository;

    @Value("${backup.directory:/var/ddfinance/backups}")
    private String backupDirectory;

    @Value("${backup.retention.days:30}")
    private int defaultRetentionDays;

    private final ObjectMapper objectMapper = createObjectMapper();
    private static final String BACKUP_VERSION = "1.0";
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private static ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] createFullBackup() throws Exception {
        log.info("Creating full system backup");

        BackupData backupData = new BackupData();
        backupData.setVersion(BACKUP_VERSION);
        backupData.setCreatedAt(LocalDateTime.now());
        backupData.setType("FULL");

        // Collect all data
        backupData.setUsers(userAccountRepository.findAll());
        backupData.setClients(clientRepository.findAll());
        backupData.setEmployees(employeeRepository.findAll());
        backupData.setAdmins(adminRepository.findAll());
        backupData.setGuests(guestRepository.findAll());
        backupData.setInvestments(investmentRepository.findAll());
        backupData.setConfigs(systemConfigRepository.findAll());
        backupData.setAuditLogs(auditLogRepository.findAll());

        return serializeBackupData(backupData);
    }

    @Override
    @Transactional
    public void restoreFromBackup(byte[] backupData) throws Exception {
        log.info("Restoring system from backup");

        if (backupData == null || backupData.length == 0) {
            throw new IllegalArgumentException("Invalid backup data");
        }

        BackupData data = deserializeBackupData(backupData);

        // Clear existing data (careful in production!)
        log.warn("Clearing existing data before restore");
        clearAllData();

        // Restore data
        restoreData(data);

        log.info("System restore completed");
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] createPartialBackup(boolean includeUsers, boolean includeInvestments,
                                     boolean includeConfigs) throws Exception {
        log.info("Creating partial backup - Users: {}, Investments: {}, Configs: {}",
                includeUsers, includeInvestments, includeConfigs);

        BackupData backupData = new BackupData();
        backupData.setVersion(BACKUP_VERSION);
        backupData.setCreatedAt(LocalDateTime.now());
        backupData.setType("PARTIAL");

        if (includeUsers) {
            backupData.setUsers(userAccountRepository.findAll());
            backupData.setClients(clientRepository.findAll());
            backupData.setEmployees(employeeRepository.findAll());
            backupData.setAdmins(adminRepository.findAll());
            backupData.setGuests(guestRepository.findAll());
        }

        if (includeInvestments) {
            backupData.setInvestments(investmentRepository.findAll());
        }

        if (includeConfigs) {
            backupData.setConfigs(systemConfigRepository.findAll());
        }

        return serializeBackupData(backupData);
    }

    @Override
    public boolean validateBackup(byte[] backupData) {
        if (backupData == null || backupData.length == 0) {
            return false;
        }

        try {
            BackupData data = deserializeBackupData(backupData);
            return data != null && BACKUP_VERSION.equals(data.getVersion());
        } catch (Exception e) {
            log.error("Failed to validate backup data", e);
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String performBackup() throws Exception {
        log.info("Performing system backup");

        // Create backup directory if it doesn't exist
        Path backupDir = Paths.get(backupDirectory);
        if (!Files.exists(backupDir)) {
            Files.createDirectories(backupDir);
        }

        // Generate backup filename
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        String backupFileName = String.format("backup-%s.zip", timestamp);
        Path backupPath = backupDir.resolve(backupFileName);

        // Create backup
        byte[] backupData = createFullBackup();

        // Write to zip file
        try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(backupPath))) {
            ZipEntry entry = new ZipEntry("backup.json");
            zos.putNextEntry(entry);
            zos.write(backupData);
            zos.closeEntry();

            // Add metadata
            ZipEntry metaEntry = new ZipEntry("metadata.json");
            zos.putNextEntry(metaEntry);
            zos.write(createMetadata().getBytes());
            zos.closeEntry();
        }

        log.info("Backup created successfully: {}", backupPath);
        return backupPath.toString();
    }

    @Override
    public boolean validateBackup(String backupPath) {
        if (backupPath == null || backupPath.isEmpty()) {
            return false;
        }

        Path path = Paths.get(backupPath);
        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            return false;
        }

        // Check if it's a valid zip file with our structure
        try (ZipInputStream zis = new ZipInputStream(Files.newInputStream(path))) {
            ZipEntry entry;
            boolean hasBackupFile = false;
            boolean hasMetadata = false;

            while ((entry = zis.getNextEntry()) != null) {
                if ("backup.json".equals(entry.getName())) {
                    hasBackupFile = true;
                } else if ("metadata.json".equals(entry.getName())) {
                    hasMetadata = true;
                }
                zis.closeEntry();
            }

            return hasBackupFile && hasMetadata;
        } catch (Exception e) {
            log.error("Failed to validate backup file: {}", backupPath, e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean performRestore(String backupPath) throws Exception {
        log.info("Performing system restore from: {}", backupPath);

        if (!validateBackup(backupPath)) {
            throw new IllegalArgumentException("Invalid backup file: " + backupPath);
        }

        Path path = Paths.get(backupPath);
        byte[] backupData = null;

        // Extract backup data from zip
        try (ZipInputStream zis = new ZipInputStream(Files.newInputStream(path))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if ("backup.json".equals(entry.getName())) {
                    backupData = zis.readAllBytes();
                    break;
                }
                zis.closeEntry();
            }
        }

        if (backupData == null) {
            throw new Exception("No backup data found in file");
        }

        restoreFromBackup(backupData);
        return true;
    }

    @Override
    public List<String> listBackups() {
        log.debug("Listing available backups");

        try {
            Path backupDir = Paths.get(backupDirectory);
            if (!Files.exists(backupDir)) {
                return new ArrayList<>();
            }

            return Files.list(backupDir)
                    .filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".zip"))
                    .map(Path::toString)
                    .sorted(Comparator.reverseOrder())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            log.error("Failed to list backups", e);
            return new ArrayList<>();
        }
    }

    @Override
    public int cleanupOldBackups(int retentionDays) {
        log.info("Cleaning up backups older than {} days", retentionDays);

        int deletedCount = 0;
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);

        try {
            Path backupDir = Paths.get(backupDirectory);
            if (!Files.exists(backupDir)) {
                return 0;
            }

            List<Path> oldBackups = Files.list(backupDir)
                    .filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".zip"))
                    .filter(path -> {
                        try {
                            return Files.getLastModifiedTime(path)
                                    .toInstant()
                                    .isBefore(cutoffDate.toInstant(java.time.ZoneOffset.UTC));
                        } catch (IOException e) {
                            return false;
                        }
                    })
                    .collect(Collectors.toList());

            for (Path backup : oldBackups) {
                try {
                    Files.delete(backup);
                    deletedCount++;
                    log.info("Deleted old backup: {}", backup);
                } catch (IOException e) {
                    log.error("Failed to delete backup: {}", backup, e);
                }
            }
        } catch (IOException e) {
            log.error("Failed to cleanup old backups", e);
        }

        return deletedCount;
    }

    @Override
    public Map<String, Object> getBackupMetadata(String backupPath) {
        log.debug("Getting metadata for backup: {}", backupPath);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("path", backupPath);

        try {
            Path path = Paths.get(backupPath);
            if (Files.exists(path)) {
                metadata.put("size", Files.size(path));
                metadata.put("created", Files.getLastModifiedTime(path).toInstant());

                // Extract metadata from zip
                try (ZipInputStream zis = new ZipInputStream(Files.newInputStream(path))) {
                    ZipEntry entry;
                    while ((entry = zis.getNextEntry()) != null) {
                        if ("metadata.json".equals(entry.getName())) {
                            String metaJson = new String(zis.readAllBytes());
                            Map<String, Object> meta = objectMapper.readValue(metaJson, Map.class);
                            metadata.putAll(meta);
                            break;
                        }
                        zis.closeEntry();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to get backup metadata", e);
        }

        metadata.putIfAbsent("version", BACKUP_VERSION);
        metadata.putIfAbsent("type", "UNKNOWN");

        return metadata;
    }

    @Override
    @Transactional(readOnly = true)
    public String performIncrementalBackup(String lastBackupPath) throws Exception {
        log.info("Performing incremental backup based on: {}", lastBackupPath);

        // Get last backup timestamp
        LocalDateTime lastBackupTime = getLastBackupTime(lastBackupPath);

        // Create incremental backup data
        BackupData backupData = new BackupData();
        backupData.setVersion(BACKUP_VERSION);
        backupData.setCreatedAt(LocalDateTime.now());
        backupData.setType("INCREMENTAL");
        backupData.setBasedOn(lastBackupPath);

        // Get only data modified after last backup
        backupData.setAuditLogs(auditLogRepository.findByTimestampAfter(lastBackupTime));

        // TODO: Add change tracking for other entities

        // Generate incremental backup filename
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        String backupFileName = String.format("backup-incremental-%s.zip", timestamp);
        Path backupPath = Paths.get(backupDirectory).resolve(backupFileName);

        // Write incremental backup
        byte[] backupBytes = serializeBackupData(backupData);
        try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(backupPath))) {
            ZipEntry entry = new ZipEntry("backup.json");
            zos.putNextEntry(entry);
            zos.write(backupBytes);
            zos.closeEntry();
        }

        return backupPath.toString();
    }

    @Override
    public String getLastBackupTimestamp() {
        List<String> backups = listBackups();
        if (backups.isEmpty()) {
            return null;
        }

        // Extract timestamp from filename
        String lastBackup = backups.get(0); // Already sorted in reverse order
        String filename = Paths.get(lastBackup).getFileName().toString();

        // Extract timestamp from filename pattern: backup-YYYYMMDD-HHmmss.zip
        if (filename.startsWith("backup-") && filename.endsWith(".zip")) {
            String timestamp = filename.substring(7, filename.length() - 4);
            try {
                LocalDateTime dt = LocalDateTime.parse(timestamp, TIMESTAMP_FORMATTER);
                return dt.toString();
            } catch (Exception e) {
                log.error("Failed to parse timestamp from backup filename: {}", filename);
            }
        }

        return "";
    }

    // Helper methods

    byte[] createValidBackupStructure() {
        BackupData data = new BackupData();
        data.setVersion(BACKUP_VERSION);
        data.setCreatedAt(LocalDateTime.now());
        data.setType("TEST");
        data.setUsers(new ArrayList<>());
        data.setInvestments(new ArrayList<>());
        data.setConfigs(new ArrayList<>());

        try {
            return serializeBackupData(data);
        } catch (Exception e) {
            return new byte[0];
        }
    }

    void clearBackupHistory() {
        // For testing - clears backup history
        try {
            Path backupDir = Paths.get(backupDirectory);
            if (Files.exists(backupDir)) {
                Files.list(backupDir)
                        .filter(Files::isRegularFile)
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                // Ignore
                            }
                        });
            }
        } catch (IOException e) {
            // Ignore
        }
    }

    private byte[] serializeBackupData(BackupData data) throws Exception {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            objectMapper.writeValue(baos, data);
            return baos.toByteArray();
        }
    }

    private BackupData deserializeBackupData(byte[] data) throws Exception {
        return objectMapper.readValue(data, BackupData.class);
    }

    private void clearAllData() {
        // Be very careful with this in production!
        auditLogRepository.deleteAll();
        investmentRepository.deleteAll();
        guestRepository.deleteAll();
        adminRepository.deleteAll();
        employeeRepository.deleteAll();
        clientRepository.deleteAll();
        userAccountRepository.deleteAll();
        systemConfigRepository.deleteAll();
    }

    private void restoreData(BackupData data) {
        // Restore in correct order to maintain referential integrity
        if (data.getConfigs() != null) {
            systemConfigRepository.saveAll(data.getConfigs());
        }

        if (data.getUsers() != null) {
            userAccountRepository.saveAll(data.getUsers());
        }

        if (data.getClients() != null) {
            clientRepository.saveAll(data.getClients());
        }

        if (data.getEmployees() != null) {
            employeeRepository.saveAll(data.getEmployees());
        }

        if (data.getAdmins() != null) {
            adminRepository.saveAll(data.getAdmins());
        }

        if (data.getGuests() != null) {
            guestRepository.saveAll(data.getGuests());
        }

        if (data.getInvestments() != null) {
            investmentRepository.saveAll(data.getInvestments());
        }

        if (data.getAuditLogs() != null) {
            auditLogRepository.saveAll(data.getAuditLogs());
        }
    }

    private String createMetadata() throws Exception {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("version", BACKUP_VERSION);
        metadata.put("created", LocalDateTime.now().toString());
        metadata.put("type", "FULL");
        metadata.put("system", "Due Diligence Finance");
        return objectMapper.writeValueAsString(metadata);
    }

    private LocalDateTime getLastBackupTime(String backupPath) {
        try {
            Path path = Paths.get(backupPath);
            return LocalDateTime.ofInstant(
                    Files.getLastModifiedTime(path).toInstant(),
                    java.time.ZoneOffset.UTC
            );
        } catch (IOException e) {
            // Default to 24 hours ago
            return LocalDateTime.now().minusDays(1);
        }
    }

    /**
     * Internal class to hold backup data
     */
    @Data
    static class BackupData {
        private String version;
        private LocalDateTime createdAt;
        private String type;
        private String basedOn; // For incremental backups

        private List<UserAccount> users = new ArrayList<>();
        private List<Client> clients = new ArrayList<>();
        private List<Employee> employees = new ArrayList<>();
        private List<Admin> admins = new ArrayList<>();
        private List<Guest> guests = new ArrayList<>();
        private List<Investment> investments = new ArrayList<>();
        private List<SystemConfig> configs = new ArrayList<>();
        private List<AuditLog> auditLogs = new ArrayList<>();
    }
}