package com.gigmatcher.admin;

import com.gigmatcher.common.ApiResponse;
import com.gigmatcher.common.ResourceNotFoundException;
import com.gigmatcher.gig.GigListing;
import com.gigmatcher.gig.GigRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/gigs")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminGigController {

    private final GigRepository gigRepository;

    public AdminGigController(GigRepository gigRepository) {
        this.gigRepository = gigRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GigListing>>> getAllGigsAdmin() {
        List<GigListing> list = gigRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<GigListing>> createGigAdmin(@RequestBody GigListing gig) {
        if (gig.getId() == null || gig.getId().isBlank()) {
            gig.setId("gig_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        }
        if (gig.getSlug() == null || gig.getSlug().isBlank()) {
            gig.setSlug(gig.getTitle().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        }
        gig.setCreatedAt(Instant.now());
        gig.setUpdatedAt(Instant.now());
        gig.setLastReviewedAt(Instant.now());

        GigListing saved = gigRepository.save(gig);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Listing created", saved));
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<GigListing>> updateGigAdmin(@PathVariable String id,
                                                                 @RequestBody GigListing updates) {
        GigListing gig = gigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found: " + id));

        if (updates.getTitle() != null) gig.setTitle(updates.getTitle());
        if (updates.getPlatformName() != null) gig.setPlatformName(updates.getPlatformName());
        if (updates.getCategory() != null) gig.setCategory(updates.getCategory());
        if (updates.getDescription() != null) gig.setDescription(updates.getDescription());
        if (updates.getRemote() != null) gig.setRemote(updates.getRemote());
        if (updates.getPayAmount() != null) gig.setPayAmount(updates.getPayAmount());
        if (updates.getPayCurrency() != null) gig.setPayCurrency(updates.getPayCurrency());
        if (updates.getPayUnit() != null) gig.setPayUnit(updates.getPayUnit());
        if (updates.getPayTermsNote() != null) gig.setPayTermsNote(updates.getPayTermsNote());
        if (updates.getPaymentVerification() != null) gig.setPaymentVerification(updates.getPaymentVerification());
        if (updates.getEligibilityVerification() != null) gig.setEligibilityVerification(updates.getEligibilityVerification());
        if (updates.getOfficialUrl() != null) gig.setOfficialUrl(updates.getOfficialUrl());
        if (updates.getSponsored() != null) gig.setSponsored(updates.getSponsored());
        if (updates.getAvailabilityStatus() != null) gig.setAvailabilityStatus(updates.getAvailabilityStatus());
        if (updates.getSkillsRequiredJson() != null) gig.setSkillsRequiredJson(updates.getSkillsRequiredJson());
        if (updates.getEligibleCountriesJson() != null) gig.setEligibleCountriesJson(updates.getEligibleCountriesJson());
        if (updates.getOnboardingStepsJson() != null) gig.setOnboardingStepsJson(updates.getOnboardingStepsJson());

        gig.setUpdatedAt(Instant.now());
        GigListing saved = gigRepository.save(gig);
        return ResponseEntity.ok(ApiResponse.ok("Listing updated", saved));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteGigAdmin(@PathVariable String id) {
        if (!gigRepository.existsById(id)) {
            throw new ResourceNotFoundException("Gig not found: " + id);
        }
        gigRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Listing deleted", null));
    }
}
