package com.ddfinance.backend.util;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.FormatStyle;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Utility class for date and time operations.
 * Provides comprehensive methods for formatting, parsing, converting,
 * and calculating dates and times.
 */
public class DateTimeUtils {

    // Default date/time patterns
    private static final String DEFAULT_DATE_PATTERN = "yyyy-MM-dd";
    private static final String DEFAULT_DATETIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    private static final String DEFAULT_TIMESTAMP_PATTERN = "yyyy-MM-dd'T'HH:mm:ss.SSSZ";

    // Default formatters
    private static final DateTimeFormatter DEFAULT_DATE_FORMATTER = DateTimeFormatter.ofPattern(DEFAULT_DATE_PATTERN);
    private static final DateTimeFormatter DEFAULT_DATETIME_FORMATTER = DateTimeFormatter.ofPattern(DEFAULT_DATETIME_PATTERN);
    private static final DateTimeFormatter DEFAULT_TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern(DEFAULT_TIMESTAMP_PATTERN);

    // Default time zone
    private static ZoneId defaultZoneId = ZoneId.systemDefault();

    // Private constructor to prevent instantiation
    private DateTimeUtils() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    // Current Date/Time Methods

    /**
     * Gets the current date
     */
    public static LocalDate getCurrentDate() {
        return LocalDate.now();
    }

    /**
     * Gets the current date in a specific timezone
     */
    public static LocalDate getCurrentDate(ZoneId zoneId) {
        return LocalDate.now(zoneId);
    }

    /**
     * Gets the current date and time
     */
    public static LocalDateTime getCurrentDateTime() {
        return LocalDateTime.now();
    }

    /**
     * Gets the current timestamp
     */
    public static Instant getCurrentTimestamp() {
        return Instant.now();
    }

    // Formatting Methods

    /**
     * Formats a date using the default pattern
     */
    public static String formatDate(LocalDate date) {
        return formatDate(date, DEFAULT_DATE_PATTERN);
    }

    /**
     * Formats a date using a custom pattern
     */
    public static String formatDate(LocalDate date, String pattern) {
        if (date == null) return null;
        return date.format(DateTimeFormatter.ofPattern(pattern));
    }

