package com.ddfinance.backend.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.*;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class DateTimeUtilsTest {

    private static final ZoneId TEST_ZONE = ZoneId.of("America/New_York");
    private static final LocalDateTime TEST_DATE_TIME = LocalDateTime.of(2024, 3, 15, 14, 30, 45);
    private static final LocalDate TEST_DATE = LocalDate.of(2024, 3, 15);

    @BeforeEach
    void setUp() {
        // Reset to default timezone if any test changes it
        DateTimeUtils.setDefaultZoneId(ZoneId.systemDefault());
    }

    @Nested
    @DisplayName("Current Date/Time Tests")
    class CurrentDateTimeTests {

        @Test
        @DisplayName("Should get current date")
        void shouldGetCurrentDate() {
            LocalDate currentDate = DateTimeUtils.getCurrentDate();
            assertNotNull(currentDate);
            assertEquals(LocalDate.now(), currentDate);
        }

        @Test
        @DisplayName("Should get current date time")
        void shouldGetCurrentDateTime() {
            LocalDateTime currentDateTime = DateTimeUtils.getCurrentDateTime();
            assertNotNull(currentDateTime);

            // Allow 1 second tolerance for test execution time
            long secondsDiff = Duration.between(LocalDateTime.now(), currentDateTime).abs().getSeconds();
            assertTrue(secondsDiff <= 1);
        }

        @Test
        @DisplayName("Should get current timestamp")
        void shouldGetCurrentTimestamp() {
            Instant timestamp = DateTimeUtils.getCurrentTimestamp();
            assertNotNull(timestamp);

            // Allow 1 second tolerance
            long secondsDiff = Duration.between(Instant.now(), timestamp).abs().getSeconds();
            assertTrue(secondsDiff <= 1);
        }

        @Test
        @DisplayName("Should get current date in specific timezone")
        void shouldGetCurrentDateInTimezone() {
            LocalDate nyDate = DateTimeUtils.getCurrentDate(TEST_ZONE);
            LocalDate utcDate = DateTimeUtils.getCurrentDate(ZoneId.of("UTC"));

            assertNotNull(nyDate);
            assertNotNull(utcDate);

            // Dates might differ if it's near midnight
            int dayDiff = Math.abs(nyDate.getDayOfMonth() - utcDate.getDayOfMonth());
            assertTrue(dayDiff <= 1);
        }
    }

    @Nested
    @DisplayName("Formatting Tests")
    class FormattingTests {

        @Test
        @DisplayName("Should format date with default pattern")
        void shouldFormatDateWithDefaultPattern() {
            String formatted = DateTimeUtils.formatDate(TEST_DATE);
            assertEquals("2024-03-15", formatted);
        }

        @Test
        @DisplayName("Should format date with custom pattern")
        void shouldFormatDateWithCustomPattern() {
            String formatted = DateTimeUtils.formatDate(TEST_DATE, "dd/MM/yyyy");
            assertEquals("15/03/2024", formatted);
        }

        @Test
        @DisplayName("Should format date time with default pattern")
        void shouldFormatDateTimeWithDefaultPattern() {
            String formatted = DateTimeUtils.formatDateTime(TEST_DATE_TIME);
            assertEquals("2024-03-15 14:30:45", formatted);
        }

        @Test
        @DisplayName("Should format date time with custom pattern")
        void shouldFormatDateTimeWithCustomPattern() {
            String formatted = DateTimeUtils.formatDateTime(TEST_DATE_TIME, "dd-MM-yyyy HH:mm");
            assertEquals("15-03-2024 14:30", formatted);
        }

        @Test
        @DisplayName("Should format timestamp")
        void shouldFormatTimestamp() {
            Instant timestamp = TEST_DATE_TIME.toInstant(ZoneOffset.UTC);
            String formatted = DateTimeUtils.formatTimestamp(timestamp);
            assertTrue(formatted.contains("2024-03-15"));
        }

        @Test
        @DisplayName("Should return null for null date formatting")
        void shouldReturnNullForNullDateFormatting() {
            assertNull(DateTimeUtils.formatDate(null));
            assertNull(DateTimeUtils.formatDateTime(null));
            assertNull(DateTimeUtils.formatTimestamp(null));
        }

        @ParameterizedTest
        @ValueSource(strings = {"SHORT", "MEDIUM", "LONG", "FULL"})
        @DisplayName("Should format with predefined styles")
        void shouldFormatWithPredefinedStyles(String style) {
            String formatted = DateTimeUtils.formatWithStyle(TEST_DATE_TIME, style);
            assertNotNull(formatted);
            assertFalse(formatted.isEmpty());
        }
    }

    @Nested
    @DisplayName("Parsing Tests")
    class ParsingTests {

        @Test
        @DisplayName("Should parse date with default pattern")
        void shouldParseDateWithDefaultPattern() {
            LocalDate parsed = DateTimeUtils.parseDate("2024-03-15");
            assertEquals(TEST_DATE, parsed);
        }

        @Test
        @DisplayName("Should parse date with custom pattern")
        void shouldParseDateWithCustomPattern() {
            LocalDate parsed = DateTimeUtils.parseDate("15/03/2024", "dd/MM/yyyy");
            assertEquals(TEST_DATE, parsed);
        }

        @Test
        @DisplayName("Should parse date time with default pattern")
        void shouldParseDateTimeWithDefaultPattern() {
            LocalDateTime parsed = DateTimeUtils.parseDateTime("2024-03-15 14:30:45");
            assertEquals(TEST_DATE_TIME, parsed);
        }

        @Test
        @DisplayName("Should parse date time with custom pattern")
        void shouldParseDateTimeWithCustomPattern() {
            LocalDateTime parsed = DateTimeUtils.parseDateTime("15-03-2024 14:30", "dd-MM-yyyy HH:mm");
            assertEquals(TEST_DATE_TIME.withSecond(0).withNano(0), parsed);
        }

        @Test
        @DisplayName("Should throw exception for invalid date format")
        void shouldThrowExceptionForInvalidDateFormat() {
            assertThrows(DateTimeParseException.class,
                    () -> DateTimeUtils.parseDate("invalid-date"));
        }

        @Test
        @DisplayName("Should return null for null date parsing")
        void shouldReturnNullForNullDateParsing() {
            assertNull(DateTimeUtils.parseDate(null));
            assertNull(DateTimeUtils.parseDateTime(null));
        }
    }

    @Nested
    @DisplayName("Conversion Tests")
    class ConversionTests {

        @Test
        @DisplayName("Should convert between Date and LocalDate")
        void shouldConvertBetweenDateAndLocalDate() {
            Date date = new Date();
            LocalDate localDate = DateTimeUtils.toLocalDate(date);
            Date convertedBack = DateTimeUtils.toDate(localDate);

            assertNotNull(localDate);
            assertNotNull(convertedBack);

            // Compare only the date part
            LocalDate originalLocalDate = date.toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDate();
            assertEquals(originalLocalDate, localDate);
        }

        @Test
        @DisplayName("Should convert between Date and LocalDateTime")
        void shouldConvertBetweenDateAndLocalDateTime() {
            Date date = new Date();
            LocalDateTime localDateTime = DateTimeUtils.toLocalDateTime(date);
            Date convertedBack = DateTimeUtils.toDate(localDateTime);

            assertNotNull(localDateTime);
            assertNotNull(convertedBack);

            // Allow small difference due to millisecond precision
            long diffMillis = Math.abs(date.getTime() - convertedBack.getTime());
            assertTrue(diffMillis < 1000);
        }

        @Test
        @DisplayName("Should convert LocalDateTime to Instant")
        void shouldConvertLocalDateTimeToInstant() {
            Instant instant = DateTimeUtils.toInstant(TEST_DATE_TIME);
            assertNotNull(instant);
        }

        @Test
        @DisplayName("Should convert Instant to LocalDateTime")
        void shouldConvertInstantToLocalDateTime() {
            Instant instant = Instant.now();
            LocalDateTime localDateTime = DateTimeUtils.toLocalDateTime(instant);
            assertNotNull(localDateTime);
        }

        @Test
        @DisplayName("Should handle null conversions")
        void shouldHandleNullConversions() {
            assertNull(DateTimeUtils.toLocalDate((Date) null));
            assertNull(DateTimeUtils.toLocalDateTime((Date) null));
            assertNull(DateTimeUtils.toDate((LocalDate) null));
            assertNull(DateTimeUtils.toDate((LocalDateTime) null));
            assertNull(DateTimeUtils.toInstant(null));
            assertNull(DateTimeUtils.toLocalDateTime((Instant) null));
        }
    }

    @Nested
    @DisplayName("Date Calculation Tests")
    class DateCalculationTests {

        @Test
        @DisplayName("Should add days to date")
        void shouldAddDaysToDate() {
            LocalDate result = DateTimeUtils.addDays(TEST_DATE, 5);
            assertEquals(LocalDate.of(2024, 3, 20), result);
        }

        @Test
        @DisplayName("Should subtract days from date")
        void shouldSubtractDaysFromDate() {
            LocalDate result = DateTimeUtils.addDays(TEST_DATE, -5);
            assertEquals(LocalDate.of(2024, 3, 10), result);
        }

        @Test
        @DisplayName("Should add months to date")
        void shouldAddMonthsToDate() {
            LocalDate result = DateTimeUtils.addMonths(TEST_DATE, 2);
            assertEquals(LocalDate.of(2024, 5, 15), result);
        }

        @Test
        @DisplayName("Should add years to date")
        void shouldAddYearsToDate() {
            LocalDate result = DateTimeUtils.addYears(TEST_DATE, 1);
            assertEquals(LocalDate.of(2025, 3, 15), result);
        }

        @Test
        @DisplayName("Should calculate days between dates")
        void shouldCalculateDaysBetweenDates() {
            LocalDate date1 = LocalDate.of(2024, 3, 10);
            LocalDate date2 = LocalDate.of(2024, 3, 20);

            long days = DateTimeUtils.daysBetween(date1, date2);
            assertEquals(10, days);
        }

        @Test
        @DisplayName("Should calculate months between dates")
        void shouldCalculateMonthsBetweenDates() {
            LocalDate date1 = LocalDate.of(2024, 1, 15);
            LocalDate date2 = LocalDate.of(2024, 4, 15);

            long months = DateTimeUtils.monthsBetween(date1, date2);
            assertEquals(3, months);
        }

        @Test
        @DisplayName("Should handle null in calculations")
        void shouldHandleNullInCalculations() {
            assertNull(DateTimeUtils.addDays(null, 5));
            assertEquals(0, DateTimeUtils.daysBetween(null, TEST_DATE));
            assertEquals(0, DateTimeUtils.daysBetween(TEST_DATE, null));
        }
    }

    @Nested
    @DisplayName("Business Day Tests")
    class BusinessDayTests {

        @Test
        @DisplayName("Should identify business days")
        void shouldIdentifyBusinessDays() {
            LocalDate monday = LocalDate.of(2024, 3, 11);
            LocalDate friday = LocalDate.of(2024, 3, 15);
            LocalDate saturday = LocalDate.of(2024, 3, 16);
            LocalDate sunday = LocalDate.of(2024, 3, 17);

            assertTrue(DateTimeUtils.isBusinessDay(monday));
            assertTrue(DateTimeUtils.isBusinessDay(friday));
            assertFalse(DateTimeUtils.isBusinessDay(saturday));
            assertFalse(DateTimeUtils.isBusinessDay(sunday));
        }

        @Test
        @DisplayName("Should add business days")
        void shouldAddBusinessDays() {
            LocalDate friday = LocalDate.of(2024, 3, 15);
            LocalDate result = DateTimeUtils.addBusinessDays(friday, 1);

            // Should skip weekend and return Monday
            assertEquals(LocalDate.of(2024, 3, 18), result);
        }

        @Test
        @DisplayName("Should calculate business days between dates")
        void shouldCalculateBusinessDaysBetween() {
            LocalDate start = LocalDate.of(2024, 3, 11); // Monday
            LocalDate end = LocalDate.of(2024, 3, 18);   // Next Monday

            long businessDays = DateTimeUtils.businessDaysBetween(start, end);
            assertEquals(5, businessDays); // Mon-Fri
        }
    }

    @Nested
    @DisplayName("Date Range Tests")
    class DateRangeTests {

        @Test
        @DisplayName("Should check if date is between range")
        void shouldCheckIfDateIsBetweenRange() {
            LocalDate start = LocalDate.of(2024, 3, 1);
            LocalDate end = LocalDate.of(2024, 3, 31);

            assertTrue(DateTimeUtils.isBetween(TEST_DATE, start, end));
            assertFalse(DateTimeUtils.isBetween(LocalDate.of(2024, 4, 1), start, end));
        }

        @Test
        @DisplayName("Should check if date is in past")
        void shouldCheckIfDateIsInPast() {
            LocalDate pastDate = LocalDate.now().minusDays(1);
            LocalDate futureDate = LocalDate.now().plusDays(1);

            assertTrue(DateTimeUtils.isPast(pastDate));
            assertFalse(DateTimeUtils.isPast(futureDate));
        }

        @Test
        @DisplayName("Should check if date is in future")
        void shouldCheckIfDateIsInFuture() {
            LocalDate pastDate = LocalDate.now().minusDays(1);
            LocalDate futureDate = LocalDate.now().plusDays(1);

            assertFalse(DateTimeUtils.isFuture(pastDate));
            assertTrue(DateTimeUtils.isFuture(futureDate));
        }

        @Test
        @DisplayName("Should get start and end of day")
        void shouldGetStartAndEndOfDay() {
            LocalDateTime startOfDay = DateTimeUtils.getStartOfDay(TEST_DATE);
            LocalDateTime endOfDay = DateTimeUtils.getEndOfDay(TEST_DATE);

            assertEquals(LocalDateTime.of(2024, 3, 15, 0, 0, 0), startOfDay);
            assertEquals(LocalDateTime.of(2024, 3, 15, 23, 59, 59, 999999999), endOfDay);
        }

        @Test
        @DisplayName("Should get start and end of month")
        void shouldGetStartAndEndOfMonth() {
            LocalDate startOfMonth = DateTimeUtils.getStartOfMonth(TEST_DATE);
            LocalDate endOfMonth = DateTimeUtils.getEndOfMonth(TEST_DATE);

            assertEquals(LocalDate.of(2024, 3, 1), startOfMonth);
            assertEquals(LocalDate.of(2024, 3, 31), endOfMonth);
        }
    }

    @Nested
    @DisplayName("Time Zone Tests")
    class TimeZoneTests {

        @Test
        @DisplayName("Should convert between time zones")
        void shouldConvertBetweenTimeZones() {
            LocalDateTime nyTime = LocalDateTime.of(2024, 3, 15, 12, 0);
            ZoneId nyZone = ZoneId.of("America/New_York");
            ZoneId laZone = ZoneId.of("America/Los_Angeles");

            LocalDateTime laTime = DateTimeUtils.convertTimeZone(nyTime, nyZone, laZone);

            // LA is 3 hours behind NY
            assertEquals(9, laTime.getHour());
        }

        @Test
        @DisplayName("Should set and use default time zone")
        void shouldSetAndUseDefaultTimeZone() {
            DateTimeUtils.setDefaultZoneId(TEST_ZONE);
            assertEquals(TEST_ZONE, DateTimeUtils.getDefaultZoneId());

            // Reset to system default
            DateTimeUtils.setDefaultZoneId(ZoneId.systemDefault());
        }
    }

    @Nested
    @DisplayName("Utility Method Tests")
    class UtilityMethodTests {

        @Test
        @DisplayName("Should get age from birth date")
        void shouldGetAgeFromBirthDate() {
            LocalDate birthDate = LocalDate.now().minusYears(25).minusMonths(6);
            int age = DateTimeUtils.getAge(birthDate);
            assertEquals(25, age);
        }

        @Test
        @DisplayName("Should check if year is leap year")
        void shouldCheckIfYearIsLeapYear() {
            assertTrue(DateTimeUtils.isLeapYear(2024));
            assertFalse(DateTimeUtils.isLeapYear(2023));
            assertTrue(DateTimeUtils.isLeapYear(2000));
            assertFalse(DateTimeUtils.isLeapYear(1900));
        }

        @Test
        @DisplayName("Should get quarter from date")
        void shouldGetQuarterFromDate() {
            assertEquals(1, DateTimeUtils.getQuarter(LocalDate.of(2024, 3, 15)));
            assertEquals(2, DateTimeUtils.getQuarter(LocalDate.of(2024, 4, 15)));
            assertEquals(3, DateTimeUtils.getQuarter(LocalDate.of(2024, 9, 15)));
            assertEquals(4, DateTimeUtils.getQuarter(LocalDate.of(2024, 12, 15)));
        }

        @Test
        @DisplayName("Should get fiscal year")
        void shouldGetFiscalYear() {
            // Assuming fiscal year starts in April
            assertEquals(2023, DateTimeUtils.getFiscalYear(LocalDate.of(2024, 3, 31)));
            assertEquals(2024, DateTimeUtils.getFiscalYear(LocalDate.of(2024, 4, 1)));
        }
    }

    private static Stream<Arguments> provideDateFormats() {
        return Stream.of(
                Arguments.of("2024-03-15", "yyyy-MM-dd"),
                Arguments.of("15/03/2024", "dd/MM/yyyy"),
                Arguments.of("03-15-2024", "MM-dd-yyyy"),
                Arguments.of("2024.03.15", "yyyy.MM.dd")
        );
    }

    @ParameterizedTest
    @MethodSource("provideDateFormats")
    @DisplayName("Should parse various date formats")
    void shouldParseVariousDateFormats(String dateString, String pattern) {
        LocalDate parsed = DateTimeUtils.parseDate(dateString, pattern);
        assertEquals(TEST_DATE, parsed);
    }
}
