package com.ddfinance.backend.dto.roles;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for detailed employee information.
 * Contains employee profile and performance metrics.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDetailsDTO {

    private Long id;
    private String employeeId;
    private String email;
    private String firstName;
    private String lastName;
    private String department;
    private String location;
    private String phoneNumber;

    // Employment details
    private LocalDateTime hireDate;
    private String employmentStatus;
    private String managerId;
    private Double salary;

    // Performance metrics
    private Integer totalClients;
    private Integer activeClients;
    private Double totalAssetsUnderManagement;
    private Double performanceRating;
    private Integer yearsOfExperience;

    // Certifications and qualifications
    private String[] certifications;
    private String[] specializations;

    // Contact preferences
    private String preferredContactMethod;
    private String officeHours;
}