    /**
     * Formats a date time using the default pattern
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        return formatDateTime(dateTime, DEFAULT_DATETIME_PATTERN);
    }

    /**
     * Formats a date time using a custom pattern
     */
    public static String formatDateTime(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) return null;
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }

    /**
     * Formats a timestamp
     */
    public static String formatTimestamp(Instant timestamp) {
        if (timestamp == null) return null;
        return timestamp.atZone(defaultZoneId).format(DEFAULT_TIMESTAMP_FORMATTER);
    }

    /**
     * Formats date/time with predefined style
     */
    public static String formatWithStyle(LocalDateTime dateTime, String style) {
        if (dateTime == null) return null;

        FormatStyle formatStyle = FormatStyle.valueOf(style.toUpperCase());
        DateTimeFormatter formatter = DateTimeFormatter.ofLocalizedDateTime(formatStyle);
        return dateTime.format(formatter);
    }

    // Parsing Methods

    /**
     * Parses a date using the default pattern
     */
    public static LocalDate parseDate(String dateString) {
        return parseDate(dateString, DEFAULT_DATE_PATTERN);
    }

    /**
     * Parses a date using a custom pattern
     */
    public static LocalDate parseDate(String dateString, String pattern) {
        if (dateString == null) return null;
        return LocalDate.parse(dateString, DateTimeFormatter.ofPattern(pattern));
    }

    /**
     * Parses a date time using the default pattern
     */
    public static LocalDateTime parseDateTime(String dateTimeString) {
        return parseDateTime(dateTimeString, DEFAULT_DATETIME_PATTERN);
    }

    /**
     * Parses a date time using a custom pattern
     */
    public static LocalDateTime parseDateTime(String dateTimeString, String pattern) {
        if (dateTimeString == null) return null;
        return LocalDateTime.parse(dateTimeString, DateTimeFormatter.ofPattern(pattern));
    }

    // Conversion Methods

    /**
     * Converts Date to LocalDate
     */
    public static LocalDate toLocalDate(Date date) {
        if (date == null) return null;
        return date.toInstant().atZone(defaultZoneId).toLocalDate();
    }

    /**
     * Converts Date to LocalDateTime
     */
    public static LocalDateTime toLocalDateTime(Date date) {
        if (date == null) return null;
        return date.toInstant().atZone(defaultZoneId).toLocalDateTime();
    }

    /**
     * Converts LocalDate to Date
     */
    public static Date toDate(LocalDate localDate) {
        if (localDate == null) return null;
        return Date.from(localDate.atStartOfDay(defaultZoneId).toInstant());
    }

    /**
     * Converts LocalDateTime to Date
     */
    public static Date toDate(LocalDateTime localDateTime) {
        if (localDateTime == null) return null;
        return Date.from(localDateTime.atZone(defaultZoneId).toInstant());
    }

    /**
     * Converts LocalDateTime to Instant
     */
    public static Instant toInstant(LocalDateTime localDateTime) {
        if (localDateTime == null) return null;
        return localDateTime.atZone(defaultZoneId).toInstant();
    }

    /**
     * Converts Instant to LocalDateTime
     */
    public static LocalDateTime toLocalDateTime(Instant instant) {
        if (instant == null) return null;
        return instant.atZone(defaultZoneId).toLocalDateTime();
    }

    // Date Calculation Methods

    /**
     * Adds days to a date
     */
    public static LocalDate addDays(LocalDate date, int days) {
        if (date == null) return null;
        return date.plusDays(days);
    }

    /**
     * Adds months to a date
     */
    public static LocalDate addMonths(LocalDate date, int months) {
        if (date == null) return null;
        return date.plusMonths(months);
    }

    /**
     * Adds years to a date
     */
    public static LocalDate addYears(LocalDate date, int years) {
        if (date == null) return null;
        return date.plusYears(years);
    }

    /**
     * Calculates days between two dates
     */
    public static long daysBetween(LocalDate start, LocalDate end) {
        if (start == null || end == null) return 0;
        return ChronoUnit.DAYS.between(start, end);
    }

    /**
     * Calculates months between two dates
     */
    public static long monthsBetween(LocalDate start, LocalDate end) {
        if (start == null || end == null) return 0;
        return ChronoUnit.MONTHS.between(start, end);
    }

    // Business Day Methods

    /**
     * Checks if a date is a business day (Monday-Friday)
     */
    public static boolean isBusinessDay(LocalDate date) {
        if (date == null) return false;
        DayOfWeek day = date.getDayOfWeek();
        return day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY;
    }

    /**
     * Adds business days to a date
     */
    public static LocalDate addBusinessDays(LocalDate date, int businessDays) {
        if (date == null) return null;

        LocalDate result = date;
        int addedDays = 0;
        int increment = businessDays >= 0 ? 1 : -1;

        while (addedDays != businessDays) {
            result = result.plusDays(increment);
            if (isBusinessDay(result)) {
                addedDays += increment;
            }
        }

        return result;
    }

    /**
     * Calculates business days between two dates
     */
    public static long businessDaysBetween(LocalDate start, LocalDate end) {
        if (start == null || end == null) return 0;

        LocalDate current = start;
        long businessDays = 0;

        while (!current.isAfter(end)) {
            if (isBusinessDay(current)) {
                businessDays++;
            }
            current = current.plusDays(1);
        }

        return businessDays - 1; // Exclude start date
    }

    // Date Range Methods

    /**
     * Checks if a date is between two dates (inclusive)
     */
    public static boolean isBetween(LocalDate date, LocalDate start, LocalDate end) {
        if (date == null || start == null || end == null) return false;
        return !date.isBefore(start) && !date.isAfter(end);
    }

    /**
     * Checks if a date is in the past
     */
    public static boolean isPast(LocalDate date) {
        if (date == null) return false;
        return date.isBefore(LocalDate.now());
    }

    /**
     * Checks if a date is in the future
     */
    public static boolean isFuture(LocalDate date) {
        if (date == null) return false;
        return date.isAfter(LocalDate.now());
    }

    /**
     * Gets the start of day for a date
     */
    public static LocalDateTime getStartOfDay(LocalDate date) {
        if (date == null) return null;
        return date.atStartOfDay();
    }

    /**
     * Gets the end of day for a date
     */
    public static LocalDateTime getEndOfDay(LocalDate date) {
        if (date == null) return null;
        return date.atTime(LocalTime.MAX);
    }

    /**
     * Gets the start of month for a date
     */
    public static LocalDate getStartOfMonth(LocalDate date) {
        if (date == null) return null;
        return date.withDayOfMonth(1);
    }

    /**
     * Gets the end of month for a date
     */
    public static LocalDate getEndOfMonth(LocalDate date) {
        if (date == null) return null;
        return date.withDayOfMonth(date.lengthOfMonth());
    }

    // Time Zone Methods

    /**
     * Converts a date/time between time zones
     */
    public static LocalDateTime convertTimeZone(LocalDateTime dateTime, ZoneId fromZone, ZoneId toZone) {
        if (dateTime == null) return null;
        return dateTime.atZone(fromZone).withZoneSameInstant(toZone).toLocalDateTime();
    }

    /**
     * Gets the default time zone
     */
    public static ZoneId getDefaultZoneId() {
        return defaultZoneId;
    }

    /**
     * Sets the default time zone
     */
    public static void setDefaultZoneId(ZoneId zoneId) {
        defaultZoneId = zoneId;
    }

    // Utility Methods

    /**
     * Calculates age from birth date
     */
    public static int getAge(LocalDate birthDate) {
        if (birthDate == null) return 0;
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    /**
     * Checks if a year is a leap year
     */
    public static boolean isLeapYear(int year) {
        return Year.of(year).isLeap();
    }

    /**
     * Gets the quarter for a date (1-4)
     */
    public static int getQuarter(LocalDate date) {
        if (date == null) return 0;
        return (date.getMonthValue() - 1) / 3 + 1;
    }

    /**
     * Gets the fiscal year for a date (assuming April start)
     */
    public static int getFiscalYear(LocalDate date) {
        if (date == null) return 0;
        // Fiscal year starts in April
        if (date.getMonthValue() >= 4) {
            return date.getYear();
        } else {
            return date.getYear() - 1;
        }
    }
}
