package com.ddfinance.core.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for ContactRequest entity.
 * Tests sales lead tracking and conversion functionality.
 */
public class ContactRequestTest {

    private ContactRequest contactRequest;
    private LocalDateTime testTimestamp;
    private Employee assignedEmployee;
    private Client convertedClient;
    private UserAccount employeeUser;
    private UserAccount clientUser;

    @BeforeEach
    void setUp() {
        contactRequest = new ContactRequest();
        testTimestamp = LocalDateTime.now();

        // Create test employee
        employeeUser = new UserAccount("sales@ddfinance.com", "password", "John", "Sales");
        employeeUser.setId(10L);

        assignedEmployee = new Employee();
        assignedEmployee.setId(5L);
        assignedEmployee.setUserAccount(employeeUser);
        assignedEmployee.setEmployeeId("EMP-005");

        // Create test client
        clientUser = new UserAccount("client@example.com", "password", "Jane", "Client");
        clientUser.setId(20L);

        convertedClient = new Client();
        convertedClient.setId(100L);
        convertedClient.setUserAccount(clientUser);
        convertedClient.setClientId("CLI-100");
    }

    @Test
    void testDefaultConstructor() {
        ContactRequest request = new ContactRequest();
        assertNotNull(request);
        assertNull(request.getId());
        assertNull(request.getName());
        assertNull(request.getEmail());
        assertNull(request.getPhone());
        assertNull(request.getMessage());
        assertNull(request.getSource());
        assertNull(request.getSubmittedAt());
        assertEquals("NEW", request.getStatus());
        assertNull(request.getAssignedTo());
        assertNull(request.getContactedAt());
        assertNull(request.getFollowUpDate());
        assertNull(request.getNotes());
        assertNull(request.getConversionDate());
        assertNull(request.getConvertedToClient());
    }

    @Test
    void testAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime followUp = now.plusDays(3);
        LocalDateTime conversion = now.plusDays(10);

        ContactRequest request = new ContactRequest(
                1L, "John Doe", "john@example.com", "+1234567890",
                "Interested in investment services", "WEBSITE",
                now, "QUALIFIED", assignedEmployee,
                now.plusHours(2), followUp, "High potential client",
                conversion, convertedClient
        );

