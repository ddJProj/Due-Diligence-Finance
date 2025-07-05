package com.ddfinance.core.domain;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

import jakarta.persistence.*;

/**
 * Entity representing a guest user account with limited access to the investment platform.
 * Guests can browse basic information and request to upgrade to client status for full access
 * to investment management services.
 *
 * @author DDFinance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "guests")
public class Guest {

    /**
     * Primary key for the guest record
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user account associated with this guest
     * Must be a user with GUEST role
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id", nullable = false, unique = true)
    private UserAccount userAccount;

    /**
     * Unique guest identifier following format GST-XXX
     */
    @Column(name = "guest_id", unique = true, nullable = false, length = 20)
    private String guestId;

    /**
     * Date and time when the guest registered
     */
    @Column(name = "registration_date", nullable = false)
    private LocalDateTime registrationDate;

    /**
     * Date and time of guest's last activity on the platform
     */
    @Column(name = "last_activity_date")
    private LocalDateTime lastActivityDate;

    /**
     * Area of investment interest (e.g., Retirement Planning, Portfolio Management)
     */
    @Column(name = "interest_area", length = 200)
    private String interestArea;

    /**
     * How the guest found out about DD Finance (referral tracking)
     */
    @Column(name = "referral_source", length = 100)
    private String referralSource;

    /**
     * Whether the guest has requested an upgrade to client status
     */
    @Column(name = "upgrade_requested", nullable = false)
    private boolean upgradeRequested = false;

    /**
     * Default constructor for JPA
     */
    public Guest() {
    }

    /**
     * Parameterized constructor for creating a new guest
     *
     * @param userAccount The user account with GUEST role
     * @param guestId Unique guest identifier
     * @param registrationDate When the guest registered
     * @param lastActivityDate Last activity timestamp
     * @param interestArea Area of investment interest
     * @param referralSource How they found DD Finance
     */
    public Guest(UserAccount userAccount, String guestId, LocalDateTime registrationDate,
                 LocalDateTime lastActivityDate, String interestArea, String referralSource) {
        this.userAccount = userAccount;
        this.guestId = guestId;
        this.registrationDate = registrationDate;
        this.lastActivityDate = lastActivityDate;
        this.interestArea = interestArea;
        this.referralSource = referralSource;
        this.upgradeRequested = false;
    }

    /**
     * Gets the unique identifier for this guest record
     *
     * @return The guest record ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique identifier for this guest record
     *
     * @param id The guest record ID
     * @return This Guest instance for method chaining
     */
    public Guest setId(Long id) {
        this.id = id;
        return this;
    }

    /**
     * Gets the user account associated with this guest
     *
     * @return The guest's user account
     */
    public UserAccount getUserAccount() {
        return userAccount;
    }

    /**
     * Sets the user account associated with this guest
     *
     * @param userAccount The guest's user account
     * @return This Guest instance for method chaining
     */
    public Guest setUserAccount(UserAccount userAccount) {
        this.userAccount = userAccount;
        return this;
    }

    /**
     * Gets the unique guest identifier
     *
     * @return The guest ID
     */
    public String getGuestId() {
        return guestId;
    }

    /**
     * Sets the unique guest identifier
     *
     * @param guestId The guest ID (format: GST-XXX)
     * @return This Guest instance for method chaining
     */
    public Guest setGuestId(String guestId) {
        this.guestId = guestId;
        return this;
    }

    /**
     * Gets the registration date
     *
     * @return The registration timestamp
     */
    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    /**
     * Sets the registration date
     *
     * @param registrationDate The registration timestamp
     * @return This Guest instance for method chaining
     */
    public Guest setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
        return this;
    }

    /**
     * Gets the last activity date
     *
     * @return The last activity timestamp
     */
    public LocalDateTime getLastActivityDate() {
        return lastActivityDate;
    }

    /**
     * Sets the last activity date
     *
     * @param lastActivityDate The last activity timestamp
     * @return This Guest instance for method chaining
     */
    public Guest setLastActivityDate(LocalDateTime lastActivityDate) {
        this.lastActivityDate = lastActivityDate;
        return this;
    }

    /**
     * Gets the area of investment interest
     *
     * @return The interest area
     */
    public String getInterestArea() {
        return interestArea;
    }

    /**
     * Sets the area of investment interest
     *
     * @param interestArea The interest area
     * @return This Guest instance for method chaining
     */
    public Guest setInterestArea(String interestArea) {
        this.interestArea = interestArea;
        return this;
    }

    /**
     * Gets the referral source
     *
     * @return The referral source
     */
    public String getReferralSource() {
        return referralSource;
    }

    /**
     * Sets the referral source
     *
     * @param referralSource The referral source
     * @return This Guest instance for method chaining
     */
    public Guest setReferralSource(String referralSource) {
        this.referralSource = referralSource;
        return this;
    }

    /**
     * Checks if the guest has requested an upgrade
     *
     * @return true if upgrade requested, false otherwise
     */
    public boolean isUpgradeRequested() {
        return upgradeRequested;
    }

    /**
     * Sets the upgrade requested status
     *
     * @param upgradeRequested Whether upgrade is requested
     * @return This Guest instance for method chaining
     */
    public Guest setUpgradeRequested(boolean upgradeRequested) {
        this.upgradeRequested = upgradeRequested;
        return this;
    }

    /**
     * Updates the last activity date to current time
     * Called when guest performs actions on the platform
     *
     * @return This Guest instance for method chaining
     */
    public Guest updateLastActivity() {
        this.lastActivityDate = LocalDateTime.now();
        return this;
    }

    /**
     * Checks if the guest has been recently active
     * Recent activity is defined as activity within the last 30 days
     *
     * @return true if recently active, false otherwise
     */
    public boolean isRecentlyActive() {
        if (lastActivityDate == null) return false;
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return lastActivityDate.isAfter(thirtyDaysAgo);
    }

    /**
     * Checks if the guest is eligible for upgrade to client status
     * Eligibility based on registration period and activity
     *
     * @return true if eligible for upgrade, false otherwise
     */
    public boolean isEligibleForUpgrade() {
        if (registrationDate == null) return false;
        if (upgradeRequested) return false; // Already requested

        // Must be registered for at least 7 days
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        return registrationDate.isBefore(sevenDaysAgo);
    }

    /**
     * Requests an upgrade to client status
     * Sets the upgrade requested flag to true
     *
     * @return This Guest instance for method chaining
     */
    public Guest requestUpgrade() {
        this.upgradeRequested = true;
        return this;
    }

    /**
     * Cancels the upgrade request
     * Sets the upgrade requested flag to false
     *
     * @return This Guest instance for method chaining
     */
    public Guest cancelUpgradeRequest() {
        this.upgradeRequested = false;
        return this;
    }

    /**
     * Calculates the number of days since registration
     *
     * @return Number of days registered, or 0 if registration date is null
     */
    public long getDaysRegistered() {
        if (registrationDate == null) return 0;
        return ChronoUnit.DAYS.between(registrationDate, LocalDateTime.now());
    }

    /**
     * Checks if the guest is newly registered
     * New guests are those registered within the last 7 days
     *
     * @return true if new guest, false otherwise
     */
    public boolean isNewGuest() {
        return getDaysRegistered() <= 7;
    }

    /**
     * Gets the guest's full name from the associated user account
     *
     * @return Full name or empty string if user account is null
     */
    public String getFullName() {
        if (userAccount == null) return "";
        return (userAccount.getFirstName() + " " + userAccount.getLastName()).trim();
    }

    /**
     * Gets the guest's email from the associated user account
     *
     * @return Email address or empty string if user account is null
     */
    public String getEmail() {
        if (userAccount == null) return "";
        return userAccount.getEmail() != null ? userAccount.getEmail() : "";
    }

    /**
     * Checks if the guest account is currently active
     * Based on recent activity and account status
     *
     * @return true if guest is active, false otherwise
     */
    public boolean isActive() {
        if (userAccount == null) return false;
        return isRecentlyActive();
    }

    /**
     * Gets the guest's investment interest level description
     *
     * @return Description of interest level based on activity and registration
     */
    public String getInterestLevel() {
        if (upgradeRequested) return "High - Upgrade Requested";
        if (isRecentlyActive()) return "Medium - Recently Active";
        if (isNewGuest()) return "Low - New Registration";
        return "Low - Inactive";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Guest guest = (Guest) o;
        return upgradeRequested == guest.upgradeRequested &&
                Objects.equals(id, guest.id) &&
                Objects.equals(userAccount, guest.userAccount) &&
                Objects.equals(guestId, guest.guestId) &&
                Objects.equals(registrationDate, guest.registrationDate) &&
                Objects.equals(lastActivityDate, guest.lastActivityDate) &&
                Objects.equals(interestArea, guest.interestArea) &&
                Objects.equals(referralSource, guest.referralSource);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, userAccount, guestId, registrationDate, lastActivityDate,
                interestArea, referralSource, upgradeRequested);
    }

    @Override
    public String toString() {
        return "Guest{" +
                "id=" + id +
                ", userAccount=" + (userAccount != null ? userAccount.getEmail() : "null") +
                ", guestId='" + guestId + '\'' +
                ", registrationDate=" + registrationDate +
                ", lastActivityDate=" + lastActivityDate +
                ", interestArea='" + interestArea + '\'' +
                ", referralSource='" + referralSource + '\'' +
                ", upgradeRequested=" + upgradeRequested +
                ", fullName='" + getFullName() + '\'' +
                ", interestLevel='" + getInterestLevel() + '\'' +
                '}';
    }
}
