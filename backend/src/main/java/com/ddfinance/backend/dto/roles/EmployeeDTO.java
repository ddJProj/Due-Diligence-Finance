package com.ddfinance.backend.dto.roles;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for employee information.
 * Used for client-employee relationships and employee profiles.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDTO {

    private Long id;
    private String employeeId;
    private String email;
    private String firstName;
    private String lastName;
    private String department;
    private String location;
    private String phoneNumber;

    // Statistics
    private Integer totalClients;
    private Double totalAssetsUnderManagement;
}