package com.ddfinance.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for system statistics.
 * Provides overview of system usage and health.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SystemStatsDTO {

    private Long totalUsers;
    private Long activeUsers;
    private Long totalClients;
    private Long totalEmployees;
    private Long totalGuests;
    private Long totalAdmins;

    private Long totalInvestments;
    private Long activeInvestments;
    private Double totalInvestmentValue;

    private Long pendingUpgradeRequests;
    private Long totalTransactions;

    private String systemUptime;
    private Double cpuUsage;
    private Double memoryUsage;
    private Long diskSpaceAvailable;


    private Double totalSystemValue;
    private LocalDateTime generatedAt;
    private Long databaseSize;}
