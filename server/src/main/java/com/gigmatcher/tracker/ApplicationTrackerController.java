package com.gigmatcher.tracker;

import com.gigmatcher.common.ApiResponse;
import com.gigmatcher.common.ResourceNotFoundException;
import com.gigmatcher.gig.GigListing;
import com.gigmatcher.gig.GigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me/applications")
public class ApplicationTrackerController {

    private final ApplicationTrackerRepository trackerRepository;
    private final GigRepository gigRepository;

    public ApplicationTrackerController(ApplicationTrackerRepository trackerRepository,
                                        GigRepository gigRepository) {
        this.trackerRepository = trackerRepository;
        this.gigRepository = gigRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ApplicationTrackerEntry>>> getMyApplications(Authentication auth) {
        String userId = auth.getName();
        List<ApplicationTrackerEntry> entries = trackerRepository.findByUserIdOrderByLastUpdatedDesc(userId);
        return ResponseEntity.ok(ApiResponse.ok(entries));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<ApplicationTrackerEntry>> createOrUpdateEntry(
            @RequestBody ApplicationTrackerDto dto,
            Authentication auth) {
        String userId = auth.getName();

        return trackerRepository.findByUserIdAndGigId(userId, dto.getGigId())
                .map(existing -> {
                    if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
                    if (dto.getNotes() != null) existing.setNotes(dto.getNotes());
                    if (dto.getAppliedDate() != null) existing.setAppliedDate(dto.getAppliedDate());
                    existing.setLastUpdated(LocalDate.now());
                    existing.setUpdatedAt(Instant.now());
                    trackerRepository.save(existing);
                    return ResponseEntity.ok(ApiResponse.ok("Application updated", existing));
                })
                .orElseGet(() -> {
                    GigListing gig = gigRepository.findById(dto.getGigId())
                            .orElseThrow(() -> new ResourceNotFoundException("Gig not found: " + dto.getGigId()));
                    String id = "app_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
                    ApplicationTrackerEntry entry = new ApplicationTrackerEntry(
                            id,
                            userId,
                            gig,
                            dto.getStatus() != null ? dto.getStatus() : "Shortlisted",
                            dto.getAppliedDate() != null ? dto.getAppliedDate() : LocalDate.now(),
                            dto.getNotes() != null ? dto.getNotes() : ""
                    );
                    trackerRepository.save(entry);
                    return ResponseEntity.ok(ApiResponse.ok("Application tracked", entry));
                });
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<ApplicationTrackerEntry>> updateStatus(
            @PathVariable String id,
            @RequestBody ApplicationTrackerDto dto,
            Authentication auth) {
        String userId = auth.getName();

        ApplicationTrackerEntry entry = trackerRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application entry not found: " + id));

        if (dto.getStatus() != null) entry.setStatus(dto.getStatus());
        if (dto.getNotes() != null) entry.setNotes(dto.getNotes());
        if (dto.getAppliedDate() != null) entry.setAppliedDate(dto.getAppliedDate());
        entry.setLastUpdated(LocalDate.now());
        entry.setUpdatedAt(Instant.now());

        trackerRepository.save(entry);
        return ResponseEntity.ok(ApiResponse.ok("Application updated", entry));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteEntry(@PathVariable String id, Authentication auth) {
        String userId = auth.getName();
        ApplicationTrackerEntry entry = trackerRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application entry not found: " + id));

        trackerRepository.delete(entry);
        return ResponseEntity.ok(ApiResponse.ok("Application entry removed", null));
    }
}
