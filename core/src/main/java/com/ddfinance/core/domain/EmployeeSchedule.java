package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing an employee's schedule entry.
 * Tracks appointments, tasks, and reminders for employees.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "employee_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class EmployeeSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "schedule_date", nullable = false)
    private LocalDateTime scheduleDate;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType; // MEETING, TASK, REMINDER, TRAINING, OTHER

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client; // Optional - if event is related to a specific client

    @Column(name = "all_day_event", nullable = false)
    private boolean allDayEvent = false;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(length = 500)
    private String location;

    @Column(length = 50)
    private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED

    @Column(name = "reminder_minutes")
    private Integer reminderMinutes; // Minutes before event to send reminder

    @Column(name = "recurring", nullable = false)
    private boolean recurring = false;

    @Column(name = "recurrence_pattern", length = 100)
    private String recurrencePattern; // DAILY, WEEKLY, MONTHLY, etc.

    @Column(name = "recurrence_end_date")
    private LocalDateTime recurrenceEndDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "last_modified_at")
    private LocalDateTime lastModifiedAt;

    @Column(name = "modified_by", length = 100)
    private String modifiedBy;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "SCHEDULED";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }

    /**
     * Checks if this schedule entry is upcoming.
     * @return true if the schedule date is in the future
     */
    public boolean isUpcoming() {
        return scheduleDate.isAfter(LocalDateTime.now());
    }

    /**
     * Checks if this schedule entry is overdue.
     * @return true if the schedule date has passed and status is not completed
     */
    public boolean isOverdue() {
        return scheduleDate.isBefore(LocalDateTime.now()) && !"COMPLETED".equals(status);
    }
}
