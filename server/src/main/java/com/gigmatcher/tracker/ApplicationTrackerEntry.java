package com.gigmatcher.tracker;

import com.gigmatcher.gig.GigListing;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "application_tracker_entries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "gig_id"})
})
public class ApplicationTrackerEntry {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gig_id", nullable = false)
    private GigListing gig;

    @Column(nullable = false, length = 50)
    private String status; // Shortlisted, Applied, Onboarding, Qualified, Active, Rejected, Withdrawn

    @Column(name = "applied_date")
    private LocalDate appliedDate;

    @Column(name = "last_updated", nullable = false)
    private LocalDate lastUpdated;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ApplicationTrackerEntry() {
    }

    public ApplicationTrackerEntry(String id, String userId, GigListing gig, String status,
                                  LocalDate appliedDate, String notes) {
        this.id = id;
        this.userId = userId;
        this.gig = gig;
        this.status = status;
        this.appliedDate = appliedDate;
        this.lastUpdated = LocalDate.now();
        this.notes = notes;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public GigListing getGig() {
        return gig;
    }

    public void setGig(GigListing gig) {
        this.gig = gig;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public LocalDate getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDate lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
