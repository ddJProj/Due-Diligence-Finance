package com.ddfinance.backend.service.roles;

import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.Employee;

/**
 * Service interface for generating various reports in different formats.
 * Handles PDF, CSV, and Excel report generation for clients and employees.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface ReportGeneratorService {

    /**
     * Generates a comprehensive client report in the specified format.
     *
     * @param client The client to generate report for
     * @param format The report format (PDF, CSV, EXCEL)
     * @return Byte array containing the report data
     * @throws Exception if report generation fails
     */
    byte[] generateClientReport(Client client, String format) throws Exception;

    /**
     * Generates a portfolio summary report for a client.
     *
     * @param client The client to generate report for
     * @param format The report format
     * @return Byte array containing the report data
     * @throws Exception if report generation fails
     */
    byte[] generatePortfolioSummary(Client client, String format) throws Exception;

    /**
     * Generates a performance report for an employee.
     *
     * @param employee The employee to generate report for
     * @param format The report format
     * @param periodStart Start date for the report period
     * @param periodEnd End date for the report period
     * @return Byte array containing the report data
     * @throws Exception if report generation fails
     */
    byte[] generateEmployeePerformanceReport(Employee employee, String format,
                                             String periodStart, String periodEnd) throws Exception;

    /**
     * Generates a tax document for a client.
     *
     * @param client The client to generate tax document for
     * @param year The tax year
     * @param documentType The type of tax document (1099-DIV, 1099-B, etc.)
     * @return Byte array containing the document data
     * @throws Exception if document generation fails
     */
    byte[] generateTaxDocument(Client client, Integer year, String documentType) throws Exception;

    /**
     * Generates an investment transaction report.
     *
     * @param client The client to generate report for
     * @param format The report format
     * @param startDate Start date for transactions
     * @param endDate End date for transactions
     * @return Byte array containing the report data
     * @throws Exception if report generation fails
     */
    byte[] generateTransactionReport(Client client, String format,
                                     String startDate, String endDate) throws Exception;
}
