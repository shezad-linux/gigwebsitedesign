package com.gigmatcher.tracker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationTrackerRepository extends JpaRepository<ApplicationTrackerEntry, String> {
    List<ApplicationTrackerEntry> findByUserIdOrderByLastUpdatedDesc(String userId);
    Optional<ApplicationTrackerEntry> findByIdAndUserId(String id, String userId);
    Optional<ApplicationTrackerEntry> findByUserIdAndGigId(String userId, String gigId);
}
