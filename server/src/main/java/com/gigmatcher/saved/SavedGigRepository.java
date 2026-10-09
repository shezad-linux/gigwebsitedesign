package com.gigmatcher.saved;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedGigRepository extends JpaRepository<SavedGig, String> {
    List<SavedGig> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<SavedGig> findByUserIdAndGigId(String userId, String gigId);
    boolean existsByUserIdAndGigId(String userId, String gigId);
    void deleteByUserIdAndGigId(String userId, String gigId);
}
