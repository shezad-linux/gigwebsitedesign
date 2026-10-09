package com.gigmatcher.saved;

import com.gigmatcher.gig.GigListing;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "saved_gigs", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "gig_id"})
})
public class SavedGig {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gig_id", nullable = false)
    private GigListing gig;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public SavedGig() {
    }

    public SavedGig(String id, String userId, GigListing gig) {
        this.id = id;
        this.userId = userId;
        this.gig = gig;
        this.createdAt = Instant.now();
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