        assertEquals(1L, request.getId());
        assertEquals("John Doe", request.getName());
        assertEquals("john@example.com", request.getEmail());
        assertEquals("+1234567890", request.getPhone());
        assertEquals("Interested in investment services", request.getMessage());
        assertEquals("WEBSITE", request.getSource());
        assertEquals(now, request.getSubmittedAt());
        assertEquals("QUALIFIED", request.getStatus());
        assertEquals(assignedEmployee, request.getAssignedTo());
        assertEquals(now.plusHours(2), request.getContactedAt());
        assertEquals(followUp, request.getFollowUpDate());
        assertEquals("High potential client", request.getNotes());
        assertEquals(conversion, request.getConversionDate());
        assertEquals(convertedClient, request.getConvertedToClient());
    }

    @Test
    void testIdGetterSetter() {
        contactRequest.setId(100L);
        assertEquals(100L, contactRequest.getId());
    }

    @Test
    void testNameGetterSetter() {
        contactRequest.setName("Jane Smith");
        assertEquals("Jane Smith", contactRequest.getName());
    }

    @Test
    void testEmailGetterSetter() {
        contactRequest.setEmail("jane@example.com");
        assertEquals("jane@example.com", contactRequest.getEmail());
    }

    @Test
    void testPhoneGetterSetter() {
        contactRequest.setPhone("+1-555-0123");
        assertEquals("+1-555-0123", contactRequest.getPhone());
    }

    @Test
    void testMessageGetterSetter() {
        String message = "I would like to invest $100,000 in your managed portfolios";
        contactRequest.setMessage(message);
        assertEquals(message, contactRequest.getMessage());
    }

    @Test
    void testSourceGetterSetter() {
        contactRequest.setSource("GUEST_PORTAL");
        assertEquals("GUEST_PORTAL", contactRequest.getSource());

        contactRequest.setSource("REFERRAL");
        assertEquals("REFERRAL", contactRequest.getSource());
    }

    @Test
    void testSubmittedAtGetterSetter() {
        contactRequest.setSubmittedAt(testTimestamp);
        assertEquals(testTimestamp, contactRequest.getSubmittedAt());
    }

    @Test
    void testStatusGetterSetter() {
        // Test all status values
        String[] statuses = {"NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"};

        for (String status : statuses) {
            contactRequest.setStatus(status);
            assertEquals(status, contactRequest.getStatus());
        }
    }

    @Test
    void testAssignedToGetterSetter() {
        contactRequest.setAssignedTo(assignedEmployee);
        assertEquals(assignedEmployee, contactRequest.getAssignedTo());
        assertEquals("EMP-005", contactRequest.getAssignedTo().getEmployeeId());
    }

    @Test
    void testContactedAtGetterSetter() {
        LocalDateTime contactedTime = testTimestamp.plusHours(1);
        contactRequest.setContactedAt(contactedTime);
        assertEquals(contactedTime, contactRequest.getContactedAt());
    }

    @Test
    void testFollowUpDateGetterSetter() {
        LocalDateTime followUpDate = testTimestamp.plusDays(7);
        contactRequest.setFollowUpDate(followUpDate);
        assertEquals(followUpDate, contactRequest.getFollowUpDate());
    }

    @Test
    void testNotesGetterSetter() {
        String notes = "Client has $500k to invest, interested in growth portfolios";
        contactRequest.setNotes(notes);
        assertEquals(notes, contactRequest.getNotes());
    }

    @Test
    void testConversionDateGetterSetter() {
        LocalDateTime conversionDate = testTimestamp.plusDays(14);
        contactRequest.setConversionDate(conversionDate);
        assertEquals(conversionDate, contactRequest.getConversionDate());
    }

    @Test
    void testConvertedToClientGetterSetter() {
        contactRequest.setConvertedToClient(convertedClient);
        assertEquals(convertedClient, contactRequest.getConvertedToClient());
        assertEquals("CLI-100", contactRequest.getConvertedToClient().getClientId());
    }

    @Test
    void testPrePersist() {
        ContactRequest newRequest = new ContactRequest();
        newRequest.onCreate();

        assertNotNull(newRequest.getSubmittedAt());
        assertEquals("NEW", newRequest.getStatus());

        // Test with existing values (should not override)
        ContactRequest existingRequest = new ContactRequest();
        LocalDateTime existingTime = LocalDateTime.now().minusDays(1);
        existingRequest.setSubmittedAt(existingTime);
        existingRequest.setStatus("QUALIFIED");
        existingRequest.onCreate();

        assertEquals(existingTime, existingRequest.getSubmittedAt());
        assertEquals("QUALIFIED", existingRequest.getStatus());
    }

    @Test
    void testEquals() {
        ContactRequest request1 = new ContactRequest();
        ContactRequest request2 = new ContactRequest();

        // Both null IDs
        assertEquals(request1, request2);

        // Same ID
        request1.setId(1L);
        request2.setId(1L);
        assertEquals(request1, request2);

        // Different IDs
        request2.setId(2L);
        assertNotEquals(request1, request2);

        // Different fields but same ID
        request2.setId(1L);
        request1.setName("Name 1");
        request2.setName("Name 2");
        assertEquals(request1, request2); // Equals only checks ID

        // Null comparison
        assertNotEquals(request1, null);

        // Different class
        assertNotEquals(request1, "string");

        // Self comparison
        assertEquals(request1, request1);
    }

    @Test
    void testHashCode() {
        ContactRequest request1 = new ContactRequest();
        ContactRequest request2 = new ContactRequest();

        // Both null IDs should have same hashcode
        assertEquals(request1.hashCode(), request2.hashCode());

        // Same ID should have same hashcode
        request1.setId(100L);
        request2.setId(100L);
        assertEquals(request1.hashCode(), request2.hashCode());

        // Different IDs should have different hashcodes
        request2.setId(200L);
        assertNotEquals(request1.hashCode(), request2.hashCode());
    }

    @Test
    void testSalesWorkflow() {
        // Test typical sales workflow
        ContactRequest lead = new ContactRequest();
        lead.setName("Potential Client");
        lead.setEmail("lead@example.com");
        lead.setMessage("Interested in services");
        lead.setSource("WEBSITE");
        lead.onCreate();

        // Initial state
        assertEquals("NEW", lead.getStatus());
        assertNotNull(lead.getSubmittedAt());

        // Assign to sales rep
        lead.setAssignedTo(assignedEmployee);
        lead.setStatus("CONTACTED");
        lead.setContactedAt(LocalDateTime.now());
        lead.setFollowUpDate(LocalDateTime.now().plusDays(3));

        // Qualify lead
        lead.setStatus("QUALIFIED");
        lead.setNotes("High net worth individual, ready to invest");

        // Convert to client
        lead.setStatus("CONVERTED");
        lead.setConversionDate(LocalDateTime.now());
        lead.setConvertedToClient(convertedClient);

        // Verify final state
        assertEquals("CONVERTED", lead.getStatus());
        assertNotNull(lead.getConversionDate());
        assertNotNull(lead.getConvertedToClient());
    }

    @Test
    void testMaxLengthFields() {
        // Test that long strings are handled (up to column limits)
        String longName = "A".repeat(100);
        String longEmail = "a".repeat(90) + "@test.com"; // 100 chars total
        String longMessage = "B".repeat(2000);
        String longNotes = "C".repeat(2000);

        contactRequest.setName(longName);
        contactRequest.setEmail(longEmail);
        contactRequest.setMessage(longMessage);
        contactRequest.setNotes(longNotes);

        assertEquals(100, contactRequest.getName().length());
        assertEquals(100, contactRequest.getEmail().length());
        assertEquals(2000, contactRequest.getMessage().length());
        assertEquals(2000, contactRequest.getNotes().length());
    }

    @Test
    void testSourceValues() {
        // Test common source values
        String[] sources = {"GUEST_PORTAL", "WEBSITE", "REFERRAL", "PHONE", "EMAIL", "PARTNER"};

        for (String source : sources) {
            contactRequest.setSource(source);
            assertEquals(source, contactRequest.getSource());
        }
    }

    @Test
    void testClosedWithoutConversion() {
        // Test closing a lead without conversion
        contactRequest.setStatus("NEW");
        contactRequest.setAssignedTo(assignedEmployee);
        contactRequest.setStatus("CONTACTED");
        contactRequest.setContactedAt(LocalDateTime.now());
        contactRequest.setStatus("CLOSED");
        contactRequest.setNotes("Not interested at this time");

        assertEquals("CLOSED", contactRequest.getStatus());
        assertNull(contactRequest.getConvertedToClient());
        assertNull(contactRequest.getConversionDate());
    }
}
