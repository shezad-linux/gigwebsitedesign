package com.gigmatcher.gig;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GigRepository extends JpaRepository<GigListing, String> {

    Optional<GigListing> findBySlug(String slug);

    @Query("SELECT g FROM GigListing g WHERE " +
           "(:category IS NULL OR LOWER(g.category) = LOWER(:category)) AND " +
           "(:search IS NULL OR LOWER(g.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(g.platformName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:paymentVerification IS NULL OR LOWER(g.paymentVerification) = LOWER(:paymentVerification)) AND " +
           "(:remoteOnly IS NULL OR :remoteOnly = false OR g.remote = true) " +
           "ORDER BY g.sponsored DESC, g.createdAt DESC")
    List<GigListing> searchGigs(@Param("category") String category,
                                @Param("search") String search,
                                @Param("paymentVerification") String paymentVerification,
                                @Param("remoteOnly") Boolean remoteOnly);
}
